const fs = require('fs');
const path = require('path');

const prismaDir = path.join(__dirname, '..', 'prisma');
const modelsDir = path.join(__dirname, '..', 'src', 'models');
const schemaFile = path.join(prismaDir, 'schema.prisma');
const baseFile = path.join(prismaDir, 'base.prisma.template');

// Ensure models directory exists
if (!fs.existsSync(modelsDir)) {
  fs.mkdirSync(modelsDir, { recursive: true });
}

// Read base schema (datasource & generator)
let schemaContent = fs.readFileSync(baseFile, 'utf8');

// Read all .model files in src/models
const modelFiles = fs.readdirSync(modelsDir).filter(file => file.endsWith('.model'));

modelFiles.forEach(file => {
  const content = fs.readFileSync(path.join(modelsDir, file), 'utf8');
  schemaContent += '\n\n' + content;
});

// Write concatenated content to prisma/schema.prisma
fs.writeFileSync(schemaFile, schemaContent);

console.log('✅ Prisma schema compiled successfully!');
console.log(`   Merged ${modelFiles.length} model files from src/models/ into prisma/schema.prisma`);
