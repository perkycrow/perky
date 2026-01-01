import fs from 'fs'
import path from 'path'
import {findJsFiles, groupBy} from './utils.js'


function resolveImportPath (fileDir, importPath) {
    const resolvedPath = path.resolve(fileDir, importPath)

    try {
        const stats = fs.statSync(resolvedPath)
        if (stats.isDirectory()) {
            const indexPath = path.join(resolvedPath, 'index.js')
            if (fs.existsSync(indexPath)) {
                return {correctedPath: importPath + '/index.js', isDirectory: true}
            }
            return {correctedPath: importPath + '.js', isDirectory: true}
        }
    } catch {
        // Path doesn't exist, assume it needs .js
    }

    return {correctedPath: importPath + '.js', isDirectory: false}
}


export function hasJsExtension (importPath) {
    return importPath.endsWith('.js') || importPath.endsWith('.json') || importPath.endsWith('.css')
}


function findMissingJsExtensions (rootDir) {
    const files = findJsFiles(rootDir)
    const issues = []

    for (const filePath of files) {
        const relativePath = path.relative(rootDir, filePath)
        const fileDir = path.dirname(filePath)
        const content = fs.readFileSync(filePath, 'utf-8')
        const lines = content.split('\n')

        lines.forEach((line, index) => {
            const importMatch = line.match(/^(\s*import\s+.+\s+from\s+['"])(\.[^'"]+)(['"].*)$/)
            const exportMatch = line.match(/^(\s*export\s+.+\s+from\s+['"])(\.[^'"]+)(['"].*)$/)
            const dynamicMatch = line.match(/^(.+import\s*\(\s*['"])(\.[^'"]+)(['"]\s*\).*)$/)

            const match = importMatch || exportMatch || dynamicMatch

            if (!match) {
                return
            }

            const importPath = match[2]

            if (hasJsExtension(importPath)) {
                return
            }

            const {correctedPath, isDirectory} = resolveImportPath(fileDir, importPath)

            issues.push({
                file: relativePath,
                filePath,
                line: index + 1,
                importPath,
                correctedPath,
                isDirectory,
                fullLine: line,
                prefix: match[1],
                suffix: match[3]
            })
        })
    }

    return issues
}


function fixMissingExtension (filePath, issues) {
    let content = fs.readFileSync(filePath, 'utf-8')
    const lines = content.split('\n')

    const sortedIssues = [...issues].sort((a, b) => b.line - a.line)

    for (const issue of sortedIssues) {
        const lineIndex = issue.line - 1
        const newLine = issue.prefix + issue.correctedPath + issue.suffix
        lines[lineIndex] = newLine
    }

    fs.writeFileSync(filePath, lines.join('\n'), 'utf-8')
}


export function auditImports (rootDir) {
    console.log('\n=== IMPORT EXTENSIONS ===\n')

    const issues = findMissingJsExtensions(rootDir)

    if (issues.length === 0) {
        console.log('All imports have .js extensions.\n')
        return {filesWithIssues: 0, importsWithIssues: 0}
    }

    const byFile = groupBy(issues, i => i.filePath)
    const filesWithIssues = Object.keys(byFile).map(f => path.relative(rootDir, f))

    console.log('Add .js extension to relative imports in the following files.')
    console.log('All local imports should end with .js for ESM compatibility.\n')

    for (const file of filesWithIssues) {
        console.log(`- ${file}`)
    }

    console.log('')

    return {filesWithIssues: filesWithIssues.length, importsWithIssues: issues.length}
}


function processFileIssues (filePath, fileIssues, rootDir, dryRun) {
    const relativePath = path.relative(rootDir, filePath)
    console.log(`${relativePath}:`)

    for (const issue of fileIssues) {
        const marker = issue.isDirectory ? ' [DIR]' : ''
        console.log(`  Line ${issue.line}: ${issue.importPath} -> ${issue.correctedPath}${marker}`)
    }

    if (!dryRun) {
        fixMissingExtension(filePath, fileIssues)
        console.log('  -> Fixed')
    }
}


export function fixImports (rootDir, dryRun = false) {
    console.log(dryRun ? '\n=== DRY RUN: IMPORTS ===' : '\n=== FIXING IMPORTS ===')
    console.log('')

    const issues = findMissingJsExtensions(rootDir)

    if (issues.length === 0) {
        console.log('No missing .js extensions found.')
        return {filesFixed: 0, importsFixed: 0}
    }

    const byFile = groupBy(issues, i => i.filePath)

    for (const [filePath, fileIssues] of Object.entries(byFile)) {
        processFileIssues(filePath, fileIssues, rootDir, dryRun)
    }

    const filesCount = Object.keys(byFile).length
    console.log(`\nTotal: ${issues.length} import(s) fixed in ${filesCount} file(s)`)

    if (dryRun) {
        console.log('Run without --dry-run to apply fixes.')
    }

    return {filesFixed: filesCount, importsFixed: issues.length}
}
