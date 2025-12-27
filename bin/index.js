#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');

const args = process.argv.slice(2);
const command = args[0];

// Register tsconfig paths for development
// require('tsconfig-paths/register');

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
  default:
    createProject();
    break;
}

function runDev() {
  console.log('🚀 Starting Lapeh in development mode...');
  try {
    const tsNodePath = require.resolve('ts-node/register');
    const tsConfigPathsPath = require.resolve('tsconfig-paths/register');
    
    // Resolve bootstrap file
    // 1. Try to find it in the current project's node_modules (preferred)
    const localBootstrapPath = path.join(process.cwd(), 'node_modules/lapeh/lib/bootstrap.ts');
    
    // 2. Fallback to relative to this script (if running from source or global cache without local install)
    const fallbackBootstrapPath = path.resolve(__dirname, '../lib/bootstrap.ts');
    
    const bootstrapPath = fs.existsSync(localBootstrapPath) ? localBootstrapPath : fallbackBootstrapPath;

    // We execute a script that requires ts-node to run lib/bootstrap.ts
    execSync(`npx nodemon --watch src --watch lib --ext ts,json --exec "node -r ${tsNodePath} -r ${tsConfigPathsPath} ${bootstrapPath}"`, { stdio: 'inherit' });
  } catch (error) {
    // Ignore error
  }
}

function runStart() {
  console.log('🚀 Starting Lapeh production server...');
  const distPath = path.join(process.cwd(), 'dist/lib/bootstrap.js');
  // For production, we assume built files
  const cmd = `node -e "require('${distPath.replace(/\\/g, '/')}').bootstrap()"`;
  execSync(cmd, { 
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'production' }
  });
}

function runBuild() {
  console.log('🛠️  Building Lapeh project...');
  execSync('npm run prisma:generate', { stdio: 'inherit' });
  execSync('npx tsc && npx tsc-alias', { stdio: 'inherit' });
  console.log('✅ Build complete.');
}

async function upgradeProject() {
  const currentDir = process.cwd();
  const templateDir = path.join(__dirname, '..');
  
  console.log(`🚀 Upgrading Lapeh project in ${currentDir}...`);

  // Check if package.json exists
  const packageJsonPath = path.join(currentDir, 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    console.error('❌ No package.json found. Are you in the root of a Lapeh project?');
    process.exit(1);
  }

  // Files/Folders to overwrite/copy
  const filesToSync = [
    'bin', // Ensure CLI script is updated
    'lib', // Ensure core framework files are updated
    'scripts',
    'docker-compose.yml',
    '.env.example',
    '.vscode',
    'tsconfig.json',
    'README.md',
    'src/redis.ts', // Core framework file
    'src/prisma.ts', // Core framework file
  ];

  // Helper to copy recursive
  function copyRecursive(src, dest) {
    if (!fs.existsSync(src)) return;
    const stats = fs.statSync(src);
    if (stats.isDirectory()) {
      if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
      fs.readdirSync(src).forEach(childItemName => {
        copyRecursive(path.join(src, childItemName), path.join(dest, childItemName));
      });
    } else {
      // Ensure destination directory exists
      const destDir = path.dirname(dest);
      if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
      fs.copyFileSync(src, dest);
    }
  }

  // 1. Migration: Rename .model -> .prisma
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
      console.log(`🔄 Updating ${item}...`);
      copyRecursive(srcPath, destPath);
    }
  }

  // Merge package.json
  console.log('📝 Updating package.json...');
  const currentPackageJson = require(packageJsonPath);
  const templatePackageJson = require(path.join(templateDir, 'package.json'));

  // Update scripts
  currentPackageJson.scripts = {
    ...currentPackageJson.scripts,
    ...templatePackageJson.scripts,
    "dev": "lapeh dev",
    "start": "lapeh start",
    "build": "lapeh build",
    "start:prod": "lapeh start"
  };

  // Update dependencies
  currentPackageJson.dependencies = {
    ...currentPackageJson.dependencies,
    ...templatePackageJson.dependencies
  };
  
  // Update devDependencies
  currentPackageJson.devDependencies = {
    ...currentPackageJson.devDependencies,
    ...templatePackageJson.devDependencies
  };

  // Update Lapeh version tag
  // For local development, we use file reference. For production publish, use version.
  currentPackageJson.dependencies["lapeh"] = "file:../"; 

  fs.writeFileSync(packageJsonPath, JSON.stringify(currentPackageJson, null, 2));

  // Update tsconfig.json to support framework-as-dependency
  console.log('🔧 Configuring tsconfig.json...');
  const tsconfigPath = path.join(currentDir, 'tsconfig.json');
  if (fs.existsSync(tsconfigPath)) {
    // Use comment-json or just basic parsing if no comments (standard JSON)
    // Since our template tsconfig is standard JSON, require is fine or JSON.parse
    const tsconfig = require(tsconfigPath);
    
    // Update paths
    if (tsconfig.compilerOptions && tsconfig.compilerOptions.paths) {
      tsconfig.compilerOptions.paths["@lapeh/*"] = ["./node_modules/lapeh/lib/*"];
    }

    // Add ts-node ignore configuration
    tsconfig["ts-node"] = {
      "ignore": ["node_modules/(?!lapeh)"]
    };

    fs.writeFileSync(tsconfigPath, JSON.stringify(tsconfig, null, 2));
  }

  // Run npm install
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

