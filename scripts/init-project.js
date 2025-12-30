const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const readline = require("readline");

const rootDir = path.join(__dirname, "..");
const envExample = path.join(rootDir, ".env.example");
const envFile = path.join(rootDir, ".env");

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
    // Close readline as we are done with input
    rl.close();

    // 1. Setup .env
    console.log("\n📄 Setting up .env...");
    let envContent = "";
    if (fs.existsSync(envExample)) {
      envContent = fs.readFileSync(envExample, "utf8");
    } else {
      // Fallback minimal env if example missing
      envContent = `PORT=8000\nJWT_SECRET="replace_this"\n`;
    }

    fs.writeFileSync(envFile, envContent);
    console.log("✅ .env created.");

    // 3. Install dependencies
    console.log("\n📦 Installing dependencies...");
    execSync("npm install", { stdio: "inherit", cwd: rootDir });

    // 5. Generate JWT Secret
    console.log("\n🔑 Generating JWT Secret...");
    try {
        execSync("node scripts/generate-jwt-secret.js", {
            stdio: "inherit",
            cwd: rootDir,
        });
    } catch (e) {
        console.warn("⚠️ Failed to generate JWT secret automatically.");
    }

    console.log("\n✅ Setup complete! You can now run:");
    console.log("   npm run dev");

  } catch (error) {
    console.error("\n❌ Setup failed:", error.message);
    process.exit(1);
  }
})();
