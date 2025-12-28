const fs = require('fs');
const path = require('path');

const rootDocDir = path.resolve(__dirname, '../../doc');

const mappings = [
    {
        source: path.join(rootDocDir, 'id'),
        target: path.resolve(__dirname, '../docs')
    },
    {
        source: path.join(rootDocDir, 'en'),
        target: path.resolve(__dirname, '../en/docs')
    }
];

function syncDir(sourceDir, targetDir) {
    if (!fs.existsSync(sourceDir)) {
        console.warn(`⚠️ Source directory not found: ${sourceDir}`);
        return;
    }

    // Pastikan folder target ada
    if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
    }

    const files = fs.readdirSync(sourceDir);

    files.forEach(file => {
        if (file.endsWith('.md')) {
            const sourcePath = path.join(sourceDir, file);
            // Ubah nama file menjadi lowercase dan ganti underscore dengan hyphen
            // (misal: GETTING_STARTED.md -> getting-started.md)
            const newFileName = file.toLowerCase().replace(/_/g, '-');
            const targetPath = path.join(targetDir, newFileName);
            
            console.log(`Copying [${path.basename(sourceDir)}] ${file} -> ${newFileName}`);
            fs.copyFileSync(sourcePath, targetPath);
        }
    });
}

console.log('🔄 Starting documentation sync...');

mappings.forEach(mapping => {
    syncDir(mapping.source, mapping.target);
});

console.log('✅ Documentation sync complete.');
