import fs from 'fs'
import path from 'path'
import {findJsFiles, isInsideString} from './utils.js'
import {header, success, hint, listItem, divider, gray} from './format.js'


const CONSOLE_PATTERN = /\bconsole\.(log|warn|error|info|debug)\s*\(/g

const EXCLUDED_PATTERNS = [
    /\.test\.js$/,
    /^scripts\//,
    /^core\/logger\.js$/
]


function isExcludedForConsole (relativePath) {
    return EXCLUDED_PATTERNS.some(pattern => pattern.test(relativePath))
}


function findConsoleStatements (content) {
    const statements = []
    const lines = content.split('\n')

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i]
        let match

        CONSOLE_PATTERN.lastIndex = 0
        while ((match = CONSOLE_PATTERN.exec(line)) !== null) {
            const textBefore = line.substring(0, match.index)

            if (isInsideString(textBefore)) {
                continue
            }

            statements.push({
                line: i + 1,
                method: match[1],
                text: line.trim()
            })
        }
    }

    return statements
}


function scanFiles (rootDir) {
    const files = findJsFiles(rootDir)
    const filesWithConsole = []
    let totalStatements = 0

    for (const filePath of files) {
        const relativePath = path.relative(rootDir, filePath)

        if (isExcludedForConsole(relativePath)) {
            continue
        }

        const content = fs.readFileSync(filePath, 'utf-8')
        const statements = findConsoleStatements(content)

        if (statements.length > 0) {
            filesWithConsole.push({path: relativePath, statements})
            totalStatements += statements.length
        }
    }

    return {files, filesWithConsole, totalStatements}
}


function printResults (filesWithConsole) {
    for (const file of filesWithConsole) {
        listItem(file.path, file.statements.length)
        for (const stmt of file.statements) {
            console.log(`      ${gray(`L${stmt.line}:`)} console.${stmt.method}(...)`)
        }
    }
}


export function auditConsole (rootDir) {
    header('Console Statements')

    const {filesWithConsole, totalStatements} = scanFiles(rootDir)

    if (filesWithConsole.length === 0) {
        success('No console statements found')
        return {issueCount: 0}
    }

    hint('Use Logger instead: import logger from \'core/logger.js\'')
    divider()
    printResults(filesWithConsole)

    return {issueCount: totalStatements}
}
