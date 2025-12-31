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


function printFileIssues (file, rootDir) {
    const errors = file.messages.filter(m => m.severity === 2)
    const warnings = file.messages.filter(m => m.severity === 1)

    if (errors.length === 0 && warnings.length === 0) {
        return {errors: 0, warnings: 0}
    }

    const relativePath = path.relative(rootDir, file.filePath)
    console.log(`${relativePath}:`)

    errors.forEach(msg => console.log(`  Line ${msg.line}: [ERROR] ${msg.message} (${msg.ruleId})`))
    warnings.forEach(msg => console.log(`  Line ${msg.line}: [WARN] ${msg.message} (${msg.ruleId})`))

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
        console.log(`\nTotal: ${totalErrors} error(s), ${totalWarnings} warning(s) in ${filesWithIssues} file(s)`)
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
    const eslintResult = runEslintCheck(rootDir)

    return {comments: commentResult, unusedDirectives: unusedResult, eslint: eslintResult}
}


// === CLI ===

const rootDir = path.resolve(__dirname, '..')
const dryRun = process.argv.includes('--dry-run')
const verbose = process.argv.includes('--verbose')

run(rootDir, {dryRun, verbose})
