const fs = require('fs');
const path = require('path');

const sourceDir = path.resolve(__dirname, '../../doc');
const targetDir = path.resolve(__dirname, '../docs');

// Pastikan folder target ada
if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
}

// Copy file
const files = fs.readdirSync(sourceDir);

files.forEach(file => {
    if (file.endsWith('.md')) {
        const sourcePath = path.join(sourceDir, file);
        // Ubah nama file menjadi lowercase dan ganti underscore dengan hyphen
        // (misal: GETTING_STARTED.md -> getting-started.md)
        const newFileName = file.toLowerCase().replace(/_/g, '-');
        const targetPath = path.join(targetDir, newFileName);
        
        console.log(`Copying ${file} -> ${newFileName}`);
        fs.copyFileSync(sourcePath, targetPath);
    }
});

console.log('✅ Documentation sync complete.');
