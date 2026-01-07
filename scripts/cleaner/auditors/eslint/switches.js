import fs from 'fs'
import path from 'path'
import EslintAuditor from './base.js'
import {findJsFiles, groupBy} from '../../utils.js'
import {hint, listItem, divider} from '../../format.js'


export default class SwitchesAuditor extends EslintAuditor {

    static $name = 'Switch Statements'
    static $canFix = false

    audit () {
        const switches = this.#findSwitchStatements()

        if (switches.length === 0) {
            this.printClean('No switch statements found')
            return {switchesFound: 0, filesWithSwitches: 0, files: []}
        }

        const byFile = groupBy(switches, s => s.file)
        const files = Object.keys(byFile)

        this.printHeader()
        if (!this.silent) {
            hint('Consider refactoring to object lookups or polymorphism')
            divider()

            for (const file of files) {
                listItem(file)
            }
        }

        return {switchesFound: switches.length, filesWithSwitches: files.length, files}
    }


    getHint () { // eslint-disable-line local/class-methods-use-this -- clean
        return 'Consider refactoring to object lookups or polymorphism'
    }


    analyze () { // eslint-disable-line local/class-methods-use-this -- clean
        return []
    }


    #findSwitchStatements () {
        const files = findJsFiles(this.rootDir)
        const switches = []

        for (const filePath of files) {
            const relativePath = path.relative(this.rootDir, filePath)
            const content = fs.readFileSync(filePath, 'utf-8')
            const regex = /\bswitch\s*\(/g
            let match

            while ((match = regex.exec(content)) !== null) {
                if (isInsideTemplateString(content, match.index)) {
                    continue
                }

                const lineNumber = content.substring(0, match.index).split('\n').length
                const lines = content.split('\n')
                const line = lines[lineNumber - 1]

                switches.push({
                    file: relativePath,
                    line: lineNumber,
                    context: line.trim()
                })
            }
        }

        return switches
    }

}


function isInsideTemplateString (content, targetIndex) {
    let inTemplate = false

    for (let i = 0; i < targetIndex; i++) {
        if (content[i] === '`' && (i === 0 || content[i - 1] !== '\\')) {
            inTemplate = !inTemplate
        }
    }

    return inTemplate
}
