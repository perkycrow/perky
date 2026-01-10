import Auditor from '../auditor.js'
import {isInsideString} from '../utils.js'
import {gray} from '../format.js'


const CONSOLE_PATTERN = /\bconsole\.(log|warn|error|info|debug)\s*\(/g


export default class ConsoleAuditor extends Auditor {

    static $name = 'Console Statements'
    static $category = 'console'
    static $canFix = false
    static $hint = "Use Logger instead: import logger from 'core/logger.js'"

    analyze (content) { // eslint-disable-line local/class-methods-use-this -- clean
        const issues = []
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

                issues.push(`${gray(`L${i + 1}:`)} console.${match[1]}(...)`)
            }
        }

        return issues
    }

}
