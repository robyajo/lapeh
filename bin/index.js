#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');

const args = process.argv.slice(2);
const command = args[0];

// Telemetry Logic
async function sendTelemetry(cmd, errorInfo = null) {
  try {
    const os = require('os');
    
    const payload = {
      command: cmd,
      nodeVersion: process.version,
      osPlatform: os.platform(),
      osRelease: os.release(),
      timestamp: new Date().toISOString()
    };

    if (errorInfo) {
        payload.error = errorInfo.message;
        payload.stack = errorInfo.stack;
    }

    const data = JSON.stringify(payload);

    // Parse URL from env or use default
    const apiUrl = process.env.LAPEH_API_URL || 'https://lapeh-doc.vercel.app/api/telemetry';
    const url = new URL(apiUrl);
    const isHttps = url.protocol === 'https:';
    const client = isHttps ? require('https') : require('http');

    const options = {
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      },
      timeout: 2000 // Slightly longer for crash reports
    };

    const req = client.request(options, (res) => {
      res.resume();
    });
    
    req.on('error', (e) => {
      // Silent fail
    });

    req.write(data);
    req.end();
  } catch (e) {
    // Silent fail
  }
}

// Global Error Handler for Crash Reporting
process.on('uncaughtException', async (err) => {
  console.error('❌ Unexpected Error:', err);
  console.log('📝 Sending crash report...');
  try {
     sendTelemetry(command || 'unknown', err);
     
     // Give it a moment to send
     setTimeout(() => {
         process.exit(1);
     }, 1000);
  } catch (e) {
      process.exit(1);
  }
});

// Send telemetry for every command (only if not crashing immediately)
sendTelemetry(command || 'init');

switch (command) {
  case 'dev':
    runDev();
    break;
  case 'start':
    runStart();
    break;
  case 'build':
    runBuild();
    break;
  case 'upgrade':
    (async () => {
      await upgradeProject();
    })();
    break;
  case 'init':
  case 'create':
    createProject(true);
    break;
  default:
    createProject(false);
    break;
}

