#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');

const args = process.argv.slice(2);

// --- UPGRADE MODE ---
if (args[0] === 'upgrade') {
  (async () => {
    await upgradeProject();
  })();
} else {
  // --- CREATE MODE ---
  createProject();
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
    ...templatePackageJson.scripts
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
  currentPackageJson.dependencies["lapeh"] = templatePackageJson.version;

  fs.writeFileSync(packageJsonPath, JSON.stringify(currentPackageJson, null, 2));

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

  if (!projectName) {
    console.error('❌ Please specify the project name:');
    console.error('   npx lapeh-cli <project-name> [--full]');
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
    const dbType = await selectOption("Database apa yang akan digunakan?", [
      { key: "pgsql", label: "PostgreSQL", provider: "postgresql", defaultPort: "5432" },
      { key: "mysql", label: "MySQL", provider: "mysql", defaultPort: "3306" },
    ]);

    let dbUrl = "";
    let dbProvider = dbType.provider;

    const host = await ask("Database Host", "localhost");
    const port = await ask("Database Port", dbType.defaultPort);
    const user = await ask("Database User", "root");
    const password = await ask("Database Password", "");
    const dbName = await ask("Database Name", projectName.replace(/-/g, '_')); // Default db name based on project name

    if (dbType.key === "pgsql") {
      dbUrl = `postgresql://${user}:${password}@${host}:${port}/${dbName}?schema=public`;
    } else {
      dbUrl = `mysql://${user}:${password}@${host}:${port}/${dbName}`;
    }

    rl.close();

    // List of files/folders to exclude
    const ignoreList = [
      'node_modules',
      'dist',
      '.git',
      '.env',
      'bin', // Don't copy the CLI script itself
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
    packageJson.dependencies["lapeh"] = packageJson.version; 
    
    packageJson.version = '1.0.0';
    packageJson.description = 'Generated by lapeh';
    delete packageJson.bin; // Remove the bin entry from the generated project
    delete packageJson.repository; // Remove repository info if specific to the template

    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

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
      
      console.log('   Generating Prisma Client...');
      execSync('npx prisma generate', { cwd: projectDir, stdio: 'inherit' });

      // Try to migrate (this will create the DB if it doesn't exist)
      console.log('   Running migration (creates DB if missing)...');
      execSync('npx prisma migrate dev --name init_setup', { cwd: projectDir, stdio: 'inherit' });
      
      // Seed
      if (isFull) {
        console.log('   Seeding database...');
        execSync('npm run db:seed', { cwd: projectDir, stdio: 'inherit' });
      } else {
        console.log('   ℹ️  Skipping database seeding (use --full to seed default data)...');
      }

    } catch (error) {
      console.warn('⚠️  Database setup encountered an issue.');
      console.warn('   You may need to check your .env credentials and run:');
      console.warn('   cd ' + projectName);
      console.warn('   npm run prisma:migrate');
    }

    console.log(`\n✅ Project ${projectName} created successfully!`);
    console.log(`\nNext steps:`);
    console.log(`  cd ${projectName}`);
    console.log(`  npm run dev`);
  })();
}
