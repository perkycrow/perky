import {execSync} from 'child_process'
import Auditor from '../../auditor.js'


export default class EslintAuditor extends Auditor {

    static $category = 'eslint'

    runEslintCommand (args) {
        try {
            const output = execSync(`yarn eslint ${args}`, {
                cwd: this.rootDir,
                encoding: 'utf-8',
                stdio: ['pipe', 'pipe', 'pipe'],
                maxBuffer: 10 * 1024 * 1024
            })
            return {output, error: null}
        } catch (error) {
            return {output: error.stdout || null, error}
        }
    }


    parseEslintJson (output) { // eslint-disable-line local/class-methods-use-this -- clean
        if (!output) {
            return null
        }
        try {
            return JSON.parse(output)
        } catch {
            return null
        }
    }

}
