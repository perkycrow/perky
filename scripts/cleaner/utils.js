import fs from 'fs'
import path from 'path'
import {EXCLUDED_FILES, EXCLUDED_PATTERNS, PROTECTED_COMMENT_PATTERNS} from './config.js'


export function isExcludedFile (relativePath) {
    if (EXCLUDED_FILES.some(f => relativePath === f || relativePath.endsWith('/' + f))) {
        return true
    }
    return EXCLUDED_PATTERNS.some(pattern => pattern.test(relativePath))
}


export function isProtectedComment (commentText) {
    return PROTECTED_COMMENT_PATTERNS.some(pattern => pattern.test(commentText))
}


export function isInsideString (textBefore) {
    const doubleQuotes = (textBefore.match(/"/g) || []).length
    const singleQuotes = (textBefore.match(/'/g) || []).length
    const backticks = (textBefore.match(/`/g) || []).length
    if ((doubleQuotes + singleQuotes + backticks) % 2 !== 0) {
        return true
    }
    return isInsideRegex(textBefore)
}


export function isInsideRegex (textBefore) {
    const lastSlash = textBefore.lastIndexOf('/')
    if (lastSlash === -1) {
        return false
    }

    const charBefore = textBefore[lastSlash - 1]
    if (/[a-zA-Z0-9_$)\]}"'`]/.test(charBefore)) {
        return false
    }

    const textBeforeSlash = textBefore.substring(0, lastSlash)
    const doubleQuotes = (textBeforeSlash.match(/"/g) || []).length
    const singleQuotes = (textBeforeSlash.match(/'/g) || []).length
    const backticks = (textBeforeSlash.match(/`/g) || []).length

    if ((doubleQuotes + singleQuotes + backticks) % 2 !== 0) {
        return false
    }

    const afterSlash = textBefore.substring(lastSlash + 1)
    if (/^[^/]*$/.test(afterSlash)) {
        return true
    }
    return false
}


export function shouldSkipDirectory (name) {
    return name === 'node_modules' || name === 'dist' || name.startsWith('.')
}


export function findJsFiles (dir, files = [], targetPath = null) {
    if (targetPath) {
        const stats = fs.statSync(targetPath)

        if (stats.isFile()) {
            return [targetPath]
        }

        return findJsFilesInDirectory(targetPath, [])
    }

    return findJsFilesInDirectory(dir, files)
}


function findJsFilesInDirectory (dir, files = []) {
    const entries = fs.readdirSync(dir, {withFileTypes: true})

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name)

        if (entry.isDirectory() && !shouldSkipDirectory(entry.name)) {
            findJsFilesInDirectory(fullPath, files)
        } else if (entry.isFile() && entry.name.endsWith('.js')) {
            files.push(fullPath)
        }
    }

    return files
}


export function groupBy (items, keyFn) {
    const result = {}
    for (const item of items) {
        const key = keyFn(item)
        if (!result[key]) {
            result[key] = []
        }
        result[key].push(item)
    }
    return result
}
