const fs = require('fs');
const path = require('path');

const prismaDir = path.join(__dirname, '..', 'prisma');
const modulesDir = path.join(__dirname, '..', 'src', 'modules');
const schemaFile = path.join(prismaDir, 'schema.prisma');
const baseFile = path.join(prismaDir, 'base.prisma.template');

// Read base schema (datasource & generator)
if (!fs.existsSync(baseFile)) {
    console.error(`❌ Base schema template not found at ${baseFile}`);
    process.exit(1);
}

let schemaContent = fs.readFileSync(baseFile, 'utf8');

// Detect provider from datasource block
const providerMatch = schemaContent.match(/datasource\s+\w+\s+\{[\s\S]*?provider\s*=\s*"([^"]+)"/);
const provider = providerMatch ? providerMatch[1] : 'postgresql';
const isMongo = provider === 'mongodb';

// Helper to find all .prisma files recursively
function findPrismaFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      findPrismaFiles(filePath, fileList);
    } else {
      if (file.endsWith('.prisma')) {
        fileList.push(filePath);
      }
    }
  });
  return fileList;
}

const modelFiles = findPrismaFiles(modulesDir);

modelFiles.forEach(filePath => {
  let content = fs.readFileSync(filePath, 'utf8');
  
  if (!isMongo) {
    // Transform MongoDB specific syntax to SQL compatible syntax
    content = content
      // Remove @db.ObjectId
      .replace(/@db\.ObjectId/g, '')
      // Remove @map("_id")
      .replace(/@map\("_id"\)/g, '')
      // Replace @default(auto()) with @default(uuid()) for Strings
      // Note: This is a simple replacement, check your schema if you use auto() for Int
      .replace(/@default\(auto\(\)\)/g, '@default(uuid())');
  }

  schemaContent += '\n\n' + content;
});

// Write concatenated content to prisma/schema.prisma
fs.writeFileSync(schemaFile, schemaContent);

console.log('✅ Prisma schema compiled successfully!');
console.log(`   Merged ${modelFiles.length} model files from src/modules/ into prisma/schema.prisma`);
