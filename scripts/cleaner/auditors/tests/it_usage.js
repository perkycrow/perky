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
        if (!this.silent) {
            hint('Replace it() with test() AND remove "should" - start with method name instead.')
            hint('')
            hint('EXAMPLES:')
            hint('  test(\'should return null when empty\')  → test(\'getValue returns null for empty input\')')
            hint('  test(\'should emit change event\')       → test(\'setValue emits change\')')
            hint('  test(\'should throw error\')             → test(\'parse throws on invalid data\')')
            hint('  test(\'should be defined\')              → test(\'constructor\')')
            hint('  test(\'should call callback\')           → test(\'execute passes args to callback\')')
            hint('  test(\'should not throw when null\')     → test(\'process handles null\')')
            hint('')
            hint('PATTERNS: test(\'methodName\'), test(\'methodName does X\'), test(\'methodName handles Y\')')
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
