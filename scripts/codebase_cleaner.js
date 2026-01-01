#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import {fileURLToPath} from 'url'
import {execSync} from 'child_process'


const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)


// === CONFIGURATION ===

const PROTECTED_COMMENT_PATTERNS = [
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
    /@vite-ignore/,
    /@vitest-environment/,
    /^\s*=+\s+.+\s+=+\s*$/
]

const EXCLUDED_FILES = [
    'scripts/codebase_cleaner.js'
]

const EXCLUDED_PATTERNS = [
    /\.test\.js$/
]


// === HELPERS ===

function isExcludedFile (relativePath) {
    if (EXCLUDED_FILES.some(f => relativePath === f || relativePath.endsWith('/' + f))) {
        return true
    }

    return EXCLUDED_PATTERNS.some(pattern => pattern.test(relativePath))
}


function isProtectedComment (commentText) {
    return PROTECTED_COMMENT_PATTERNS.some(pattern => pattern.test(commentText))
}


function isInsideString (textBefore) {
    const doubleQuotes = (textBefore.match(/"/g) || []).length
    const singleQuotes = (textBefore.match(/'/g) || []).length
    const backticks = (textBefore.match(/`/g) || []).length

    return (doubleQuotes + singleQuotes + backticks) % 2 !== 0
}


function isUrlComment (textBefore) {
    return /https?:$/.test(textBefore)
}


function isUnusedDirectiveMessage (message) {
    return message && message.includes('Unused eslint-disable directive')
}


// === COMMENT REMOVAL ===

function removeSingleLineComments (content) {
    const comments = []

    const result = content.replace(/^(.*?)\/\/(.*)$/gm, (match, before, after) => {
        if (isUrlComment(before)) {
            return match
        }

        if (isInsideString(before)) {
            return match
        }

        if (isProtectedComment(after)) {
            return match
        }

        comments.push({type: 'single-line', text: '//' + after.trim()})
        return before.trimEnd()
    })

    return {result, comments}
}


function removeMultiLineComments (content, originalContent) {
    const comments = []

    const result = content.replace(/\/\*[\s\S]*?\*\//g, (match, offset) => {
        if (isProtectedComment(match)) {
            return match
        }

        const beforeMatch = originalContent.substring(0, offset)
        const lineStart = beforeMatch.lastIndexOf('\n') + 1
        const textBeforeOnLine = originalContent.substring(lineStart, offset)

        if (isInsideString(textBeforeOnLine)) {
            return match
        }

        const preview = match.length > 100 ? match.substring(0, 100) + '...' : match
        comments.push({type: 'multi-line', text: preview})
        return ''
    })

    return {result, comments}
}


function normalizeWhitespace (content) {
    let result = content.replace(/^[ \t]+$/gm, '')
    result = result.replace(/\n{4,}/g, '\n\n\n')
    return result
}


function cleanFileContent (content) {
    const originalContent = content
    let allComments = []

    const singleLine = removeSingleLineComments(content)
    content = singleLine.result
    allComments = allComments.concat(singleLine.comments)

    const multiLine = removeMultiLineComments(content, originalContent)
    content = multiLine.result
    allComments = allComments.concat(multiLine.comments)

    content = normalizeWhitespace(content)

    return {
        result: content,
        comments: allComments,
        modified: allComments.length > 0
    }
}


// === ESLINT UNUSED DIRECTIVES ===

function extractUnusedFromFile (file, rootDir) {
    const unusedMessages = file.messages.filter(m => isUnusedDirectiveMessage(m.message))

    if (unusedMessages.length === 0) {
        return null
    }

    return {
        filePath: file.filePath,
        relativePath: path.relative(rootDir, file.filePath),
        directives: unusedMessages.map(m => ({line: m.line, message: m.message}))
    }
}


function parseEslintOutput (output, rootDir) {
    const data = JSON.parse(output)
    return data.map(file => extractUnusedFromFile(file, rootDir)).filter(Boolean)
}


function findUnusedEslintDirectives (rootDir) {
    try {
        const output = execSync('npx eslint --report-unused-disable-directives --format json .', {
            cwd: rootDir,
            encoding: 'utf-8',
            stdio: ['pipe', 'pipe', 'pipe']
        })

        return parseEslintOutput(output, rootDir)
    } catch (error) {
        if (error.stdout) {
            try {
                return parseEslintOutput(error.stdout, rootDir)
            } catch {
                return []
            }
        }
        return []
    }
}


function removeUnusedDirective (content, line) {
    const lines = content.split('\n')
    const lineIndex = line - 1

    if (lineIndex < 0 || lineIndex >= lines.length) {
        return content
    }

    const currentLine = lines[lineIndex]

    const inlineMatch = currentLine.match(/^(.+?)\s*\/\/\s*eslint-disable-line\s+[\w-]+\s*$/)
    if (inlineMatch) {
        lines[lineIndex] = inlineMatch[1].trimEnd()
        return lines.join('\n')
    }

    const standaloneMatch = currentLine.match(/^\s*\/\/\s*eslint-disable-next-line\s+[\w-]+\s*$/)
    if (standaloneMatch) {
        lines.splice(lineIndex, 1)
        return lines.join('\n')
    }

    const blockMatch = currentLine.match(/^\s*\/\*\s*eslint-disable\s+[\w-]+\s*\*\/\s*$/)
    if (blockMatch) {
        lines.splice(lineIndex, 1)
        return lines.join('\n')
    }

    return content
}


function fixFileDirectives (file, dryRun) {
    if (dryRun) {
        return
    }

    let content = fs.readFileSync(file.filePath, 'utf-8')
    const sortedDirectives = [...file.directives].sort((a, b) => b.line - a.line)

    for (const directive of sortedDirectives) {
        content = removeUnusedDirective(content, directive.line)
    }

    fs.writeFileSync(file.filePath, content, 'utf-8')
}


function cleanUnusedEslintDirectives (rootDir, options = {}) {
    const dryRun = options.dryRun ?? false

    console.log('\n=== CHECKING UNUSED ESLINT DIRECTIVES ===\n')

    const unused = findUnusedEslintDirectives(rootDir)

    if (unused.length === 0) {
        console.log('No unused eslint-disable directives found.')
        return {filesFixed: 0, directivesRemoved: 0}
    }

    let totalDirectives = 0

    for (const file of unused) {
        console.log(`${file.relativePath}:`)
        file.directives.forEach(d => console.log(`  Line ${d.line}: ${d.message}`))
        totalDirectives += file.directives.length

        fixFileDirectives(file, dryRun)
        if (!dryRun) {
            console.log('  -> Fixed')
        }
    }

    console.log(`\nTotal: ${totalDirectives} unused directive(s) in ${unused.length} file(s)`)

    if (dryRun) {
        console.log('Run without --dry-run to remove them.')
    }

    return {filesFixed: unused.length, directivesRemoved: totalDirectives}
}


// === ESLINT ERRORS CHECK ===

const RULE_ADVICE = new Map([
    ['no-negated-condition', 'Invert the condition and swap if/else'],
    ['complexity', 'Split the function into smaller sub-functions'],
    ['no-unused-vars', 'Remove the unused variable'],
    ['comma-dangle', 'Remove the trailing comma'],
    ['max-statements-per-line', 'Put each statement on its own line'],
    ['max-nested-callbacks', 'Reduce nesting or extract into functions']
])


function getPrivateMethodAdvice (ruleId, message) {
    if (ruleId === 'class-methods-use-this' && message.includes('private method')) {
        return 'Extract as a regular function below the class'
    }
    return null
}


function getAdvice (ruleId, message, isTestFile) {
    const privateAdvice = getPrivateMethodAdvice(ruleId, message)
    if (privateAdvice) {
        return privateAdvice
    }

    if (ruleId === 'max-nested-callbacks' && isTestFile) {
        return 'Add // eslint-disable-line max-nested-callbacks'
    }

    return RULE_ADVICE.get(ruleId) || null
}


function runEslintFix (rootDir) {
    console.log('\n=== AUTO-FIXING ESLINT ERRORS ===\n')

    try {
        execSync('npx eslint --fix .', {
            cwd: rootDir,
            encoding: 'utf-8',
            stdio: ['pipe', 'pipe', 'pipe']
        })
        console.log('Auto-fix completed.')
    } catch {
        console.log('Auto-fix completed (some issues may remain).')
    }
}


function runEslintCheck (rootDir) {
    console.log('\n=== CHECKING ESLINT ERRORS ===\n')

    try {
        const output = execSync('npx eslint --format json .', {
            cwd: rootDir,
            encoding: 'utf-8',
            stdio: ['pipe', 'pipe', 'pipe']
        })

        const data = JSON.parse(output)
        return processEslintResults(data, rootDir)
    } catch (error) {
        if (error.stdout) {
            try {
                const data = JSON.parse(error.stdout)
                return processEslintResults(data, rootDir)
            } catch {
                console.log('Failed to parse ESLint output.')
                return {errorCount: 0, warningCount: 0, filesWithIssues: 0}
            }
        }
        console.log('ESLint check failed.')
        return {errorCount: 0, warningCount: 0, filesWithIssues: 0}
    }
}


function groupMessagesByRule (messages) {
    const grouped = {}

    for (const msg of messages) {
        const ruleId = msg.ruleId || 'unknown'
        if (!grouped[ruleId]) {
            grouped[ruleId] = []
        }
        grouped[ruleId].push(msg)
    }

    return grouped
}


function printRuleGroup (ruleId, messages, isTestFile) {
    const severity = messages[0].severity === 2 ? 'ERROR' : 'WARN'
    const lines = messages.map(m => m.line).join(', ')
    console.log(`  [${severity}] ${ruleId} (line${messages.length > 1 ? 's' : ''} ${lines})`)

    const advice = getAdvice(ruleId, messages[0].message, isTestFile)
    if (advice) {
        console.log(`         -> ${advice}`)
    }
}


function printFileIssues (file, rootDir) {
    const errors = file.messages.filter(m => m.severity === 2)
    const warnings = file.messages.filter(m => m.severity === 1)

    if (errors.length === 0 && warnings.length === 0) {
        return {errors: 0, warnings: 0}
    }

    const relativePath = path.relative(rootDir, file.filePath)
    const isTestFile = relativePath.endsWith('.test.js')

    console.log(`\n${relativePath}:`)

    const grouped = groupMessagesByRule([...errors, ...warnings])

    for (const [ruleId, messages] of Object.entries(grouped)) {
        printRuleGroup(ruleId, messages, isTestFile)
    }

    return {errors: errors.length, warnings: warnings.length}
}


function processEslintResults (data, rootDir) {
    let totalErrors = 0
    let totalWarnings = 0
    let filesWithIssues = 0

    for (const file of data) {
        const {errors, warnings} = printFileIssues(file, rootDir)
        if (errors > 0 || warnings > 0) {
            filesWithIssues++
            totalErrors += errors
            totalWarnings += warnings
        }
    }

    if (filesWithIssues === 0) {
        console.log('No ESLint errors or warnings found.')
    } else {
        console.log(`\n=== TOTAL: ${totalErrors} error(s), ${totalWarnings} warning(s) in ${filesWithIssues} file(s) ===`)
    }

    return {errorCount: totalErrors, warningCount: totalWarnings, filesWithIssues}
}


// === FILE DISCOVERY ===

function shouldSkipDirectory (name) {
    return name === 'node_modules' || name.startsWith('.')
}


function findJsFiles (dir, files = []) {
    const entries = fs.readdirSync(dir, {withFileTypes: true})

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name)

        if (entry.isDirectory() && !shouldSkipDirectory(entry.name)) {
            findJsFiles(fullPath, files)
        } else if (entry.isFile() && entry.name.endsWith('.js')) {
            files.push(fullPath)
        }
    }

    return files
}


// === MAIN ===

function processFile (filePath, rootDir, options) {
    const relativePath = path.relative(rootDir, filePath)

    if (isExcludedFile(relativePath)) {
        return null
    }

    const content = fs.readFileSync(filePath, 'utf-8')
    const {result, comments, modified} = cleanFileContent(content)

    if (comments.length === 0) {
        return null
    }

    if (options.verbose) {
        comments.forEach((c, i) => {
            const preview = c.text.length > 80 ? c.text.substring(0, 80) + '...' : c.text
            console.log(`  ${i + 1}. [${c.type}] ${preview}`)
        })
    }

    if (!options.dryRun && modified) {
        fs.writeFileSync(filePath, result, 'utf-8')
    }

    return {relativePath, count: comments.length, modified}
}


function runCommentCleaner (rootDir, options = {}) { // eslint-disable-line complexity
    const dryRun = options.dryRun ?? false

    console.log(dryRun ? '=== DRY RUN MODE ===' : '=== CLEANING COMMENTS ===')
    console.log(`Root directory: ${rootDir}\n`)

    const files = findJsFiles(rootDir)
    let totalFilesWithComments = 0
    let totalCommentsFound = 0

    for (const filePath of files) {
        const result = processFile(filePath, rootDir, options)

        if (result) {
            totalFilesWithComments++
            totalCommentsFound += result.count
            console.log(`\n${result.relativePath}: ${result.count} comment(s)`)
            if (!dryRun) {
                console.log('  -> Cleaned')
            }
        }
    }

    console.log('\n=== COMMENT SUMMARY ===')
    console.log(`Total files scanned: ${files.length}`)
    console.log(`Files with comments: ${totalFilesWithComments}`)
    console.log(`Total comments found: ${totalCommentsFound}`)

    if (dryRun && totalCommentsFound > 0) {
        console.log('\nRun without --dry-run to apply changes.')
    }

    return {
        filesScanned: files.length,
        filesWithComments: totalFilesWithComments,
        commentsFound: totalCommentsFound
    }
}


function run (rootDir, options = {}) {
    const commentResult = runCommentCleaner(rootDir, options)
    const unusedResult = cleanUnusedEslintDirectives(rootDir, options)
    const importResult = runImportExtensionCheck(rootDir, options)

    if (!options.dryRun) {
        runEslintFix(rootDir)
    }

    const eslintResult = runEslintCheck(rootDir)

    return {comments: commentResult, unusedDirectives: unusedResult, imports: importResult, eslint: eslintResult}
}


// === IMPORT EXTENSION CHECK ===

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


function hasJsExtension (importPath) {
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


function runImportExtensionCheck (rootDir, options = {}) { // eslint-disable-line complexity
    const dryRun = options.dryRun ?? false

    console.log('\n=== CHECKING MISSING .JS EXTENSIONS ===\n')

    const issues = findMissingJsExtensions(rootDir)

    if (issues.length === 0) {
        console.log('No missing .js extensions found.')
        return {filesFixed: 0, importsFixed: 0}
    }

    const byFile = {}
    for (const issue of issues) {
        if (!byFile[issue.filePath]) {
            byFile[issue.filePath] = []
        }
        byFile[issue.filePath].push(issue)
    }

    for (const [filePath, fileIssues] of Object.entries(byFile)) {
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

    const filesCount = Object.keys(byFile).length
    console.log(`\nTotal: ${issues.length} import(s) fixed in ${filesCount} file(s)`)

    if (dryRun) {
        console.log('Run without --dry-run to apply fixes.')
    }

    return {filesFixed: filesCount, importsFixed: issues.length}
}


// === ESLINT AUDIT ===

function findEslintDisables (rootDir) {
    const files = findJsFiles(rootDir)
    const disables = []

    for (const filePath of files) {
        const relativePath = path.relative(rootDir, filePath)
        const content = fs.readFileSync(filePath, 'utf-8')
        const lines = content.split('\n')

        lines.forEach((line, index) => {
            const patterns = [
                /eslint-disable-next-line\s+([\w-]+(?:,\s*[\w-]+)*)/,
                /eslint-disable-line\s+([\w-]+(?:,\s*[\w-]+)*)/,
                /eslint-disable\s+([\w-]+(?:,\s*[\w-]+)*)/
            ]

            for (const pattern of patterns) {
                const match = line.match(pattern)
                if (match) {
                    const rules = match[1].split(',').map(r => r.trim())
                    rules.forEach(rule => {
                        disables.push({
                            file: relativePath,
                            line: index + 1,
                            rule,
                            context: line.trim()
                        })
                    })
                }
            }
        })
    }

    return disables
}


function runEslintAudit (rootDir) {
    console.log('=== ESLINT DISABLE AUDIT ===\n')

    const disables = findEslintDisables(rootDir)

    if (disables.length === 0) {
        console.log('No eslint-disable directives found.')
        return
    }

    const byRule = {}
    for (const d of disables) {
        if (!byRule[d.rule]) {
            byRule[d.rule] = []
        }
        byRule[d.rule].push(d)
    }

    const sortedRules = Object.entries(byRule).sort((a, b) => b[1].length - a[1].length)

    for (const [rule, occurrences] of sortedRules) {
        console.log(`\n${rule} (${occurrences.length}):`)
        for (const occ of occurrences) {
            console.log(`  ${occ.file}:${occ.line}`)
        }
    }

    console.log(`\n=== TOTAL: ${disables.length} directive(s) for ${sortedRules.length} rule(s) ===`)
}


// === SWITCH DETECTION ===

function findSwitchStatements (rootDir) {
    const files = findJsFiles(rootDir)
    const switches = []

    for (const filePath of files) {
        const relativePath = path.relative(rootDir, filePath)
        const content = fs.readFileSync(filePath, 'utf-8')
        const lines = content.split('\n')

        lines.forEach((line, index) => {
            const match = line.match(/\bswitch\s*\(/)
            if (match) {
                switches.push({
                    file: relativePath,
                    line: index + 1,
                    context: line.trim()
                })
            }
        })
    }

    return switches
}


function runSwitchAudit (rootDir) {
    console.log('=== SWITCH STATEMENT AUDIT ===\n')

    const switches = findSwitchStatements(rootDir)

    if (switches.length === 0) {
        console.log('No switch statements found.')
        return
    }

    const byFile = {}
    for (const s of switches) {
        if (!byFile[s.file]) {
            byFile[s.file] = []
        }
        byFile[s.file].push(s)
    }

    for (const [file, occurrences] of Object.entries(byFile)) {
        console.log(`\n${file}:`)
        for (const occ of occurrences) {
            console.log(`  Line ${occ.line}: ${occ.context}`)
        }
    }

    console.log(`\n=== TOTAL: ${switches.length} switch statement(s) in ${Object.keys(byFile).length} file(s) ===`)
}


// === CLI ===

const rootDir = path.resolve(__dirname, '..')
const dryRun = process.argv.includes('--dry-run')
const verbose = process.argv.includes('--verbose')
const eslintAudit = process.argv.includes('--eslint-audit')
const fixImports = process.argv.includes('--fix-imports')
const switchAudit = process.argv.includes('--switch-audit')

if (switchAudit) {
    runSwitchAudit(rootDir)
} else if (eslintAudit) {
    runEslintAudit(rootDir)
} else if (fixImports) {
    runImportExtensionCheck(rootDir, {dryRun})
} else {
    run(rootDir, {dryRun, verbose})
}
