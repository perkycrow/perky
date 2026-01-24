import fs from 'fs'
import path from 'path'
import Auditor from '../../auditor.js'
import {hint, listItem, divider} from '../../../format.js'


export default class ItUsageAuditor extends Auditor {

    static $name = 'Test Style'
    static $category = 'tests'
    static $canFix = false
    static $hint = 'Ensure tests follow unit test philosophy, not BDD style'

    audit () {
        const itIssues = this.#findItUsage()
        const shouldIssues = this.#findTestShouldUsage()

        if (itIssues.length === 0 && shouldIssues.length === 0) {
            this.printClean('All test files follow unit test philosophy')
            return {filesWithItUsage: 0, filesWithTestShould: 0, files: []}
        }

        this.printHeader()
        hint('PROBLEM: These test files use BDD-style naming instead of unit test philosophy.')
        hint('')
        hint('BDD (Behavior-Driven Development) uses "should" to describe behavior from user perspective:')
        hint('  it(\'should return true when value is valid\')')
        hint('  test(\'should emit event when clicked\')  ← WRONG: This is just it() renamed to test()')
        hint('')
        hint('Unit tests describe WHAT is being tested, not behavior. They are direct and method-focused:')
        hint('  test(\'validate\')  ← Simple: just the method name')
        hint('  test(\'validate returns true for valid input\')  ← With context if needed')
        hint('  test(\'emit calls callback\')  ← Action + result, no "should"')
        hint('')
        hint('WHY THIS MATTERS:')
        hint('- "should" is redundant - tests are expectations by definition')
        hint('- Unit tests focus on the code structure (methods, functions)')
        hint('- BDD focuses on user stories and behavior specifications')
        hint('- Mixing styles creates inconsistency and confusion')
        hint('')
        hint('HOW TO FIX:')
        hint('1. Remove "should" from test names - it adds no value')
        hint('2. Start with the method/function name being tested')
        hint('3. Describe what happens, not what "should" happen')
        hint('4. Keep it short and direct')
        hint('')
        hint('EXAMPLES OF CONVERSION:')
        hint('  BAD:  test(\'should return null when input is empty\')')
        hint('  GOOD: test(\'getValue returns null for empty input\')')
        hint('')
        hint('  BAD:  test(\'should emit change event\')')
        hint('  GOOD: test(\'setValue emits change event\')')
        hint('')
        hint('  BAD:  test(\'should throw error for invalid data\')')
        hint('  GOOD: test(\'parse throws on invalid data\')')
        hint('')
        hint('  BAD:  test(\'should be defined\')')
        hint('  GOOD: test(\'constructor\')')
        hint('')
        hint('  BAD:  test(\'should call the callback with correct arguments\')')
        hint('  GOOD: test(\'execute passes args to callback\')')
        hint('')
        hint('  BAD:  test(\'should not throw when value is null\')')
        hint('  GOOD: test(\'process handles null\')')
        hint('')
        hint('NAMING PATTERNS:')
        hint('- Simple method test: test(\'methodName\')')
        hint('- With context: test(\'methodName does X\')')
        hint('- Edge case: test(\'methodName handles null\')')
        hint('- Error case: test(\'methodName throws on invalid input\')')
        hint('- Return value: test(\'methodName returns X for Y\')')
        hint('')
        hint('Run "yarn test" after changes to ensure nothing breaks.')
        divider()

        if (itIssues.length > 0) {
            hint('Files using it():')
            for (const {file} of itIssues) {
                listItem(file)
            }
            divider()
        }

        if (shouldIssues.length > 0) {
            hint('Files using test(\'should ...\') - BDD disguised as unit test:')
            for (const {file, count} of shouldIssues) {
                listItem(`${file} (${count} occurrences)`)
            }
        }

        const allFiles = [...new Set([
            ...itIssues.map(i => i.file),
            ...shouldIssues.map(i => i.file)
        ])]

        return {
            filesWithItUsage: itIssues.length,
            filesWithTestShould: shouldIssues.length,
            files: allFiles
        }
    }


    #findItUsage () {
        const files = this.#getTestFiles()

        return files
            .map((filePath) => analyzeFileItUsage(filePath, this.rootDir))
            .filter(Boolean)
    }


    #findTestShouldUsage () {
        const files = this.#getTestFiles()

        return files
            .map((filePath) => analyzeFileTestShouldUsage(filePath, this.rootDir))
            .filter(Boolean)
    }


    #getTestFiles () {
        return this.scanFiles().filter((filePath) => {
            const relativePath = path.relative(this.rootDir, filePath)
            return relativePath.endsWith('.test.js') && !relativePath.startsWith('scripts/cleaner/')
        })
    }

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


function analyzeFileTestShouldUsage (filePath, rootDir) {
    const relativePath = path.relative(rootDir, filePath)
    const content = fs.readFileSync(filePath, 'utf-8')
    const lines = content.split('\n')
    const shouldLines = []

    for (let i = 0; i < lines.length; i++) {
        if (/\btest\s*\(\s*['"`]should\b/.test(lines[i])) {
            shouldLines.push({line: i + 1, text: lines[i].trim().substring(0, 60)})
        }
    }

    return shouldLines.length > 0 ? {file: relativePath, count: shouldLines.length, lines: shouldLines} : null
}
