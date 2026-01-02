import fs from 'fs'
import path from 'path'
import Auditor from '../../auditor.js'
import {findJsFiles} from '../../utils.js'
import {header, hint, listItem, divider} from '../../format.js'


export default class DeepNestingAuditor extends Auditor {

    static $name = 'Deep Nesting'
    static $category = 'tests'
    static $canFix = false

    audit () {
        const issues = this.#findDeepNesting()

        if (issues.length === 0) {
            this.printClean('No deeply nested tests found')
            return {filesWithDeepNesting: 0}
        }

        header(this.constructor.$name)
        hint('Flatten structure - each describe should group related tests')
        hint('Too many nested describes - try to flatten by removing unnecessary wrappers')
        divider()

        for (const {file} of issues) {
            listItem(file)
        }

        return {filesWithDeepNesting: issues.length}
    }


    analyze () { // eslint-disable-line local/class-methods-use-this -- clean
        return []
    }


    #findDeepNesting () {
        const files = findTestFiles(this.rootDir)
        const indentThreshold = 12

        return files
            .map((filePath) => analyzeFileNesting(filePath, this.rootDir, indentThreshold))
            .filter(Boolean)
    }

}


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
