const fs = require('fs');
const path = require('path');

const modelName = process.argv[2];

if (!modelName) {
  console.error('❌ Please specify the model name.');
  console.error('   Usage: npm run make:model <ModelName>');
  console.error('   Example: npm run make:model Product');
  process.exit(1);
}

const PascalCaseName = modelName.charAt(0).toUpperCase() + modelName.slice(1);
const tableName = modelName.toLowerCase() + 's'; // simple pluralization

const modelsDir = path.join(__dirname, '..', 'src', 'models');
const modelPath = path.join(modelsDir, `${PascalCaseName}.prisma`);

if (fs.existsSync(modelPath)) {
  console.error(`❌ Model ${PascalCaseName} already exists at ${modelPath}`);
  process.exit(1);
}

// Ensure models directory exists
if (!fs.existsSync(modelsDir)) {
  fs.mkdirSync(modelsDir, { recursive: true });
}

const content = `model ${tableName} {
  id        BigInt    @id @default(autoincrement())
  name      String
  createdAt DateTime? @default(now())
  updatedAt DateTime? @updatedAt
}
`;

fs.writeFileSync(modelPath, content);

console.log(`✅ Model created: src/models/${PascalCaseName}.prisma`);
console.log(`\nNext steps:`);
console.log(`1. Edit the model file.`);
console.log(`2. Run 'npm run prisma:migrate' to update the database.`);
