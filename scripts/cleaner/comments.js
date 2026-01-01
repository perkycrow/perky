import fs from 'fs'
import path from 'path'
import {isExcludedFile, isInsideString, isProtectedComment, findJsFiles} from './utils.js'
import {header, success, hint, listItem, divider} from './format.js'


export function isUrlComment (textBefore) {
    return /https?:$/.test(textBefore)
}


function removeSingleLineComments (content) {
    const comments = []

    const result = content.replace(/^(.*?)\/\/(.*)$/gm, (match, before, after) => {
        if (isUrlComment(before) || isInsideString(before) || isProtectedComment(after)) {
            return match
        }
        comments.push({type: 'single-line', text: '//' + after.trim()})
        return before.trimEnd()
    })

    return {result, comments}
}


function shouldKeepMultiLineComment (match, offset, originalContent) {
    if (isProtectedComment(match)) {
        return true
    }

    const beforeMatch = originalContent.substring(0, offset)
    const lineStart = beforeMatch.lastIndexOf('\n') + 1
    const textBeforeOnLine = originalContent.substring(lineStart, offset)

    return isInsideString(textBeforeOnLine)
}


function removeMultiLineComments (content, originalContent) {
    const comments = []

    const result = content.replace(/\/\*[\s\S]*?\*\//g, (match, offset) => {
        if (shouldKeepMultiLineComment(match, offset, originalContent)) {
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


export function cleanFileContent (content) {
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


function processFile (filePath, rootDir, dryRun) {
    const relativePath = path.relative(rootDir, filePath)

    if (isExcludedFile(relativePath)) {
        return null
    }

    const content = fs.readFileSync(filePath, 'utf-8')
    const {result, comments, modified} = cleanFileContent(content)

    if (comments.length === 0) {
        return null
    }

    comments.forEach((c, i) => {
        const preview = c.text.length > 80 ? c.text.substring(0, 80) + '...' : c.text
        console.log(`  ${i + 1}. [${c.type}] ${preview}`)
    })

    if (!dryRun && modified) {
        fs.writeFileSync(filePath, result, 'utf-8')
    }

    return {relativePath, count: comments.length, modified}
}


export function auditComments (rootDir) {
    header('Comments')

    const files = findJsFiles(rootDir)
    const filesWithComments = []

    for (const filePath of files) {
        const relativePath = path.relative(rootDir, filePath)
        if (isExcludedFile(relativePath)) {
            continue
        }

        const content = fs.readFileSync(filePath, 'utf-8')
        const {comments} = cleanFileContent(content)

        if (comments.length > 0) {
            filesWithComments.push(relativePath)
        }
    }

    if (filesWithComments.length === 0) {
        success('No comments to remove')
        return {filesScanned: files.length, filesWithComments: 0, commentsFound: 0}
    }

    hint('Keep eslint directives and essential comments')
    divider()

    for (const file of filesWithComments) {
        listItem(file)
    }

    return {filesScanned: files.length, filesWithComments: filesWithComments.length, commentsFound: filesWithComments.length}
}


export function fixComments (rootDir, dryRun = false) {
    const title = dryRun ? 'Comments (dry run)' : 'Fixing Comments'
    header(title)

    const files = findJsFiles(rootDir)
    let totalFilesWithComments = 0
    let totalCommentsFound = 0

    for (const filePath of files) {
        const result = processFile(filePath, rootDir, dryRun)

        if (result) {
            totalFilesWithComments++
            totalCommentsFound += result.count
        }
    }

    if (totalFilesWithComments === 0) {
        success('No comments to remove')
    } else {
        success(`Cleaned ${totalCommentsFound} comment(s) in ${totalFilesWithComments} file(s)`)
    }

    return {filesScanned: files.length, filesWithComments: totalFilesWithComments, commentsFound: totalCommentsFound}
}