function createProject() {
  const projectName = args.find(arg => !arg.startsWith('-'));
  const isFull = args.includes('--full');
  // Allow -y alias for --defaults
  const useDefaults = args.includes('--defaults') || args.includes('-y');

  // Helper to parse arguments like --key=value
  const getArg = (key) => {
    const prefix = `--${key}=`;
    const arg = args.find(a => a.startsWith(prefix));
    return arg ? arg.substring(prefix.length) : undefined;
  };

  const dbTypeArg = getArg('db-type');
  const dbHostArg = getArg('db-host');
  const dbPortArg = getArg('db-port');
  const dbUserArg = getArg('db-user');
  const dbPassArg = getArg('db-pass');
  const dbNameArg = getArg('db-name');

  if (!projectName) {
    console.error('❌ Please specify the project name:');
    console.error('   npx lapeh-cli <project-name> [--full] [--defaults|-y]');
    console.error('   Options:');
    console.error('     --full        : Run full setup including seed and dev server');
    console.error('     --defaults, -y: Use default configuration (can be overridden with args)');
    console.error('     --db-type=    : pgsql | mysql');
    console.error('     --db-host=    : Database host');
    console.error('     --db-port=    : Database port');
    console.error('     --db-user=    : Database user');
    console.error('     --db-pass=    : Database password');
    console.error('     --db-name=    : Database name');
    console.error('   OR');
    console.error('   npx lapeh-cli upgrade (inside existing project)');
    process.exit(1);
  }

  const currentDir = process.cwd();
  const projectDir = path.join(currentDir, projectName);
  const templateDir = path.join(__dirname, '..');

  if (fs.existsSync(projectDir)) {
    console.error(`❌ Directory ${projectName} already exists.`);
    process.exit(1);
  }

  // Setup readline interface
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

    // --- DATABASE SELECTION ---
    console.log("\n--- Database Configuration ---");
    let dbType, host, port, user, password, dbName;

    if (useDefaults) {
      console.log("ℹ️  Using default configuration (--defaults)...");
      
      // Default to PostgreSQL
      dbType = { key: "pgsql", label: "PostgreSQL", provider: "postgresql", defaultPort: "5432" };
      host = "localhost";
      port = "5432";
      user = "postgres";
      password = "password";
      dbName = projectName.replace(/-/g, '_');

      // Override with CLI args
      if (dbTypeArg) {
         if (dbTypeArg.toLowerCase() === 'mysql') {
             dbType = { key: "mysql", label: "MySQL", provider: "mysql", defaultPort: "3306" };
             port = "3306"; 
         } else if (dbTypeArg.toLowerCase() === 'pgsql') {
             dbType = { key: "pgsql", label: "PostgreSQL", provider: "postgresql", defaultPort: "5432" };
             port = "5432";
         }
      }
      
      if (dbHostArg) host = dbHostArg;
      if (dbPortArg) port = dbPortArg;
      if (dbUserArg) user = dbUserArg;
      if (dbPassArg) password = dbPassArg;
      if (dbNameArg) dbName = dbNameArg;

    } else {
      dbType = await selectOption("Database apa yang akan digunakan?", [
        { key: "pgsql", label: "PostgreSQL", provider: "postgresql", defaultPort: "5432" },
        { key: "mysql", label: "MySQL", provider: "mysql", defaultPort: "3306" },
      ]);

      host = await ask("Database Host", "localhost");
      port = await ask("Database Port", dbType.defaultPort);
      user = await ask("Database User", "root");
      password = await ask("Database Password", "");
      dbName = await ask("Database Name", projectName.replace(/-/g, '_')); // Default db name based on project name
    }

    let dbUrl = "";
    let dbProvider = dbType.provider;

    if (dbType.key === "pgsql") {
      dbUrl = `postgresql://${user}:${password}@${host}:${port}/${dbName}?schema=public`;
    } else {
      dbUrl = `mysql://${user}:${password}@${host}:${port}/${dbName}`;
    }

    if (!useDefaults) {
      rl.close();
    } else {
      // If we didn't use rl, we might not need to close it if we didn't open it? 
      // Actually rl is created at the top. We should close it.
      rl.close();
    }

    // List of files/folders to exclude
    const ignoreList = [
      'node_modules',
      'dist',
      '.git',
      '.env',
      'bin', // Exclude bin folder, using dependency instead
      'lib', // Exclude lib folder, using dependency instead
      'package-lock.json',
      '.DS_Store',
      'prisma/migrations', // Exclude existing migrations
      'prisma/dev.db', // Exclude sqlite db if exists
      'prisma/dev.db-journal',
      projectName // Don't copy the destination folder itself if creating inside the template
    ];

    function copyDir(src, dest) {
      const entries = fs.readdirSync(src, { withFileTypes: true });

      for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);

        if (ignoreList.includes(entry.name)) {
          continue;
        }
        
        // Explicitly check for prisma/migrations to ensure it's skipped at any depth if logic changes
        if (entry.name === 'migrations' && srcPath.includes('prisma')) {
             continue;
        }

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

    // Update package.json
    console.log('📝 Updating package.json...');
    const packageJsonPath = path.join(projectDir, 'package.json');
    const packageJson = require(packageJsonPath);

    packageJson.name = projectName;
    // Add lapeh framework version to dependencies to track it like react-router
    packageJson.dependencies = packageJson.dependencies || {};
    
    // Smart dependency resolution:
    // If running from node_modules (installed via npm), use the version number.
    // If running locally (dev mode), use the absolute file path.
    const frameworkPackageJson = require(path.join(__dirname, '../package.json'));
    
    if (__dirname.includes('node_modules')) {
       packageJson.dependencies["lapeh"] = `^${frameworkPackageJson.version}`;
    } else {
       // Local development
       const lapehPath = path.resolve(__dirname, '..').replace(/\\/g, '/');
       packageJson.dependencies["lapeh"] = `file:${lapehPath}`;
    }
    
    // Ensure prisma CLI is available in devDependencies for the new project
    packageJson.devDependencies = packageJson.devDependencies || {};
    packageJson.devDependencies["prisma"] = "7.2.0";
    packageJson.devDependencies["dotenv"] = "^16.4.5"; // Ensure dotenv is available for seed script
    
    // Add missing types for dev
    packageJson.devDependencies["@types/express"] = "^5.0.0";
    packageJson.devDependencies["@types/compression"] = "^1.7.5";

    packageJson.version = '1.0.0';
    packageJson.description = 'Generated by lapeh';
    delete packageJson.bin; // Remove the bin entry from the generated project
    delete packageJson.repository; // Remove repository info if specific to the template

    // Update scripts to use lapeh binary
    packageJson.scripts = {
      ...packageJson.scripts,
      "postinstall": "node scripts/compile-schema.js && prisma generate",
      "dev": "lapeh dev",
      "start": "lapeh start",
      "build": "lapeh build",
      "start:prod": "lapeh start"
    };

    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

    // Update tsconfig.json to support framework-as-dependency
    console.log('🔧 Configuring tsconfig.json...');
    const tsconfigPath = path.join(projectDir, 'tsconfig.json');
    if (fs.existsSync(tsconfigPath)) {
      // Use comment-json or just basic parsing if no comments (standard JSON)
      // Since our template tsconfig is standard JSON, require is fine or JSON.parse
      const tsconfig = require(tsconfigPath);
      
      // Update paths
      if (tsconfig.compilerOptions && tsconfig.compilerOptions.paths) {
        tsconfig.compilerOptions.paths["@lapeh/*"] = ["./node_modules/lapeh/lib/*"];
        // Ensure @lapeh/core/database maps correctly to the actual file location
        tsconfig.compilerOptions.paths["@lapeh/core/database"] = ["./node_modules/lapeh/lib/core/database.ts"];
      }

      // Add baseUrl
      tsconfig.compilerOptions.baseUrl = ".";

      // Add ts-node ignore configuration
      tsconfig["ts-node"] = {
        "ignore": ["node_modules/(?!lapeh)"]
      };

      fs.writeFileSync(tsconfigPath, JSON.stringify(tsconfig, null, 2));
    }

    // Configure prisma.config.ts to use tsconfig-paths
    const prismaConfigPath = path.join(projectDir, 'prisma.config.ts');
    if (fs.existsSync(prismaConfigPath)) {
      console.log('🔧 Configuring prisma.config.ts...');
      let prismaConfigContent = fs.readFileSync(prismaConfigPath, 'utf8');
      prismaConfigContent = prismaConfigContent.replace(
        /seed:\s*"ts-node\s+prisma\/seed\.ts"/g,
        'seed: "ts-node -r tsconfig-paths/register prisma/seed.ts"'
      );
      fs.writeFileSync(prismaConfigPath, prismaConfigContent);
    }
    
    // Configure prisma/seed.ts imports
    const prismaSeedPath = path.join(projectDir, 'prisma', 'seed.ts');
    if (fs.existsSync(prismaSeedPath)) {
      console.log('🔧 Configuring prisma/seed.ts...');
      let seedContent = fs.readFileSync(prismaSeedPath, 'utf8');
      
      // Add dotenv config if missing
      if (!seedContent.includes('dotenv.config()')) {
        seedContent = 'import dotenv from "dotenv";\ndotenv.config();\n\n' + seedContent;
      }
      
      // Update import path
      // We want to import from @lapeh/core/database which maps to lib/prisma.ts
      // The alias is configured in tsconfig.json as "@lapeh/core/database": ["./node_modules/lapeh/lib/prisma.ts"]
      
      // If the template uses relative path or old alias, replace it.
      // But wait, the template might already have `import { prisma } from "@lapeh/core/database"`.
      // The error is TS2307: Cannot find module. This means ts-node/tsconfig-paths isn't resolving the alias correctly in the seeder context.
      
      // Ensure seed content uses the alias
      seedContent = seedContent.replace(
        /import\s+{\s*prisma\s*}\s+from\s+["']\.\.\/src\/prisma["']/, 
        'import { prisma } from "@lapeh/core/database"'
      );
      
      // Also handle if it was already replaced or in different format
      if (!seedContent.includes('@lapeh/core/database')) {
          seedContent = seedContent.replace(
            /import\s+{\s*prisma\s*}\s+from\s+["'].*prisma["']/,
            'import { prisma } from "@lapeh/core/database"'
          );
      }

      // Remove default demo data (Pets) from seed.ts ONLY if NOT using --full
      // We want to keep users/roles as they are essential, but remove the demo 'Pets' data
      // This matches from "// 6. Seed Pets" up to the completion log message
      if (!isFull) {
          seedContent = seedContent.replace(
              /\/\/ 6\. Seed Pets[\s\S]*?console\.log\("Finished seeding 50,000 pets\."\);/, 
              '// 6. Seed Pets (Skipped by default. Use --full to include demo data)'
          );
      }
      
      fs.writeFileSync(prismaSeedPath, seedContent);
    }

    // Create .env from .env.example with correct DB config
    console.log('⚙️  Configuring environment...');
    const envExamplePath = path.join(projectDir, '.env.example');
    const envPath = path.join(projectDir, '.env');
    const prismaBaseFile = path.join(projectDir, "prisma", "base.prisma.template");

    if (fs.existsSync(envExamplePath)) {
      let envContent = fs.readFileSync(envExamplePath, 'utf8');
      
      // Replace DATABASE_URL and DATABASE_PROVIDER
      if (envContent.includes("DATABASE_URL=")) {
        envContent = envContent.replace(/DATABASE_URL=".+"/g, `DATABASE_URL="${dbUrl}"`);
        envContent = envContent.replace(/DATABASE_URL=.+/g, `DATABASE_URL="${dbUrl}"`); 
      } else {
        envContent += `\nDATABASE_URL="${dbUrl}"`;
      }

      if (envContent.includes("DATABASE_PROVIDER=")) {
        envContent = envContent.replace(/DATABASE_PROVIDER=".+"/g, `DATABASE_PROVIDER="${dbProvider}"`);
        envContent = envContent.replace(/DATABASE_PROVIDER=.+/g, `DATABASE_PROVIDER="${dbProvider}"`);
      } else {
        envContent += `\nDATABASE_PROVIDER="${dbProvider}"`;
      }

      fs.writeFileSync(envPath, envContent);
    }
    
    // Update prisma/base.prisma.template
    console.log("📄 Updating prisma/base.prisma.template...");
    if (fs.existsSync(prismaBaseFile)) {
      let baseContent = fs.readFileSync(prismaBaseFile, "utf8");
      // Replace provider in datasource block
      baseContent = baseContent.replace(
        /(datasource\s+db\s+\{[\s\S]*?provider\s*=\s*")([^"]+)(")/, 
        `$1${dbProvider}$3`
      );
      fs.writeFileSync(prismaBaseFile, baseContent);
    }

    // Install dependencies
    console.log('📦 Installing dependencies (this might take a while)...');
    try {
      execSync('npm install', { cwd: projectDir, stdio: 'inherit' });
    } catch (error) {
      console.error('❌ Error installing dependencies.');
      process.exit(1);
    }

    // Generate JWT Secret
    console.log('🔑 Generating JWT Secret...');
    try {
      execSync('npm run generate:jwt', { cwd: projectDir, stdio: 'inherit' });
    } catch (error) {
      console.warn('⚠️  Could not generate JWT secret automatically.');
    }

    // Generate Prisma Client & Migrate
    console.log('🗄️ Setting up database...');
    try {
      console.log('   Compiling schema...');
      execSync('node scripts/compile-schema.js', { cwd: projectDir, stdio: 'inherit' });
      
      // Try to migrate (this will create the DB if it doesn't exist)
      console.log('   Running migration (creates DB if missing)...');
      execSync('npx prisma migrate dev --name init_setup', { cwd: projectDir, stdio: 'inherit' });
      
      // Seed (Users & Roles are mandatory, Pets are demo data)
      console.log('   Seeding mandatory data (Users, Roles, Permissions)...');
      
      if (isFull) {
         try {
             execSync('npm run db:seed', { cwd: projectDir, stdio: 'inherit' });
         } catch (error) {
             console.warn('⚠️  Database setup encountered an issue.');
             console.warn('   You may need to check your .env credentials and run:');
             console.warn(`   cd ${projectName}`);
             console.warn('   npm run prisma:migrate');
         }
      } else {
         console.log('   ℹ️  Skipping database seeding (use --full to seed default data)...');
      }

      console.log(`\n✅ Project ${projectName} created successfully!`);
      console.log('\nNext steps:');
      console.log(`  cd ${projectName}`);
      console.log('  npm run dev');
    } catch (error) {
      console.error('❌ Error setting up database:', error.message);
      console.log(`\n✅ Project ${projectName} created, but database setup failed.`);
      console.log('   Please check your database credentials in .env and run:');
      console.log(`   cd ${projectName}`);
      console.log('   npm run prisma:migrate');
    }
  })();
}
      
