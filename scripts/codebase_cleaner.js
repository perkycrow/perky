#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import {fileURLToPath} from 'url'


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


// === FILE DISCOVERY ===

function findJsFiles (dir, files = []) { // eslint-disable-line complexity
    const entries = fs.readdirSync(dir, {withFileTypes: true})

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name)

        if (entry.isDirectory()) {
            if (entry.name === 'node_modules' || entry.name.startsWith('.')) {
                continue
            }
            findJsFiles(fullPath, files)
        } else if (entry.isFile() && entry.name.endsWith('.js')) {
            files.push(fullPath)
        }
    }

    return files
}


// === MAIN ===

function run (rootDir, options = {}) { // eslint-disable-line complexity
    const dryRun = options.dryRun ?? false
    const verbose = options.verbose ?? false

    console.log(dryRun ? '=== DRY RUN MODE ===' : '=== CLEANING CODEBASE ===')
    console.log(`Root directory: ${rootDir}\n`)

    const files = findJsFiles(rootDir)
    let totalFilesWithComments = 0
    let totalCommentsFound = 0

    for (const filePath of files) {
        const relativePath = path.relative(rootDir, filePath)

        if (isExcludedFile(relativePath)) {
            continue
        }

        const content = fs.readFileSync(filePath, 'utf-8')
        const {result, comments, modified} = cleanFileContent(content)

        if (comments.length > 0) {
            totalFilesWithComments++
            totalCommentsFound += comments.length

            console.log(`\n${relativePath}: ${comments.length} comment(s)`)

            if (verbose) {
                comments.forEach((c, i) => {
                    const preview = c.text.length > 80 ? c.text.substring(0, 80) + '...' : c.text
                    console.log(`  ${i + 1}. [${c.type}] ${preview}`)
                })
            }

            if (!dryRun && modified) {
                fs.writeFileSync(filePath, result, 'utf-8')
                console.log('  -> Cleaned')
            }
        }
    }

    console.log('\n=== SUMMARY ===')
    console.log(`Total files scanned: ${files.length}`)
    console.log(`Files with comments: ${totalFilesWithComments}`)
    console.log(`Total comments found: ${totalCommentsFound}`)

    if (dryRun) {
        console.log('\nRun without --dry-run to apply changes.')
    }

    return {
        filesScanned: files.length,
        filesWithComments: totalFilesWithComments,
        commentsFound: totalCommentsFound
    }
}


// === CLI ===

const rootDir = path.resolve(__dirname, '..')
const dryRun = process.argv.includes('--dry-run')
const verbose = process.argv.includes('--verbose')

run(rootDir, {dryRun, verbose})
