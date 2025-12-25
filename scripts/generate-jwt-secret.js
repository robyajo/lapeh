const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const envPath = path.join(__dirname, '..', '.env');

function generateSecret() {
  return crypto.randomBytes(64).toString('hex');
}

try {
  const secret = generateSecret();
  let envContent = '';

  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
  } else {
    console.log('.env file not found, creating one...');
  }

  // Check if JWT_SECRET exists
  if (envContent.match(/^JWT_SECRET=/m)) {
    envContent = envContent.replace(/^JWT_SECRET=.*/m, `JWT_SECRET="${secret}"`);
  } else {
    // Ensure there is a newline before appending if the file is not empty
    if (envContent && !envContent.endsWith('\n')) {
      envContent += '\n';
    }
    envContent += `JWT_SECRET="${secret}"\n`;
  }

  fs.writeFileSync(envPath, envContent);
  console.log('✅ JWT Secret generated and updated in .env file.');
  console.log('🔑 New Secret has been set.');
} catch (error) {
  console.error('❌ Error updating .env file:', error);
  process.exit(1);
}