function runDev() {
  console.log('🚀 Starting Lapeh in development mode...');
  try {
    // Generate Prisma Client before starting
    console.log('🔄 Generating Prisma Client...');
    const compileSchemaPath = path.join(process.cwd(), 'scripts/compile-schema.js');
    if (fs.existsSync(compileSchemaPath)) {
        try {
            execSync('node scripts/compile-schema.js', { stdio: 'inherit' });
        } catch (e) {
            console.warn('⚠️  Failed to run compile-schema.js', e.message);
        }
    }
    
    try {
        execSync('npx prisma generate', { stdio: 'inherit' });
    } catch (e) {
        console.warn('⚠️  Failed to run prisma generate. Continuing...', e.message);
    }

    const tsNodePath = require.resolve('ts-node/register');
    const tsConfigPathsPath = require.resolve('tsconfig-paths/register');
    
    // Resolve bootstrap file
    // 1. Try to find it in the current project's node_modules (preferred)
    const localBootstrapPath = path.join(process.cwd(), 'node_modules/lapeh/lib/bootstrap.ts');
    
    // 2. Fallback to relative to this script (if running from source or global cache without local install)
    const fallbackBootstrapPath = path.resolve(__dirname, '../lib/bootstrap.ts');
    
    const bootstrapPath = fs.existsSync(localBootstrapPath) ? localBootstrapPath : fallbackBootstrapPath;

    // We execute a script that requires ts-node to run lib/bootstrap.ts
    // Use JSON.stringify to properly escape paths for the shell command
    const nodeArgs = `-r ${JSON.stringify(tsNodePath)} -r ${JSON.stringify(tsConfigPathsPath)} ${JSON.stringify(bootstrapPath)}`;
    const isWin = process.platform === 'win32';
    
    let cmd;
    if (isWin) {
      // On Windows, escape inner quotes
      const escapedArgs = nodeArgs.replace(/"/g, '\\"');
      cmd = `npx nodemon --watch src --watch lib --ext ts,json --exec "node ${escapedArgs}"`;
    } else {
      // On Linux/Mac, use single quotes for the outer wrapper
      cmd = `npx nodemon --watch src --watch lib --ext ts,json --exec 'node ${nodeArgs}'`;
    }
    
    execSync(cmd, { stdio: 'inherit' });
  } catch (error) {
    // Ignore error
  }
}

function runStart() {
  console.log('🚀 Starting Lapeh production server...');
  
  let bootstrapPath;
  try {
     const projectNodeModules = path.join(process.cwd(), 'node_modules');
     const lapehDist = path.join(projectNodeModules, 'lapeh', 'dist', 'lib', 'bootstrap.js');
     const lapehLib = path.join(projectNodeModules, 'lapeh', 'lib', 'bootstrap.js');
     
     if (fs.existsSync(lapehDist)) {
         bootstrapPath = lapehDist;
     } else if (fs.existsSync(lapehLib)) {
         bootstrapPath = path.resolve(__dirname, '../lib/bootstrap.js');
         if (!fs.existsSync(bootstrapPath)) {
             bootstrapPath = path.resolve(__dirname, '../dist/lib/bootstrap.js');
         }
     }
     
     const frameworkBootstrap = require('../lib/bootstrap');
     frameworkBootstrap.bootstrap();
     return;
     
  } catch (e) {
  }

  const possiblePaths = [
      path.join(__dirname, '../lib/bootstrap.js'),
      path.join(__dirname, '../dist/lib/bootstrap.js'),
      path.join(process.cwd(), 'node_modules/lapeh/lib/bootstrap.js')
  ];
  
  bootstrapPath = possiblePaths.find(p => fs.existsSync(p));

  if (!bootstrapPath) {
      console.error('❌ Could not find Lapeh bootstrap file.');
      console.error('   Searched in:', possiblePaths);
      process.exit(1);
  }

  let cmd;
  if (bootstrapPath.endsWith('.ts')) {
      let tsNodePath;
      let tsConfigPathsPath;
      
      try {
          const projectNodeModules = path.join(process.cwd(), 'node_modules');
          tsNodePath = require.resolve('ts-node/register', { paths: [projectNodeModules, __dirname] });
          tsConfigPathsPath = require.resolve('tsconfig-paths/register', { paths: [projectNodeModules, __dirname] });
      } catch (e) {
          try {
             tsNodePath = require.resolve('ts-node/register');
             tsConfigPathsPath = require.resolve('tsconfig-paths/register');
          } catch (e2) {
             console.warn('⚠️  Could not resolve ts-node/register. Trying npx...');
          }
      }
      
      if (tsNodePath && tsConfigPathsPath) {
          const script = `require(${JSON.stringify(bootstrapPath)}).bootstrap()`;
          cmd = `node -r ${JSON.stringify(tsNodePath)} -r ${JSON.stringify(tsConfigPathsPath)} -e ${JSON.stringify(script)}`;
      } else {
          const script = `require(${JSON.stringify(bootstrapPath)}).bootstrap()`;
          cmd = `npx ts-node -r tsconfig-paths/register -e ${JSON.stringify(script)}`;
      }
  } else {
      const script = `require(${JSON.stringify(bootstrapPath)}).bootstrap()`;
      cmd = `node -e ${JSON.stringify(script)}`;
  }

  execSync(cmd, { 
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'production' }
  });
}

function runBuild() {
  console.log('🛠️  Building Lapeh project...');
  
  const compileSchemaPath = path.join(process.cwd(), 'scripts/compile-schema.js');
  if (fs.existsSync(compileSchemaPath)) {
      try {
          execSync('node scripts/compile-schema.js', { stdio: 'inherit' });
      } catch (e) {
          console.error('❌ Failed to compile schema.');
          process.exit(1);
      }
  }

  try {
      execSync('npx prisma generate', { stdio: 'inherit' });
  } catch (e) {
      console.error('❌ Failed to generate prisma client.');
      process.exit(1);
  }

  try {
      execSync('npx tsc -p tsconfig.build.json && npx tsc-alias -p tsconfig.build.json', { stdio: 'inherit' });
  } catch (e) {
      console.error('❌ Build failed.');
      process.exit(1);
  }
  
  console.log('✅ Build complete.');
}

