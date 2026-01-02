import fs from 'fs'
import path from 'path'
import EslintAuditor from './base.js'
import {findJsFiles, groupBy, isInsideString} from '../../utils.js'
import {header, success, hint, subHeader, listItem, divider} from '../../format.js'


const RULE_HINTS = {
    complexity: 'Split into smaller functions or methods. Acceptable in constructors or algorithmic functions',
    'local/nested-complexity': 'Reduce nesting depth by using early returns, extracting nested conditions',
    'class-methods-use-this': 'Private method (#)? Use a function below the class. Public? Check if it needs to be exposed',
    'no-unused-vars': 'Remove the unused variable'
}


export default class DisablesAuditor extends EslintAuditor {

    static $name = 'ESLint Disables'
    static $canFix = false

    audit () {
        header(this.constructor.$name)

        const disables = this.#findEslintDisables()

        if (disables.length === 0) {
            success('No eslint-disable directives found')
            return {uncleanCount: 0}
        }

        const unclean = disables.filter(d => !d.isClean)
        const clean = disables.filter(d => d.isClean)

        if (unclean.length === 0) {
            success(`All ${clean.length} directive(s) are marked clean`)
            return {uncleanCount: 0}
        }

        hint('Fix the issue OR if REALLY legit, add "-- clean" at end of eslint comment')
        divider()

        const byRule = groupBy(unclean, d => d.rule)
        const sortedRules = Object.entries(byRule).sort((a, b) => b[1].length - a[1].length)

        for (const [rule, occurrences] of sortedRules) {
            subHeader(`${rule} (${occurrences.length})`)
            if (RULE_HINTS[rule]) {
                hint(RULE_HINTS[rule])
            }
            for (const occ of occurrences) {
                listItem(`${occ.file}:${occ.line}`)
            }
        }

        if (clean.length > 0) {
            divider()
            success(`${clean.length} directive(s) marked clean`)
        }

        return {uncleanCount: unclean.length}
    }


    analyze () { // eslint-disable-line local/class-methods-use-this -- clean
        return []
    }


    #findEslintDisables () {
        const files = findJsFiles(this.rootDir)
        const disables = []

        const patterns = [
            /eslint-disable-next-line\s+([\w-]+(?:,\s*[\w-]+)*)/,
            /eslint-disable-line\s+([\w-]+(?:,\s*[\w-]+)*)/,
            /eslint-disable\s+([\w-]+(?:,\s*[\w-]+)*)/
        ]

        for (const filePath of files) {
            const relativePath = path.relative(this.rootDir, filePath)
            const content = fs.readFileSync(filePath, 'utf-8')
            const lines = content.split('\n')

            lines.forEach((line, index) => {
                for (const pattern of patterns) {
                    const match = line.match(pattern)
                    if (match && isInComment(line, match.index)) {
                        const rules = match[1].split(',').map(r => r.trim())
                        const isClean = isCleanDirective(line)
                        rules.forEach(rule => {
                            disables.push({
                                file: relativePath,
                                line: index + 1,
                                rule,
                                context: line.trim(),
                                isClean
                            })
                        })
                    }
                }
            })
        }

        return disables
    }

}


export function isCleanDirective (line) {
    return /--\s*clean\b/.test(line)
}


function isInComment (line, matchIndex) {
    const singleLineComment = line.indexOf('//')
    if (singleLineComment !== -1 && singleLineComment < matchIndex) {
        const textBefore = line.substring(0, singleLineComment)
        if (!isInsideString(textBefore)) {
            return true
        }
    }
    const blockComment = line.indexOf('/*')
    if (blockComment !== -1 && blockComment < matchIndex) {
        const textBefore = line.substring(0, blockComment)
        if (!isInsideString(textBefore)) {
            return true
        }
    }
    return false
}
