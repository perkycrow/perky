import fs from 'fs'
import path from 'path'
import {findJsFiles, isExcludedFile} from './utils.js'
import {header, success, hint, listItem, divider} from './format.js'


function findTestFiles (rootDir) {
    return findJsFiles(rootDir).filter((filePath) => {
        const relativePath = path.relative(rootDir, filePath)
        return relativePath.endsWith('.test.js') && !relativePath.startsWith('scripts/cleaner/')
    })
}


function countLeadingSpaces (line) {
    const match = line.match(/^(\s*)/)
    return match ? match[1].length : 0
}


function isTestLine (line) {
    const trimmed = line.trim()
    return trimmed.startsWith('describe(') || trimmed.startsWith('test(') || trimmed.startsWith('it(')
}


function analyzeFileNesting (filePath, rootDir, indentThreshold) {
    const relativePath = path.relative(rootDir, filePath)
    const content = fs.readFileSync(filePath, 'utf-8')
    const lines = content.split('\n')
    const deepLines = []

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i]
        const indent = countLeadingSpaces(line)
        if (isTestLine(line) && indent >= indentThreshold) {
            deepLines.push({line: i + 1, indent, text: line.trim().substring(0, 50)})
        }
    }

    return deepLines.length > 0 ? {file: relativePath, deepLines} : null
}


function findDeepNesting (rootDir) {
    const files = findTestFiles(rootDir)
    const indentThreshold = 12

    return files
        .map((filePath) => analyzeFileNesting(filePath, rootDir, indentThreshold))
        .filter(Boolean)
}


function analyzeFileItUsage (filePath, rootDir) {
    const relativePath = path.relative(rootDir, filePath)
    const content = fs.readFileSync(filePath, 'utf-8')
    const lines = content.split('\n')
    const itLines = []

    for (let i = 0; i < lines.length; i++) {
        if (/\bit\s*\(/.test(lines[i])) {
            itLines.push({line: i + 1, text: lines[i].trim().substring(0, 60)})
        }
    }

    return itLines.length > 0 ? {file: relativePath, count: itLines.length, lines: itLines} : null
}


function findItUsage (rootDir) {
    const files = findTestFiles(rootDir)

    return files
        .map((filePath) => analyzeFileItUsage(filePath, rootDir))
        .filter(Boolean)
}


function processDescribeLine (trimmed, lineNum, indent, stack) {
    if (trimmed.startsWith('describe(')) {
        stack.push({line: lineNum, indent, testCount: 0, text: trimmed.substring(0, 40)})
    }
}


function processTestLine (trimmed, indent, stack) {
    if (!trimmed.startsWith('test(') && !trimmed.startsWith('it(')) {
        return
    }
    for (let i = stack.length - 1; i >= 0; i--) {
        if (stack[i].indent < indent) {
            stack[i].testCount++
            break
        }
    }
}


function processClosingBrace (trimmed, indent, stack, issues) {
    if (trimmed !== '})' || stack.length === 0) {
        return
    }
    const last = stack[stack.length - 1]
    if (last.indent < indent) {
        return
    }
    const closed = stack.pop()
    if (closed.testCount === 1) {
        issues.push({line: closed.line, text: closed.text})
    }
}


function findSingleTestDescribes (filePath, rootDir) {
    const relativePath = path.relative(rootDir, filePath)
    const content = fs.readFileSync(filePath, 'utf-8')
    const lines = content.split('\n')
    const issues = []
    const stack = []

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i]
        const trimmed = line.trim()
        const indent = countLeadingSpaces(line)

        processDescribeLine(trimmed, i + 1, indent, stack)
        processTestLine(trimmed, indent, stack)
        processClosingBrace(trimmed, indent, stack, issues)
    }

    return issues.length > 0 ? {file: relativePath, issues} : null
}


function findSingleTestDescribesAll (rootDir) {
    const files = findTestFiles(rootDir)

    return files
        .map((filePath) => findSingleTestDescribes(filePath, rootDir))
        .filter(Boolean)
}


function shouldExcludeFromTestAudit (relativePath) { // eslint-disable-line complexity
    if (!relativePath.includes('/')) {
        return true
    }

    if (relativePath.endsWith('/index.js') || relativePath === 'index.js') {
        return true
    }

    if (relativePath.startsWith('scripts/') && relativePath.split('/').length === 2) {
        return true
    }

    if (relativePath.startsWith('examples/')) {
        return true
    }

    if (relativePath.endsWith('_controller.js') &&
        !relativePath.startsWith('game/') &&
        !relativePath.startsWith('application/')) {
        return true
    }

    if (relativePath.endsWith('_renderer.js') && !relativePath.startsWith('render/')) {
        return true
    }

    return false
}


function findFilesWithoutTests (rootDir) {
    const files = findJsFiles(rootDir)
    const missing = []

    for (const filePath of files) {
        const relativePath = path.relative(rootDir, filePath)

        if (isExcludedFile(relativePath)) {
            continue
        }

        if (relativePath.endsWith('.test.js')) {
            continue
        }

        if (shouldExcludeFromTestAudit(relativePath)) {
            continue
        }

        const testPath = filePath.replace(/\.js$/, '.test.js')

        if (!fs.existsSync(testPath)) {
            missing.push({
                file: relativePath,
                expectedTest: path.relative(rootDir, testPath)
            })
        }
    }

    return missing
}


function printDeepNestingAudit (issues) {
    header('Deep Nesting')

    if (issues.length === 0) {
        success('No deeply nested tests found')
        return
    }

    hint('Flatten structure - each describe should group related tests')
    divider()

    for (const {file} of issues) {
        listItem(file)
    }
}


function printItUsageAudit (issues) {
    header('it() Usage')

    if (issues.length === 0) {
        success('All test files use test() syntax')
        return
    }

    hint('Use test() instead of it() for unit tests')
    hint('it() = BDD specs ("it should do X") - describes behavior from user perspective')
    hint('test() = unit tests ("test X does Y") - verifies implementation directly')
    hint('Sentences are for edge cases, simple methods can use test("methodName")')
    hint('These files need refactoring to follow unit test conventions')
    divider()

    for (const {file, count} of issues) {
        listItem(file, count)
    }
}


function printSingleTestDescribesAudit (issues) {
    header('Single-Test Describes')

    if (issues.length === 0) {
        success('No unnecessary describe blocks found')
        return
    }

    hint('Remove describe wrapper or add more related tests')
    divider()

    for (const {file, issues: fileIssues} of issues) {
        listItem(file, fileIssues.length)
    }
}


function printMissingTestsAudit (missing) {
    header('Missing Tests')

    if (missing.length === 0) {
        success('All files have corresponding test files')
        return
    }

    hint('Create test files that import and test exported functions')
    divider()

    for (const {expectedTest} of missing) {
        listItem(expectedTest)
    }
}


export function auditTests (rootDir) {
    const missing = findFilesWithoutTests(rootDir)
    const deepNesting = findDeepNesting(rootDir)
    const itUsage = findItUsage(rootDir)
    const singleTestDescribes = findSingleTestDescribesAll(rootDir)

    printMissingTestsAudit(missing)
    printDeepNestingAudit(deepNesting)
    printItUsageAudit(itUsage)
    printSingleTestDescribesAudit(singleTestDescribes)

    return {
        filesWithoutTests: missing.length,
        filesWithDeepNesting: deepNesting.length,
        filesWithItUsage: itUsage.length,
        filesWithSingleTestDescribes: singleTestDescribes.length
    }
}
