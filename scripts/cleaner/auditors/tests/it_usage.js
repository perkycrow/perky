import fs from 'fs'
import path from 'path'
import Auditor from '../../auditor.js'
import {findJsFiles} from '../../utils.js'
import {header, hint, listItem, divider} from '../../format.js'


export default class ItUsageAuditor extends Auditor {

    static $name = 'it() Usage'
    static $category = 'tests'
    static $canFix = false

    audit () {
        const issues = this.#findItUsage()

        if (issues.length === 0) {
            this.printClean('All test files use test() syntax')
            return {filesWithItUsage: 0}
        }

        header(this.constructor.$name)
        hint('Use test() instead of it() for unit tests')
        hint('it() = BDD specs ("it should do X") - describes behavior from user perspective')
        hint('test() = unit tests ("test X does Y") - verifies implementation directly')
        hint('Sentences are for edge cases, simple methods can use test("methodName")')
        hint('Refactor these files from BDD style to unit test philosophy')
        hint('Run "yarn test" after changes to ensure nothing breaks')
        divider()

        for (const {file} of issues) {
            listItem(file)
        }

        return {filesWithItUsage: issues.length}
    }


    analyze () { // eslint-disable-line local/class-methods-use-this -- clean
        return []
    }


    #findItUsage () {
        const files = findTestFiles(this.rootDir)

        return files
            .map((filePath) => analyzeFileItUsage(filePath, this.rootDir))
            .filter(Boolean)
    }

}


function findTestFiles (rootDir) {
    return findJsFiles(rootDir).filter((filePath) => {
        const relativePath = path.relative(rootDir, filePath)
        return relativePath.endsWith('.test.js') && !relativePath.startsWith('scripts/cleaner/')
    })
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
