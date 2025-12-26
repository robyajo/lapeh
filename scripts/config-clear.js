const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = path.join(__dirname, '..');

console.log('🧹 Starting cleanup process...');

// 1. Remove dist folder (Build artifacts)
const distDir = path.join(rootDir, 'dist');
if (fs.existsSync(distDir)) {
  console.log('🗑️  Removing dist/ folder...');
  fs.rmSync(distDir, { recursive: true, force: true });
}

// 2. Remove node_modules/.cache (Framework caches: ts-node, eslint, etc)
const nmCacheDir = path.join(rootDir, 'node_modules', '.cache');
if (fs.existsSync(nmCacheDir)) {
  console.log('🗑️  Removing node_modules/.cache...');
  fs.rmSync(nmCacheDir, { recursive: true, force: true });
}

// 3. Remove Redis local persistence file (dump.rdb)
const dumpRdb = path.join(rootDir, 'dump.rdb');
if (fs.existsSync(dumpRdb)) {
  console.log('🗑️  Removing dump.rdb (Redis persistence)...');
  fs.unlinkSync(dumpRdb);
}

// 4. Remove Coverage folder (if exists)
const coverageDir = path.join(rootDir, 'coverage');
if (fs.existsSync(coverageDir)) {
  console.log('🗑️  Removing coverage/ folder...');
  fs.rmSync(coverageDir, { recursive: true, force: true });
}

// 5. Clear NPM Cache
try {
  console.log('📦 Clearing NPM cache...');
  execSync('npm cache clean --force', { stdio: 'inherit' });
} catch (error) {
  console.warn('⚠️  Warning: Could not clear NPM cache. You might need admin privileges.');
}

console.log('✨ Cleanup complete! Project is fresh.');
