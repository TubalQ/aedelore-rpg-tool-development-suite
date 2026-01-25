const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');

const isWatch = process.argv.includes('--watch');

// Main JS files (can be tree-shaken)
const mainFiles = [
    'js/main.js',
    'js/dm-session.js',
    'service-worker.js'
];

// Data files (must NOT be tree-shaken - they define global variables)
const dataFiles = fs.readdirSync('data')
    .filter(f => f.endsWith('.js') && !f.endsWith('.min.js'))
    .map(f => `data/${f}`);

// System files (define global configs)
const systemFiles = fs.existsSync('js/systems')
    ? fs.readdirSync('js/systems')
        .filter(f => f.endsWith('.js') && !f.endsWith('.min.js'))
        .map(f => `js/systems/${f}`)
    : [];

// Files that need tree-shake disabled (they export globals)
const noTreeShakeFiles = [...dataFiles, ...systemFiles];

const allFiles = [...mainFiles, ...noTreeShakeFiles];

async function build() {
    console.log('Building...');

    try {
        // Build main files with tree-shaking
        if (mainFiles.length > 0) {
            await esbuild.build({
                entryPoints: mainFiles.map(f => ({ in: f, out: f.replace('.js', '.min') })),
                outdir: '.',
                minify: true,
                sourcemap: true,
                target: ['es2020'],
                format: 'iife',
                bundle: false,
                allowOverwrite: true,
            });
        }

        // Build data/system files WITHOUT tree-shaking
        // These files define global variables that are used by other scripts
        if (noTreeShakeFiles.length > 0) {
            await esbuild.build({
                entryPoints: noTreeShakeFiles.map(f => ({ in: f, out: f.replace('.js', '.min') })),
                outdir: '.',
                minify: true,
                minifyWhitespace: true,
                minifyIdentifiers: false,  // Don't rename variables (they're global)
                minifySyntax: true,
                sourcemap: true,
                target: ['es2020'],
                treeShaking: false,  // Don't remove "unused" code
                bundle: false,
                allowOverwrite: true,
            });
        }

        // Show file sizes
        console.log('\nBuild complete! File sizes:');
        for (const file of allFiles) {
            const original = fs.statSync(file).size;
            const minFile = file.replace('.js', '.min.js');
            if (fs.existsSync(minFile)) {
                const minified = fs.statSync(minFile).size;
                const savings = ((1 - minified / original) * 100).toFixed(1);
                console.log(`  ${file}: ${(original / 1024).toFixed(1)}KB -> ${(minified / 1024).toFixed(1)}KB (${savings}% smaller)`);
            }
        }

        if (isWatch) {
            console.log('\nNote: Watch mode not fully implemented for this config.');
        }
    } catch (error) {
        console.error('Build failed:', error);
        process.exit(1);
    }
}

build();
