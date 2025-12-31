#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.resolve(__dirname, '..');
const dryRun = process.argv.includes('--dry-run');
const verbose = process.argv.includes('--verbose');

const excludePatterns = [
    /eslint-disable/,
    /eslint-enable/,
    /eslint-ignore/,
    /eslint-env/,
    /global\s+\w+/,
    /globals\s+\w+/,
    /jshint/,
    /jslint/,
    /prettier-ignore/,
    /webpack/,
    /istanbul/,
    /c8/,
    /@ts-/,
    /@type/,
    /@param/,
    /@returns/,
    /@typedef/,
    /@vite-ignore/,
    /@vitest-environment/,
    /^\s*=+\s+.+\s+=+\s*$/,
];

const excludeFiles = [
    'scripts/remove-comments.js',
];

function shouldKeepComment(commentText) {
    return excludePatterns.some(pattern => pattern.test(commentText));
}

function removeComments(content, filePath) {
    const comments = [];
    let result = content;
    let modified = false;

    // Remove single-line comments (//)
    // But be careful not to remove URLs (http://, https://)
    result = result.replace(/^(.*?)\/\/(.*)$/gm, (match, before, after) => {
        const fullComment = '//' + after;

        // Check if it's part of a URL
        if (before.match(/https?:$/)) {
            return match;
        }

        // Check if it's inside a string
        const quotesBefore = (before.match(/"/g) || []).length + (before.match(/'/g) || []).length + (before.match(/`/g) || []).length;
        if (quotesBefore % 2 !== 0) {
            return match; // Inside a string
        }

        // Check if we should keep this comment
        if (shouldKeepComment(after)) {
            return match;
        }

        comments.push({ type: 'single-line', text: fullComment.trim() });
        modified = true;
        return before.trimEnd();
    });

    result = result.replace(/\/\*[\s\S]*?\*\//g, (match, offset) => {
        if (shouldKeepComment(match)) {
            return match;
        }

        const beforeMatch = content.substring(0, offset);
        const lineStart = beforeMatch.lastIndexOf('\n') + 1;
        const textBeforeOnLine = content.substring(lineStart, offset);

        if (/['"`]/.test(textBeforeOnLine)) {
            const quotes = (textBeforeOnLine.match(/['"`]/g) || []).length;
            if (quotes % 2 !== 0) {
                return match;
            }
        }

        comments.push({ type: 'multi-line', text: match.substring(0, 100) + (match.length > 100 ? '...' : '') });
        modified = true;
        return '';
    });

    result = result.replace(/\n{3,}/g, '\n\n');

    return { result, comments, modified };
}

function findJsFiles(dir, files = []) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        // Skip node_modules and hidden directories
        if (entry.isDirectory()) {
            if (entry.name === 'node_modules' || entry.name.startsWith('.')) {
                continue;
            }
            findJsFiles(fullPath, files);
        } else if (entry.isFile() && entry.name.endsWith('.js')) {
            files.push(fullPath);
        }
    }

    return files;
}

function main() {
    console.log(dryRun ? '=== DRY RUN MODE ===' : '=== REMOVING COMMENTS ===');
    console.log(`Root directory: ${rootDir}\n`);

    const files = findJsFiles(rootDir);
    let totalFilesWithComments = 0;
    let totalCommentsFound = 0;

    for (const filePath of files) {
        const relativePath = path.relative(rootDir, filePath);

        if (excludeFiles.some(f => relativePath === f || relativePath.endsWith('/' + f))) {
            continue;
        }

        if (relativePath.endsWith('.test.js')) {
            continue;
        }

        const content = fs.readFileSync(filePath, 'utf-8');
        const { result, comments, modified } = removeComments(content, filePath);

        if (comments.length > 0) {
            totalFilesWithComments++;
            totalCommentsFound += comments.length;

            console.log(`\n${relativePath}: ${comments.length} comment(s)`);

            if (verbose) {
                comments.forEach((c, i) => {
                    console.log(`  ${i + 1}. [${c.type}] ${c.text.substring(0, 80)}${c.text.length > 80 ? '...' : ''}`);
                });
            }

            if (!dryRun && modified) {
                fs.writeFileSync(filePath, result, 'utf-8');
                console.log(`  -> Comments removed`);
            }
        }
    }

    console.log('\n=== SUMMARY ===');
    console.log(`Total files scanned: ${files.length}`);
    console.log(`Files with comments: ${totalFilesWithComments}`);
    console.log(`Total comments found: ${totalCommentsFound}`);

    if (dryRun) {
        console.log('\nRun without --dry-run to actually remove comments.');
    }
}

main();
