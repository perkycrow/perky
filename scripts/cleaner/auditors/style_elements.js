import Auditor from '../auditor.js'
import {isInsideString} from '../utils.js'
import {gray} from '../../format.js'


const STYLE_ELEMENT_PATTERN = /document\.createElement\s*\(\s*['"`]style['"`]\s*\)/g


export default class StyleElementAuditor extends Auditor {

    static $name = 'Style Elements'
    static $category = 'styles'
    static $canFix = false
    static $hint = `Use createStyleSheet + adoptStyleSheets instead:

    1. Create a .styles.js file that exports a CSSStyleSheet:
       import {createStyleSheet} from 'application/dom_utils.js'
       export const myComponentStyles = createStyleSheet(\`...\`)

    2. In your component, adopt the stylesheet:
       import {adoptStyleSheets} from 'application/dom_utils.js'
       import {myComponentStyles} from './my_component.styles.js'
       adoptStyleSheets(this.shadowRoot, myComponentStyles)`

    analyze (content) { // eslint-disable-line local/class-methods-use-this -- clean
        const issues = []
        const lines = content.split('\n')

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i]
            let match

            STYLE_ELEMENT_PATTERN.lastIndex = 0

            while ((match = STYLE_ELEMENT_PATTERN.exec(line)) !== null) {
                const textBefore = line.substring(0, match.index)

                if (isInsideString(textBefore)) {
                    continue
                }

                issues.push(`${gray(`L${i + 1}:`)} document.createElement('style')`)
            }
        }

        return issues
    }

}
