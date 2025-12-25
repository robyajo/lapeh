const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const rootDir = path.join(__dirname, "..");
const envExample = path.join(rootDir, ".env.example");
const envFile = path.join(rootDir, ".env");

console.log("🚀 Starting project initialization...");

try {
  // 1. Copy .env
  if (!fs.existsSync(envFile)) {
    console.log("📄 Copying .env.example to .env...");
    fs.copyFileSync(envExample, envFile);
  } else {
    console.log("⚠️ .env already exists, skipping copy.");
  }

  // 2. Install dependencies
  console.log("📦 Installing dependencies...");
  execSync("npm install", { stdio: "inherit", cwd: rootDir });

  // 3. Generate JWT Secret
  console.log("🔑 Generating JWT Secret...");
  execSync("node scripts/generate-jwt-secret.js", {
    stdio: "inherit",
    cwd: rootDir,
  });

  // 4. Setup Database (Migrate)
  console.log("🗄️ Setting up database...");
  // We skip the interactive prompt by providing a name if needed,
  // or just let it run. However, if it prompts, the script might hang or fail if not interactive.
  // 'prisma migrate dev' asks for name if there are changes.
  // We try to run it. If it fails, we inform the user.
  // We use npx to ensure we use the local binary.
  try {
        // We use the script defined in package.json but add --name init to avoid prompt for new migration
        // However, if migrations already exist, --name might create a new one.
        // If it's a fresh clone, 'prisma migrate dev' checks existing migrations.
        // Let's just run the compile-schema first, then migrate.
        execSync('node scripts/compile-schema.js', { stdio: 'inherit', cwd: rootDir });
        
        // Explicitly generate Prisma Client before migration to ensure it exists
        console.log('⚙️ Generating Prisma Client...');
        execSync('npx prisma generate', { stdio: 'inherit', cwd: rootDir });

        execSync('npx prisma migrate dev --name init_setup', { stdio: 'inherit', cwd: rootDir });
    } catch (error) {
    console.warn(
      '⚠️ Database migration had an issue. Please check your database connection in .env and run "npm run prisma:migrate" manually.'
    );
  }

  // 5. Seed Database
  console.log("🌱 Seeding database...");
  try {
    execSync("npm run db:seed", { stdio: "inherit", cwd: rootDir });
  } catch (error) {
    console.warn(
      '⚠️ Database seeding had an issue. You might need to run "npm run db:seed" manually.'
    );
  }

  console.log("\n✅ Setup complete! You can now run:");
  console.log("   npm run dev");
} catch (error) {
  console.error("❌ Setup failed:", error.message);
  process.exit(1);
}
