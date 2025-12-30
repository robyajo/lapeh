#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');
const readline = require('readline');

// --- Helper Functions for Animation ---

async function spin(text, fn) {
  const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
  let i = 0;
  process.stdout.write(`\x1b[?25l`); // Hide cursor
  
  const interval = setInterval(() => {
    process.stdout.write(`\r\x1b[36m${frames[i]} ${text}\x1b[0m`);
    i = (i + 1) % frames.length;
  }, 80);

  try {
    const result = await fn();
    clearInterval(interval);
    process.stdout.write(`\r\x1b[32m✔ ${text}\x1b[0m\n`);
    return result;
  } catch (e) {
    clearInterval(interval);
    process.stdout.write(`\r\x1b[31m✖ ${text}\x1b[0m\n`);
    throw e;
  } finally {
    process.stdout.write(`\x1b[?25h`); // Show cursor
  }
}

function runCommand(cmd, cwd) {
  return new Promise((resolve, reject) => {
    // Use spawn to capture output or run silently
    // Using shell: true to handle cross-platform command execution
    const child = spawn(cmd, { cwd, shell: true, stdio: 'pipe' });
    let output = '';
    
    child.stdout.on('data', (data) => { output += data.toString(); });
    child.stderr.on('data', (data) => { output += data.toString(); });
    
    child.on('close', (code) => {
      if (code === 0) resolve(output);
      else reject(new Error(`Command failed with code ${code}\n${output}`));
    });
  });
}

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

    // Add version to payload
    try {
        const pkg = require(path.join(__dirname, '../package.json'));
        payload.cliVersion = pkg.version;
    } catch (e) {
        payload.cliVersion = 'unknown';
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
    (async () => { await runDev(); })();
    break;
  case 'start':
    (async () => { await runStart(); })();
    break;
  case 'build':
    (async () => { await runBuild(); })();
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

async function checkUpdate() {
  try {
    const pkg = require(path.join(__dirname, '../package.json'));
    const currentVersion = pkg.version;
    
    // Fetch latest version from npm registry
    const latestVersion = await new Promise((resolve) => {
         const https = require('https');
         const req = https.get('https://registry.npmjs.org/lapeh/latest', {
             headers: { 'User-Agent': 'Lapeh-CLI' },
             timeout: 1500 // 1.5s timeout
         }, (res) => {
             let data = '';
             res.on('data', chunk => data += chunk);
             res.on('end', () => {
                 try {
                     const json = JSON.parse(data);
                     resolve(json.version);
                 } catch (e) {
                     resolve(null);
                 }
             });
         });
         
         req.on('error', () => resolve(null));
         req.on('timeout', () => {
             req.destroy();
             resolve(null);
         });
    });

    if (latestVersion && latestVersion !== currentVersion) {
        const currentParts = currentVersion.split('.').map(Number);
        const latestParts = latestVersion.split('.').map(Number);
        
        let isOutdated = false;
        for(let i=0; i<3; i++) {
            if (latestParts[i] > currentParts[i]) {
                isOutdated = true;
                break;
            } else if (latestParts[i] < currentParts[i]) {
                break;
            }
        }
        
        if (isOutdated) {
            console.log('\n');
            console.log('\x1b[33m┌────────────────────────────────────────────────────────────┐\x1b[0m');
            console.log(`\x1b[33m│\x1b[0m  \x1b[1mUpdate available!\x1b[0m \x1b[31m${currentVersion}\x1b[0m → \x1b[32m${latestVersion}\x1b[0m                           \x1b[33m│\x1b[0m`);
            console.log(`\x1b[33m│\x1b[0m  Run \x1b[36mnpm install lapeh@latest\x1b[0m to update                  \x1b[33m│\x1b[0m`);
            console.log(`\x1b[33m│\x1b[0m  Then run \x1b[36mnpx lapeh upgrade\x1b[0m to sync files               \x1b[33m│\x1b[0m`);
            console.log('\x1b[33m└────────────────────────────────────────────────────────────┘\x1b[0m');
            console.log('\n');
        }
    }
  } catch (e) {
    // Ignore errors during update check
  }
}

async function runDev() {
  console.log('🚀 Starting Lapeh in development mode...');
  await checkUpdate();
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

async function runStart() {
  await spin('Starting Lapeh production server...', async () => {
     await new Promise(r => setTimeout(r, 1500)); // Simulate startup checks animation
  });
  
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
    'src/redis.ts'
  ];

  const updateStats = {
      updated: [],
      created: [],
      removed: []
  };

  function syncDirectory(src, dest, clean = false) {
    if (!fs.existsSync(src)) return;
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });

    const srcEntries = fs.readdirSync(src, { withFileTypes: true });
    const srcEntryNames = new Set();

    for (const entry of srcEntries) {
      srcEntryNames.add(entry.name);
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);
      const relativePath = path.relative(currentDir, destPath);

      if (entry.isDirectory()) {
        syncDirectory(srcPath, destPath, clean);
      } else {
        let shouldCopy = true;
        
        if (fs.existsSync(destPath)) {
            const srcContent = fs.readFileSync(srcPath);
            const destContent = fs.readFileSync(destPath);
            if (srcContent.equals(destContent)) {
                shouldCopy = false;
            } else {
                updateStats.updated.push(relativePath);
            }
        } else {
            updateStats.created.push(relativePath);
        }

        if (shouldCopy) {
            fs.copyFileSync(srcPath, destPath);
        }
      }
    }

    if (clean) {
      const destEntries = fs.readdirSync(dest, { withFileTypes: true });
      for (const entry of destEntries) {
        if (!srcEntryNames.has(entry.name)) {
            const destPath = path.join(dest, entry.name);
            const relativePath = path.relative(currentDir, destPath);
            
            console.log(`🗑️  Removing obsolete file/directory: ${destPath}`);
            updateStats.removed.push(relativePath);
            
            if (entry.isDirectory()) {
                fs.rmSync(destPath, { recursive: true, force: true });
            } else {
                fs.unlinkSync(destPath);
            }
        }
      }
    }
  }

  for (const item of filesToSync) {
    const srcPath = path.join(templateDir, item);
    const destPath = path.join(currentDir, item);
    const relativePath = item; // Since item is relative to templateDir/currentDir
    
    if (fs.existsSync(srcPath)) {
      const stats = fs.statSync(srcPath);
      if (stats.isDirectory()) {
          console.log(`🔄 Syncing directory ${item}...`);
          syncDirectory(srcPath, destPath, item === 'lib');
      } else {
          console.log(`🔄 Checking file ${item}...`);
          const destDir = path.dirname(destPath);
          if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
          
          let shouldCopy = true;
          if (fs.existsSync(destPath)) {
              const srcContent = fs.readFileSync(srcPath);
              const destContent = fs.readFileSync(destPath);
              if (srcContent.equals(destContent)) {
                  shouldCopy = false;
              } else {
                  updateStats.updated.push(relativePath);
              }
          } else {
              updateStats.created.push(relativePath);
          }

          if (shouldCopy) {
            fs.copyFileSync(srcPath, destPath);
          }
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

  // Ensure prisma config exists for seed
  if (!currentPackageJson.prisma) {
      currentPackageJson.prisma = {
          seed: "npx ts-node -r tsconfig-paths/register prisma/seed.ts"
      };
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
  
  if (updateStats.created.length > 0) {
      console.log('\n✨ Created files:');
      updateStats.created.forEach(f => console.log(`   \x1b[32m+ ${f}\x1b[0m`));
  }
  
  if (updateStats.updated.length > 0) {
      console.log('\n📝 Updated files:');
      updateStats.updated.forEach(f => console.log(`   \x1b[33m~ ${f}\x1b[0m`));
  }

  if (updateStats.removed.length > 0) {
      console.log('\n🗑️ Removed files:');
      updateStats.removed.forEach(f => console.log(`   \x1b[31m- ${f}\x1b[0m`));
  }

  if (updateStats.created.length === 0 && updateStats.updated.length === 0 && updateStats.removed.length === 0) {
      console.log('   No files were changed.');
  }

  console.log('\n   Please check your .env file against .env.example for any new required variables.');
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
    // Animation Lapeh "L"
    const lFrames = [
      "██╗     ",
      "██║     ",
      "██║     ",
      "██║     ",
      "███████╗",
      "╚══════╝"
    ];

    console.clear();
    console.log('\n');
    for (let i = 0; i < lFrames.length; i++) {
        await new Promise(r => setTimeout(r, 100));
        console.log(`\x1b[36m   ${lFrames[i]}\x1b[0m`);
    }
    console.log('\n\x1b[36m   L A P E H   F R A M E W O R K\x1b[0m\n');
    await new Promise(r => setTimeout(r, 800));

    console.log(`🚀 Creating a new API Lapeh project in ${projectDir}...`);
    fs.mkdirSync(projectDir);

    const ignoreList = [
      'node_modules', 'dist', '.git', '.env', 'bin', 'lib', 
      'package-lock.json', '.DS_Store', 'prisma', 'website', 
      'init', 'test-local-run', 'coverage', 'doc', projectName
    ];

    function copyDir(src, dest) {
      const entries = fs.readdirSync(src, { withFileTypes: true });
      for (const entry of entries) {
        if (ignoreList.includes(entry.name)) continue;
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        
        // Clean storage/logs: skip everything except .gitkeep
        // Check if we are inside storage/logs
        const relPath = path.relative(templateDir, srcPath);
        const isInLogs = relPath.includes(path.join('storage', 'logs')) || relPath.includes('storage/logs') || relPath.includes('storage\\logs');
        
        if (isInLogs && !entry.isDirectory() && entry.name !== '.gitkeep') {
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

    const gitignoreTemplate = path.join(projectDir, 'gitignore.template');
    if (fs.existsSync(gitignoreTemplate)) {
        fs.renameSync(gitignoreTemplate, path.join(projectDir, '.gitignore'));
    }

    console.log('⚙️  Configuring environment...');
    const envExamplePath = path.join(projectDir, '.env.example');
    const envPath = path.join(projectDir, '.env');
    
    if (fs.existsSync(envExamplePath)) {
      let envContent = fs.readFileSync(envExamplePath, 'utf8');
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
    delete packageJson.peerDependencies;
    
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
    // Removed Prisma base file handling

    try {
      await spin('Installing dependencies...', async () => {
          await runCommand('npm install', projectDir);
      });
    } catch (e) {
      console.error('❌ Error installing dependencies.');
      console.error(e.message);
      process.exit(1);
    }

    try {
       // Also silence the JWT generation output or animate it if needed, but for now just silence/pipe
       // Or keep inherit if user wants to see the key.
       // The original code used 'inherit', and printed "✅ JWT Secret generated..."
       // Let's keep it simple or use runCommand to just do it silently.
       await runCommand('npm run generate:jwt', projectDir);
       console.log('✅ JWT Secret generated.');
    } catch (e) {}

    // Removed Prisma setup steps

    console.log(`\n✅ Project ${projectName} created successfully!`);
    rl.close();
  })();
}