async function upgradeProject() {
  const currentDir = process.cwd();
  const templateDir = path.join(__dirname, '..');
  
  console.log(`🚀 Upgrading Lapeh project in ${currentDir}...`);

  const packageJsonPath = path.join(currentDir, 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    console.error('❌ No package.json found. Are you in the root of a Lapeh project?');
    process.exit(1);
  }

  const filesToSync = [
    'lib',
    'scripts',
    'docker-compose.yml',
    '.env.example',
    '.vscode',
    'tsconfig.json',
    'README.md',
    'ecosystem.config.js',
    'src/redis.ts',
    'src/prisma.ts',
    'prisma/base.prisma.template', // Sync base template for upgrade
    'prisma.config.ts' // Sync prisma config for upgrade
  ];

  function syncDirectory(src, dest, clean = false) {
    if (!fs.existsSync(src)) return;
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });

    const srcEntries = fs.readdirSync(src, { withFileTypes: true });
    const srcEntryNames = new Set();

    for (const entry of srcEntries) {
      srcEntryNames.add(entry.name);
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);

      if (entry.isDirectory()) {
        syncDirectory(srcPath, destPath, clean);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }

    if (clean) {
      const destEntries = fs.readdirSync(dest, { withFileTypes: true });
      for (const entry of destEntries) {
        if (!srcEntryNames.has(entry.name)) {
            const destPath = path.join(dest, entry.name);
            console.log(`🗑️  Removing obsolete file/directory: ${destPath}`);
            if (entry.isDirectory()) {
                fs.rmSync(destPath, { recursive: true, force: true });
            } else {
                fs.unlinkSync(destPath);
            }
        }
      }
    }
  }

  // Rename .model -> .prisma (Legacy migration)
  const modelsDir = path.join(currentDir, 'src', 'models');
  if (fs.existsSync(modelsDir)) {
    console.log('🔄 Checking for legacy .model files...');
    const files = fs.readdirSync(modelsDir);
    let renamedCount = 0;
    files.forEach(file => {
      if (file.endsWith('.model')) {
        const oldPath = path.join(modelsDir, file);
        const newPath = path.join(modelsDir, file.replace('.model', '.prisma'));
        fs.renameSync(oldPath, newPath);
        renamedCount++;
      }
    });
    if (renamedCount > 0) {
      console.log(`✅ Migrated ${renamedCount} files from .model to .prisma`);
    }
  }

  for (const item of filesToSync) {
    const srcPath = path.join(templateDir, item);
    const destPath = path.join(currentDir, item);
    
    if (fs.existsSync(srcPath)) {
      const stats = fs.statSync(srcPath);
      if (stats.isDirectory()) {
          console.log(`🔄 Syncing directory ${item}...`);
          syncDirectory(srcPath, destPath, item === 'lib');
      } else {
          console.log(`🔄 Updating file ${item}...`);
          const destDir = path.dirname(destPath);
          if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
          fs.copyFileSync(srcPath, destPath);
      }
    }
  }

  console.log('📝 Updating package.json...');
  const currentPackageJson = require(packageJsonPath);
  
  // Capture original dependency before merging
  const originalLapehDep = currentPackageJson.dependencies && currentPackageJson.dependencies["lapeh"];

  const templatePackageJson = require(path.join(templateDir, 'package.json'));

  currentPackageJson.scripts = {
    ...currentPackageJson.scripts,
    ...templatePackageJson.scripts,
    "dev": "lapeh dev",
    "start": "lapeh start",
    "build": "lapeh build",
    "start:prod": "lapeh start"
  };

  currentPackageJson.dependencies = {
    ...currentPackageJson.dependencies,
    ...templatePackageJson.dependencies
  };
  
  currentPackageJson.devDependencies = {
    ...currentPackageJson.devDependencies,
    ...templatePackageJson.devDependencies
  };

  const frameworkPackageJson = require(path.join(templateDir, 'package.json'));
  
  if (originalLapehDep && originalLapehDep.startsWith('file:')) {
      console.log(`ℹ️  Preserving local 'lapeh' dependency: ${originalLapehDep}`);
      currentPackageJson.dependencies["lapeh"] = originalLapehDep;
  } else {
      if (__dirname.includes('node_modules')) {
         currentPackageJson.dependencies["lapeh"] = `^${frameworkPackageJson.version}`;
      } else {
         const lapehPath = path.resolve(__dirname, '..').replace(/\\/g, '/');
         currentPackageJson.dependencies["lapeh"] = `file:${lapehPath}`;
      }
  }

  fs.writeFileSync(packageJsonPath, JSON.stringify(currentPackageJson, null, 2));

  console.log('🔧 Configuring tsconfig.json...');
  const tsconfigPath = path.join(currentDir, 'tsconfig.json');
  if (fs.existsSync(tsconfigPath)) {
    const tsconfig = require(tsconfigPath);
    if (tsconfig.compilerOptions && tsconfig.compilerOptions.paths) {
      tsconfig.compilerOptions.paths["@lapeh/*"] = ["./node_modules/lapeh/dist/lib/*"];
    }
    tsconfig["ts-node"] = {
      "ignore": ["node_modules/(?!lapeh)"]
    };
    fs.writeFileSync(tsconfigPath, JSON.stringify(tsconfig, null, 2));
  }

  console.log('📦 Installing updated dependencies...');
  try {
    execSync('npm install', { cwd: currentDir, stdio: 'inherit' });
  } catch (error) {
    console.error('❌ Error installing dependencies.');
    process.exit(1);
  }

  console.log('\n✅ Upgrade completed successfully!');
  console.log('   Please check your .env file against .env.example for any new required variables.');
}

