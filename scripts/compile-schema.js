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

// Detect provider
const providerMatch = schemaContent.match(/provider\s*=\s*"([^"]+)"/);
const provider = providerMatch ? providerMatch[1] : 'postgresql';
const isMongo = provider === 'mongodb';

// Read all .prisma files in src/models
const modelFiles = fs.readdirSync(modelsDir).filter(file => file.endsWith('.prisma'));

modelFiles.forEach(file => {
  let content = fs.readFileSync(path.join(modelsDir, file), 'utf8');
  
  if (!isMongo) {
    // Transform MongoDB specific syntax to SQL compatible syntax
    content = content
      // Remove @db.ObjectId
      .replace(/@db\.ObjectId/g, '')
      // Remove @map("_id")
      .replace(/@map\("_id"\)/g, '')
      // Replace @default(auto()) with @default(uuid()) for Strings
      .replace(/@default\(auto\(\)\)/g, '@default(uuid())');
  }

  schemaContent += '\n\n' + content;
});

// Write concatenated content to prisma/schema.prisma
fs.writeFileSync(schemaFile, schemaContent);

console.log('✅ Prisma schema compiled successfully!');
console.log(`   Merged ${modelFiles.length} model files from src/models/ into prisma/schema.prisma`);
