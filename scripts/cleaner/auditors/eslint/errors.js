import path from 'path'
import EslintAuditor from './base.js'
import {groupBy} from '../../utils.js'
import {hint, subHeader, listItem, divider} from '../../format.js'


const RULE_HINTS = {
    complexity: 'Split into smaller functions or methods',
    'local/nested-complexity': 'Reduce nesting depth by using early returns',
    'local/class-methods-use-this': '#private without this? Extract to function below class. Public method? Check if it needs to be exposed, otherwise extract too',
    'class-methods-use-this': '#private without this? Extract to function below class. Public method? Check if it needs to be exposed, otherwise extract too',
    'no-unused-vars': 'Remove the unused variable',
    'no-empty': 'Remove empty block or add a comment explaining why',
    'no-nested-ternary': 'Refactor to clean if/else statements',
    'max-params': 'If all params are necessary, transform them into a params object',
    unknown: 'Check file for syntax errors'
}


export default class EslintErrorsAuditor extends EslintAuditor {

    static $name = 'ESLint Errors'
    static $canFix = true
    static $hint = 'Run: npx eslint . --fix'

    audit () {
        const target = this.getEslintTarget()
        const {output} = this.runEslintCommand(`--format json ${target}`)
        const data = this.parseEslintJson(output)

        if (!data) {
            this.printHeader()
            if (!this.silent) {
                hint('Failed to parse ESLint output')
            }
            return {errorCount: 0, warningCount: 0, filesWithIssues: 0, details: []}
        }

        const allMessages = extractAllMessages(data, this.rootDir)

        if (allMessages.length === 0) {
            this.printClean('No ESLint errors or warnings')
            return {errorCount: 0, warningCount: 0, filesWithIssues: 0, details: []}
        }

        const byRule = groupBy(allMessages, m => m.rule)
        const sortedRules = Object.entries(byRule).sort((a, b) => b[1].length - a[1].length)

        this.printHeader()
        if (!this.silent) {
            hint('Run npx eslint . for detailed error messages')
            divider()

            for (const [rule, occurrences] of sortedRules) {
                subHeader(`${rule} (${occurrences.length})`)
                if (RULE_HINTS[rule]) {
                    hint(RULE_HINTS[rule])
                }
                for (const occ of occurrences) {
                    listItem(`${occ.file}:${occ.line}`)
                }
            }
        }

        const totalErrors = allMessages.filter(m => m.severity === 2).length
        const totalWarnings = allMessages.filter(m => m.severity === 1).length
        const filesWithIssues = new Set(allMessages.map(m => m.file)).size

        return {
            errorCount: totalErrors,
            warningCount: totalWarnings,
            filesWithIssues,
            details: sortedRules.map(([rule, occurrences]) => ({
                rule,
                hint: RULE_HINTS[rule] || null,
                locations: occurrences.map(o => `${o.file}:${o.line}`)
            }))
        }
    }


    fix () {
        const target = this.getEslintTarget()
        this.runEslintCommand(`--fix ${target}`)
        this.printClean('ESLint auto-fix completed')

        return {filesFixed: 0, issuesFixed: 0}
    }

}


export function isUnusedDirectiveMessage (message) {
    return message && message.includes('Unused eslint-disable directive')
}


function extractAllMessages (data, rootDir) {
    const messages = []

    for (const file of data) {
        const relativePath = path.relative(rootDir, file.filePath)

        for (const msg of file.messages) {
            if (!isUnusedDirectiveMessage(msg.message)) {
                messages.push({
                    file: relativePath,
                    line: msg.line,
                    rule: msg.ruleId || 'unknown',
                    severity: msg.severity
                })
            }
        }
    }

    return messages
}