function createProject(skipFirstArg = false) {
  const searchArgs = skipFirstArg ? args.slice(1) : args;
  const projectName = searchArgs.find(arg => !arg.startsWith('-'));
  const isFull = args.includes('--full');
  const useDefaults = args.includes('--defaults') || args.includes('--default') || args.includes('-y');

  if (!projectName) {
    console.error('❌ Please specify the project name:');
    console.error('   npx lapeh-cli <project-name> [--full] [--defaults|-y]');
    process.exit(1);
  }

  const currentDir = process.cwd();
  const projectDir = path.join(currentDir, projectName);
  const templateDir = path.join(__dirname, '..');

  if (fs.existsSync(projectDir)) {
    console.error(`❌ Directory ${projectName} already exists.`);
    process.exit(1);
  }

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const ask = (query, defaultVal) => {
    return new Promise((resolve) => {
      rl.question(`${query} ${defaultVal ? `[${defaultVal}]` : ""}: `, (answer) => {
        resolve(answer.trim() || defaultVal);
      });
    });
  };

  const selectOption = async (query, options) => {
    console.log(query);
    options.forEach((opt, idx) => {
      console.log(`   [${opt.key}] ${opt.label}`);
    });
    
    while (true) {
      const answer = await ask(">", options[0].key);
      const selected = options.find(o => o.key.toLowerCase() === answer.toLowerCase());
      if (selected) return selected;
      
      const byLabel = options.find(o => o.label.toLowerCase().includes(answer.toLowerCase()));
      if (byLabel) return byLabel;

      console.log("Pilihan tidak valid. Silakan coba lagi.");
    }
  };

  (async () => {
    console.log(`🚀 Creating a new API Lapeh project in ${projectDir}...`);
    fs.mkdirSync(projectDir);

    console.log("\n--- ORM Configuration ---");
    let usePrisma = true;
    
    if (!useDefaults) {
      const ormChoice = await selectOption("Apakah ingin menggunakan ORM (Prisma)?", [
        { key: "Y", label: "Ya (Disarankan)" },
        { key: "T", label: "Tidak (Setup Manual)" }
      ]);
      usePrisma = ormChoice.key === "Y";
    }

    let dbType, host, port, user, password, dbName;
    let dbUrl = "";
    let dbProvider = "postgresql";

    if (usePrisma) {
      if (useDefaults) {
         console.log("ℹ️  Using default database configuration (PostgreSQL)...");
         dbType = { key: "pgsql", label: "PostgreSQL", provider: "postgresql", defaultPort: "5432" };
         host = "localhost";
         port = "5432";
         user = "postgres";
         password = "password";
         dbName = projectName.replace(/-/g, '_');
      } else {
         console.log("\n--- Database Configuration ---");
         dbType = await selectOption("Database apa yang akan digunakan?", [
           { key: "pgsql", label: "PostgreSQL", provider: "postgresql", defaultPort: "5432" },
           { key: "mysql", label: "MySQL", provider: "mysql", defaultPort: "3306" },
         ]);

         host = await ask("Database Host", "localhost");
         port = await ask("Database Port", dbType.defaultPort);
         user = await ask("Database User", "root");
         password = await ask("Database Password", "");
         dbName = await ask("Database Name", projectName.replace(/-/g, '_'));
      }
      
      dbProvider = dbType.provider;
      if (dbType.key === "pgsql") {
        dbUrl = `postgresql://${user}:${password}@${host}:${port}/${dbName}?schema=public`;
      } else if (dbType.key === "mysql") {
        dbUrl = `mysql://${user}:${password}@${host}:${port}/${dbName}`;
      }
    } else {
       console.log("ℹ️  Skipping ORM setup. You will need to configure your own database access.");
    }
    
    const ignoreList = [
      'node_modules', 'dist', '.git', '.env', 'bin', 'lib', 
      'package-lock.json', '.DS_Store', 'prisma/migrations', 
      'prisma/dev.db', 'prisma/dev.db-journal', 'website', 
      'init', 'test-local-run', 'coverage', projectName
    ];

    function copyDir(src, dest) {
      const entries = fs.readdirSync(src, { withFileTypes: true });
      for (const entry of entries) {
        if (ignoreList.includes(entry.name)) continue;
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);

        if (entry.name === 'migrations' && srcPath.includes('prisma')) continue;

        if (entry.isDirectory()) {
          fs.mkdirSync(destPath);
          copyDir(srcPath, destPath);
        } else {
          fs.copyFileSync(srcPath, destPath);
        }
      }
    }

    console.log('\n📂 Copying template files...');
    copyDir(templateDir, projectDir);

    const gitignoreTemplate = path.join(projectDir, 'gitignore.template');
    if (fs.existsSync(gitignoreTemplate)) {
        fs.renameSync(gitignoreTemplate, path.join(projectDir, '.gitignore'));
    }

    console.log('⚙️  Configuring environment...');
    const envExamplePath = path.join(projectDir, '.env.example');
    const envPath = path.join(projectDir, '.env');
    
    if (fs.existsSync(envExamplePath)) {
      let envContent = fs.readFileSync(envExamplePath, 'utf8');
      if (usePrisma) {
        envContent = envContent.replace(/DATABASE_URL=".+"/g, `DATABASE_URL="${dbUrl}"`);
        envContent = envContent.replace(/DATABASE_URL=.+/g, `DATABASE_URL="${dbUrl}"`);
        envContent = envContent.replace(/DATABASE_PROVIDER=".+"/g, `DATABASE_PROVIDER="${dbProvider}"`);
        envContent = envContent.replace(/DATABASE_PROVIDER=.+/g, `DATABASE_PROVIDER="${dbProvider}"`);
      } else {
        envContent = envContent.replace(/DATABASE_URL=".+"/g, `DATABASE_URL=""`);
        envContent = envContent.replace(/DATABASE_URL=.+/g, `DATABASE_URL=""`);
        envContent = envContent.replace(/DATABASE_PROVIDER=".+"/g, `DATABASE_PROVIDER="none"`);
        envContent = envContent.replace(/DATABASE_PROVIDER=.+/g, `DATABASE_PROVIDER="none"`);
      }
      fs.writeFileSync(envPath, envContent);
    }

    console.log('📝 Updating package.json...');
    const packageJsonPath = path.join(projectDir, 'package.json');
    const packageJson = require(packageJsonPath);
    packageJson.name = projectName;
    
    const frameworkPackageJson = require(path.join(__dirname, '../package.json'));
    if (__dirname.includes('node_modules')) {
       packageJson.dependencies["lapeh"] = `^${frameworkPackageJson.version}`;
    } else {
       const lapehPath = path.resolve(__dirname, '..').replace(/\\/g, '/');
       packageJson.dependencies["lapeh"] = `file:${lapehPath}`;
    }
    
    packageJson.version = '1.0.0';
    delete packageJson.bin;
    
    packageJson.scripts = {
      ...packageJson.scripts,
      "dev": "lapeh dev",
      "start": "lapeh start",
      "build": "lapeh build",
      "start:prod": "lapeh start"
    };
    
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

    // Update tsconfig.json for aliases
    const tsconfigPath = path.join(projectDir, 'tsconfig.json');
    if (fs.existsSync(tsconfigPath)) {
      try {
        const tsconfig = require(tsconfigPath);
        if (!tsconfig.compilerOptions) tsconfig.compilerOptions = {};
        if (!tsconfig.compilerOptions.paths) tsconfig.compilerOptions.paths = {};
        
        // Ensure @lapeh/* points to the installed package
        tsconfig.compilerOptions.paths["@lapeh/*"] = ["./node_modules/lapeh/dist/lib/*"];
        
        fs.writeFileSync(tsconfigPath, JSON.stringify(tsconfig, null, 2));
      } catch (e) {
        console.warn('⚠️  Failed to update tsconfig.json aliases.');
      }
    }

    const prismaBaseFile = path.join(projectDir, "prisma", "base.prisma.template");
    if (usePrisma && fs.existsSync(prismaBaseFile)) {
       let baseContent = fs.readFileSync(prismaBaseFile, "utf8");
       // Update provider
       baseContent = baseContent.replace(
        /(datasource\s+db\s+\{[\s\S]*?provider\s*=\s*")[^"]+(")/, 
        `$1${dbProvider}$2`
      );
      fs.writeFileSync(prismaBaseFile, baseContent);
    }

    console.log('📦 Installing dependencies...');
    try {
      execSync('npm install', { cwd: projectDir, stdio: 'inherit' });
    } catch (e) {
      console.error('❌ Error installing dependencies.');
      process.exit(1);
    }

    try {
      execSync('npm run generate:jwt', { cwd: projectDir, stdio: 'inherit' });
    } catch (e) {}

    if (usePrisma) {
      console.log('🗄️ Setting up database...');
      try {
        execSync('node scripts/compile-schema.js', { cwd: projectDir, stdio: 'inherit' });
        
        console.log('   Running migration...');
        if (dbProvider === 'mongodb') {
           execSync('npx prisma db push', { cwd: projectDir, stdio: 'inherit' });
        } else {
           // For Prisma v7, ensure prisma.config.ts is used/detected
           execSync('npx prisma migrate dev --name init_setup', { cwd: projectDir, stdio: 'inherit' });
        }

        let runSeed = false;
        if (!useDefaults) {
           const seedChoice = await selectOption("Jalankan seeder?", [
             { key: "Y", label: "Ya" },
             { key: "T", label: "Tidak" }
           ]);
           runSeed = seedChoice.key === "Y";
        } else {
            runSeed = isFull;
        }

        if (runSeed) {
           console.log('   Seeding database...');
           execSync('npm run db:seed', { cwd: projectDir, stdio: 'inherit' });
        }
      } catch (e) {
         console.warn('⚠️  Database setup failed. Check .env and run manually.');
      }
    }

    console.log(`\n✅ Project ${projectName} created successfully!`);
    rl.close();
  })();
}
