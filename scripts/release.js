const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { execSync } = require('child_process');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

// Paths
const rootDir = path.resolve(__dirname, '..');
const websiteDir = path.join(rootDir, 'website');
const packageJsonPath = path.join(rootDir, 'package.json');
const websitePackageJsonPath = path.join(websiteDir, 'package.json');

// Read current version
const pkg = require(packageJsonPath);
const currentVersion = pkg.version;

console.log(`\n🚀 Lapeh Release Automation Script`);
console.log(`Current Version: ${currentVersion}\n`);

// Helper to get git changes
function getGitChanges() {
    try {
        // Try to find the last tag
        let lastTag = '';
        try {
            lastTag = execSync('git describe --tags --abbrev=0', { stdio: 'pipe' }).toString().trim();
        } catch (e) {
            // No tags found, maybe fetch all commits
            lastTag = '';
        }

        const range = lastTag ? `${lastTag}..HEAD` : 'HEAD';
        const logs = execSync(`git log ${range} --pretty=format:"%s"`, { stdio: 'pipe' }).toString().trim();
        
        if (!logs) return [];
        
        // Filter out chores, merges, etc. if desired, or keep everything
        return logs.split('\n')
            .map(l => l.trim())
            .filter(l => 
                l && 
                !l.startsWith('chore:') && 
                !l.startsWith('Merge branch') &&
                !l.startsWith('docs: release') &&
                !l.includes('release v') &&
                !l.includes('Update version')
            );
    } catch (e) {
        return [];
    }
}

// Helper to get npm version
function getNpmVersion() {
    try {
        return execSync('npm view lapeh version', { stdio: 'pipe' }).toString().trim();
    } catch (e) {
        return null;
    }
}

// Helper to increment patch version
function incrementPatch(version) {
    const parts = version.split('.').map(Number);
    if (parts.length !== 3 || parts.some(isNaN)) return version; // Fallback
    parts[2]++;
    return parts.join('.');
}

// Helper to generate auto commit message
function generateAutoCommitMessage() {
    try {
        const status = execSync('git status --porcelain', { stdio: 'pipe' }).toString().trim();
        if (!status) return 'chore: no changes detected';

        const files = status.split('\n').map(line => line.substring(3).trim());
        
        const hasDocs = files.some(f => f.startsWith('website/') || f.startsWith('doc/') || f.endsWith('.md'));
        const hasScripts = files.some(f => f.startsWith('scripts/'));
        const hasPackage = files.some(f => f.includes('package.json'));
        const hasSrc = files.some(f => !f.startsWith('website/') && !f.startsWith('doc/') && !f.startsWith('scripts/') && !f.includes('package.json') && !f.startsWith('.'));

        let types = [];
        if (hasDocs) types.push('docs');
        if (hasScripts) types.push('scripts');
        if (hasPackage) types.push('deps');
        if (hasSrc) types.push('feat/fix');

        if (types.length === 0) return 'chore: update project files';
        
        if (hasDocs && !hasSrc && !hasScripts) return 'docs: update documentation';
        if (hasScripts && !hasSrc) return 'chore: update build scripts';
        
        return `chore: update ${types.join(', ')}`;
    } catch (e) {
        return 'chore: update project files';
    }
}

