import fs from 'fs'
import path from 'path'
import Auditor from '../../auditor.js'
import {hint, listItem, divider} from '../../../format.js'


export default class SingleDescribesAuditor extends Auditor {

    static $name = 'Single Test Describes'
    static $category = 'tests'
    static $canFix = false
    static $hint = 'Remove describe() wrapper when testing only one scenario'

    audit () {
        const issues = this.#findSingleTestDescribes()

        if (issues.length === 0) {
            this.printClean('No unnecessary describe blocks found')
            return {filesWithSingleTestDescribes: 0, files: []}
        }

        this.printHeader()
        if (!this.silent) {
            hint('Remove describe wrapper or add more related tests')
            hint('Use describe() only when testing multiple scenarios of the same feature')
            divider()

            for (const {file} of issues) {
                listItem(file)
            }
        }

        return {
            filesWithSingleTestDescribes: issues.length,
            files: issues.map(i => i.file)
        }
    }


    #findSingleTestDescribes () {
        const files = this.scanFiles().filter((filePath) => {
            const relativePath = path.relative(this.rootDir, filePath)
            return relativePath.endsWith('.test.js') &&
                !relativePath.startsWith('scripts/cleaner/') &&
                relativePath !== 'doc/test_parser.test.js'
        })

        return files
            .map((filePath) => findSingleTestDescribes(filePath, this.rootDir))
            .filter(Boolean)
    }

}


function countLeadingSpaces (line) {
    const match = line.match(/^(\s*)/)
    return match ? match[1].length : 0
}


function processDescribeLine (trimmed, lineNum, indent, stack) {
    if (trimmed.startsWith('describe(')) {
        for (let i = stack.length - 1; i >= 0; i--) {
            if (stack[i].indent < indent) {
                stack[i].testCount++
                break
            }
        }
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


function countTotalTests (content) {
    const testMatches = content.match(/^\s*(test|it)\(/gm)
    return testMatches ? testMatches.length : 0
}


function findSingleTestDescribes (filePath, rootDir) {
    const relativePath = path.relative(rootDir, filePath)
    const content = fs.readFileSync(filePath, 'utf-8')

    if (countTotalTests(content) <= 1) {
        return null
    }

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
