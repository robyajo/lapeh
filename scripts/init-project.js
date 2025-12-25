const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const readline = require("readline");

const rootDir = path.join(__dirname, "..");
const envExample = path.join(rootDir, ".env.example");
const envFile = path.join(rootDir, ".env");
const prismaBaseFile = path.join(rootDir, "prisma", "base.prisma");

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
    const answer = await ask(">", options[0].key); // Default to first option
    const selected = options.find(o => o.key.toLowerCase() === answer.toLowerCase());
    if (selected) return selected;
    
    // Check if user entered the full name or label
    const byLabel = options.find(o => o.label.toLowerCase().includes(answer.toLowerCase()));
    if (byLabel) return byLabel;

    console.log("Pilihan tidak valid. Silakan coba lagi.");
  }
};

(async () => {
  console.log("🚀 Starting project initialization...");

  try {
    // --- DATABASE SELECTION ---
    console.log("\n--- Database Configuration ---");
    const dbType = await selectOption("Database apa yang akan digunakan?", [
      { key: "pgsql", label: "PostgreSQL", provider: "postgresql", defaultPort: "5432" },
      { key: "mysql", label: "MySQL", provider: "mysql", defaultPort: "3306" },
      { key: "mariadb", label: "MariaDB", provider: "mysql", defaultPort: "3306" },
      { key: "sqlite", label: "SQLite", provider: "sqlite", defaultPort: "" },
    ]);

    let dbUrl = "";
    let dbProvider = dbType.provider;

    if (dbType.key === "sqlite") {
      dbUrl = "file:./dev.db";
    } else {
      const host = await ask("Database Host", "localhost");
      const port = await ask("Database Port", dbType.defaultPort);
      const user = await ask("Database User", "root");
      const password = await ask("Database Password", "");
      const dbName = await ask("Database Name", "lapeh");

      if (dbType.key === "pgsql") {
        dbUrl = `postgresql://${user}:${password}@${host}:${port}/${dbName}?schema=public`;
      } else {
        dbUrl = `mysql://${user}:${password}@${host}:${port}/${dbName}`;
      }
    }

    // Close readline as we are done with input
    rl.close();

    // 1. Setup .env
    console.log("\n📄 Setting up .env...");
    let envContent = "";
    if (fs.existsSync(envExample)) {
      envContent = fs.readFileSync(envExample, "utf8");
    } else {
      // Fallback minimal env if example missing
      envContent = `PORT=4000\nDATABASE_PROVIDER="postgresql"\nDATABASE_URL=""\nJWT_SECRET="replace_this"\n`;
    }

    // Replace DATABASE_URL and DATABASE_PROVIDER
    // Regex to replace existing values or append if missing (simplified)
    if (envContent.includes("DATABASE_URL=")) {
      envContent = envContent.replace(/DATABASE_URL=".+"/g, `DATABASE_URL="${dbUrl}"`);
      envContent = envContent.replace(/DATABASE_URL=.+/g, `DATABASE_URL="${dbUrl}"`); // Handle unquoted
    } else {
      envContent += `\nDATABASE_URL="${dbUrl}"`;
    }

    if (envContent.includes("DATABASE_PROVIDER=")) {
      envContent = envContent.replace(/DATABASE_PROVIDER=".+"/g, `DATABASE_PROVIDER="${dbProvider}"`);
      envContent = envContent.replace(/DATABASE_PROVIDER=.+/g, `DATABASE_PROVIDER="${dbProvider}"`);
    } else {
      envContent += `\nDATABASE_PROVIDER="${dbProvider}"`;
    }

    fs.writeFileSync(envFile, envContent);
    console.log("✅ .env updated with database configuration.");

    // 2. Update prisma/base.prisma
    console.log("📄 Updating prisma/base.prisma...");
    if (fs.existsSync(prismaBaseFile)) {
      let baseContent = fs.readFileSync(prismaBaseFile, "utf8");
      // Replace provider
      baseContent = baseContent.replace(/provider\s*=\s*".*"/, `provider = "${dbProvider}"`);
      fs.writeFileSync(prismaBaseFile, baseContent);
    } else {
      console.warn("⚠️ prisma/base.prisma not found. Skipping.");
    }

    // 3. Install dependencies
    console.log("\n📦 Installing dependencies...");
    execSync("npm install", { stdio: "inherit", cwd: rootDir });

    // 4. Generate JWT Secret
    console.log("\n🔑 Generating JWT Secret...");
    try {
        execSync("node scripts/generate-jwt-secret.js", {
            stdio: "inherit",
            cwd: rootDir,
        });
    } catch (e) {
        console.warn("⚠️ Failed to generate JWT secret automatically.");
    }

    // 5. Setup Database (Migrate)
    console.log("\n🗄️ Setting up database...");
    try {
      execSync("node scripts/compile-schema.js", { stdio: "inherit", cwd: rootDir });
      console.log("⚙️ Generating Prisma Client...");
      execSync("npx prisma generate", { stdio: "inherit", cwd: rootDir });
      
      console.log("🚀 Running Migration...");
      execSync("npx prisma migrate dev --name init_setup", { stdio: "inherit", cwd: rootDir });
    } catch (error) {
      console.warn(
        '⚠️ Database migration had an issue. Please check your database connection in .env and run "npm run prisma:migrate" manually.'
      );
    }

    // 6. Seed Database
    console.log("\n🌱 Seeding database...");
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
    console.error("\n❌ Setup failed:", error.message);
    rl.close();
    process.exit(1);
  }
})();