async function main() {
    try {
        // 0. Quick Git Update Check
        const quickGit = await question('\n⚡ Apakah ini hanya Quick Git Update (tanpa rilis versi)? (y/n): ');
        if (quickGit.toLowerCase() === 'y') {
             console.log('\n🤖 Auto-generating commit message...');
             const commitMsg = generateAutoCommitMessage();
             console.log(`📝 Commit Message: "${commitMsg}"`);
             
             try {
                 console.log('🔄 Syncing documentation (just in case)...');
                 try {
                    execSync('node scripts/sync-docs.js', { cwd: websiteDir, stdio: 'inherit' });
                 } catch (e) {
                    console.log('⚠️ Warning: Doc sync failed, continuing...');
                 }

                 execSync('git add .', { stdio: 'inherit' });
                 execSync(`git commit -m "${commitMsg}"`, { stdio: 'inherit' });
                 execSync('git push origin HEAD', { stdio: 'inherit' });
                 console.log('✅ Quick Git Update selesai!');
                 process.exit(0);
             } catch (e) {
                 console.error('❌ Error during git operations:', e.message);
                 process.exit(1);
             }
        }

        // 1. Check versions and ask for new one
        console.log('🔍 Checking npm version...');
        const npmVersion = getNpmVersion();
        const baseVersion = npmVersion || currentVersion;
        const suggestedVersion = incrementPatch(baseVersion);
        
        console.log(`Latest npm version: ${npmVersion || 'Not found (using local)'}`);
        console.log(`Current local version: ${currentVersion}`);

        const newVersionInput = await question(`Enter new version (default: ${suggestedVersion}): `);
        const newVersion = newVersionInput.trim() || suggestedVersion;

        if (!newVersion) {
            console.log('❌ Version is required');
            process.exit(1);
        }

        // Always update package.json locally first
        console.log('\n📦 Updating package.json files...');
        updatePackageJson(packageJsonPath, newVersion);
        updatePackageJson(websitePackageJsonPath, newVersion);

        // 2. Question: Blog
        const createBlog = await question('\n1. Apa Anda akan membuatkan blog untuk fitur baru ini? (y/n): ');
        let blogTitleEN = '';

        if (createBlog.toLowerCase() === 'y') {
            console.log('\n🤖 Auto-detecting changes from Git...');
            const changes = getGitChanges();
            
            // Heuristics for defaults
            const defaultTitle = changes.length > 0 ? changes[0] : 'Maintenance Release';
            const defaultDesc = changes.length > 0 ? `Includes: ${changes.slice(0, 2).join(', ')}` : 'Routine maintenance and updates.';
            const defaultFeatures = changes.join(', ');

            // Use defaults directly
            const titleID = defaultTitle;
            const descriptionID = defaultDesc;
            const featuresID = defaultFeatures;

            const titleEN = defaultTitle;
            const descriptionEN = defaultDesc;
            const featuresEN = defaultFeatures;
            
            blogTitleEN = titleEN; // Save for commit message

            console.log('📝 Generating blog posts...');
            const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
            const dateString = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
            const dateStringEn = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
            
            const blogFileName = `release-v${newVersion}.md`;
            
            // Generate list items
            const featureListID = changes.length > 0 
                ? changes.map(f => `*   **${f.trim()}**`).join('\n')
                : '*   **Routine maintenance**';
                
            const featureListEN = changes.length > 0
                ? changes.map(f => `*   **${f.trim()}**`).join('\n')
                : '*   **Routine maintenance**';

            // Indonesian Blog Content
            const idContent = `---
title: "Rilis v${newVersion} - ${titleID.replace(/"/g, '\\"')}"
date: ${date}
author: Tim Lapeh
description: "${descriptionID.replace(/"/g, '\\"')}"
---

# Rilis v${newVersion}: ${titleID}

Kami dengan senang hati mengumumkan rilis **Lapeh Framework v${newVersion}**!

## Apa yang Baru?

${descriptionID}

### Fitur Utama 🚀

${featureListID}

## Cara Update

\`\`\`bash
npm install lapeh@latest
\`\`\`

Terima kasih telah menggunakan Lapeh Framework!
`;

            // English Blog Content
            const enContent = `---
title: "Release v${newVersion} - ${titleEN.replace(/"/g, '\\"')}"
date: ${date}
author: Lapeh Team
description: "${descriptionEN.replace(/"/g, '\\"')}"
---

# Release v${newVersion}: ${titleEN}

We are excited to announce the release of **Lapeh Framework v${newVersion}**!

## What's New?

${descriptionEN}

### Key Features 🚀

${featureListEN}

## How to Update

\`\`\`bash
npm install lapeh@latest
\`\`\`

Thank you for using Lapeh Framework!
`;

            fs.writeFileSync(path.join(websiteDir, 'blog', blogFileName), idContent);
            fs.writeFileSync(path.join(websiteDir, 'en/blog', blogFileName), enContent);

            console.log('📑 Updating blog indexes...');
            updateBlogIndex(path.join(websiteDir, 'blog/index.md'), newVersion, titleID, dateString, descriptionID, blogFileName, 'id');
            updateBlogIndex(path.join(websiteDir, 'en/blog/index.md'), newVersion, titleEN, dateStringEn, descriptionEN, blogFileName, 'en');
        } else {
            console.log('⏭️  Skipping blog generation.');
        }

        // 3. Question: Documentation
        const updateDocs = await question('\n2. Apa Anda ingin update dokumentasi? (y/n): ');
        if (updateDocs.toLowerCase() === 'y') {
             console.log('\n📚 Documentation Update:');
             console.log('Sistem akan menjalankan sinkronisasi otomatis:');
             console.log('  - Menyalin file dari `doc/id` ke `website/docs`');
             console.log('  - Menyalin file dari `doc/en` ke `website/en/docs`');
             console.log('  - Mengubah nama file menjadi format URL-friendly (contoh: GETTING_STARTED.md -> getting-started.md)');

             console.log('\n⚠️  Manual Action Required (If applicable):');
             console.log('Jika ada package/method baru, silakan update file berikut secara manual sekarang:');
             console.log('  - website/docs/packages.md');
             console.log('  - website/docs/api.md');
             
             await question('Tekan Enter untuk menjalankan sinkronisasi otomatis (setelah Anda selesai update manual)...');

             console.log('🔄 Syncing documentation...');
             execSync('node scripts/sync-docs.js', { cwd: websiteDir, stdio: 'inherit' });
        } else {
             console.log('⏭️  Skipping documentation sync.');
        }

        // 4. Question: Git
        const pushGit = await question('\n3. Apa ingin publish ke Git? (y/n): ');
        if (pushGit.toLowerCase() === 'y') {
            const commitMsg = blogTitleEN 
                ? `chore: release v${newVersion} - ${blogTitleEN}`
                : `chore: release v${newVersion}`;

            execSync('git add .', { stdio: 'inherit' });
            execSync(`git commit -m "${commitMsg}"`, { stdio: 'inherit' });
            execSync(`git tag v${newVersion}`, { stdio: 'inherit' });
            execSync(`git push origin HEAD && git push origin v${newVersion}`, { stdio: 'inherit' });
            console.log('✅ Git push & tag complete');
        } else {
            console.log('⏭️  Skipping Git push.');
        }

        // 5. Question: NPM
        const publishNpm = await question('\n4. Apa ingin publish ke NPM? (y/n): ');
        if (publishNpm.toLowerCase() === 'y') {
            execSync('npm publish', { stdio: 'inherit' });
            console.log('✅ NPM publish complete');
        } else {
             console.log('⏭️  Skipping NPM publish.');
        }

        console.log('\n✨ Proses selesai!');

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        rl.close();
    }
}

function updatePackageJson(filePath, version) {
    const json = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    json.version = version;
    fs.writeFileSync(filePath, JSON.stringify(json, null, 2) + '\n');
    console.log(`Updated ${path.basename(filePath)} to ${version}`);
}

function updateBlogIndex(filePath, version, title, date, description, fileName, lang) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    const readMore = lang === 'id' ? 'Baca selengkapnya' : 'Read more';
    const releaseTag = lang === 'id' ? 'Rilis' : 'Release';

    // Construct new entry
    const newEntry = `## 🚀 [${releaseTag} v${version}: ${title}](./${fileName.replace('.md', '')})

_${date}_ • 👤 Lapeh Team • 🏷️ _Release_

${description} [${readMore} →](./${fileName.replace('.md', '')})

---

`;
    
    const separator = '---';
    const parts = content.split(separator);
    
    if (parts.length >= 2) {
        parts.splice(1, 0, '\n\n' + newEntry.trim() + '\n\n');
        content = parts.join(separator);
    } else {
        content = content + '\n\n' + newEntry;
    }

    fs.writeFileSync(filePath, content);
}

main();
