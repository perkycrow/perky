import fs from 'fs'
import path from 'path'
import {pathToFileURL} from 'url'
import Auditor from '../../auditor.js'
import {isExcludedFile} from '../../utils.js'
import {hint, listItem, divider} from '../../../format.js'


export default class MissingTestsAuditor extends Auditor {

    static $name = 'Missing Tests'
    static $category = 'tests'
    static $canFix = false
    static $hint = 'Create test files for these files'

    async audit () {
        const missing = await this.#findFilesWithoutTests()

        if (missing.length === 0) {
            this.printClean('All files have corresponding test files')
            return {filesWithoutTests: 0, files: []}
        }

        this.printHeader()
        if (!this.silent) {
            hint('Create test files that import and test exported functions')
            hint('Use test() not it() - these are unit tests, not BDD specs')
            hint('Keep it flat: use describe() only when grouping related tests')
            hint('Sentences are for edge cases, simple methods can use test("methodName")')
            divider()

            for (const {expectedTest} of missing) {
                listItem(expectedTest)
            }
        }

        return {filesWithoutTests: missing.length, files: missing.map(m => m.expectedTest)}
    }


    async #findFilesWithoutTests () { // eslint-disable-line complexity -- clean
        const config = await this.#loadConfig()
        const excludeDirs = config.missingTests?.excludeDirs || []
        const excludeFiles = config.missingTests?.excludeFiles || []
        const files = this.scanFiles()
        const missing = []

        for (const filePath of files) {
            const relativePath = path.relative(this.rootDir, filePath)

            if (isExcludedFile(relativePath)) {
                continue
            }

            if (relativePath.endsWith('.test.js')) {
                continue
            }

            if (relativePath.endsWith('.doc.js') || relativePath.endsWith('.guide.js')) {
                continue
            }

            if (shouldExcludeFromTestAudit(relativePath, excludeDirs)) {
                continue
            }

            if (shouldExcludeFilePattern(relativePath, excludeFiles)) {
                continue
            }

            const testPath = filePath.replace(/\.js$/, '.test.js')

            if (!fs.existsSync(testPath)) {
                missing.push({
                    file: relativePath,
                    expectedTest: path.relative(this.rootDir, testPath)
                })
            }
        }

        return missing
    }


    async #loadConfig () {
        const configPath = path.join(this.rootDir, 'cleaner.config.js')
        if (fs.existsSync(configPath)) {
            const fileUrl = pathToFileURL(configPath).href
            return import(fileUrl).then((module) => module.default || {})
        }
        return {}
    }

}


function shouldExcludeFromTestAudit (relativePath, excludeDirs = []) { // eslint-disable-line complexity -- clean
    if (!relativePath.includes('/')) {
        return true
    }

    if (relativePath.endsWith('/index.js') || relativePath === 'index.js') {
        return true
    }

    if (relativePath.startsWith('scripts/') && relativePath.split('/').length === 2) {
        return true
    }

    if (relativePath.startsWith('examples/')) {
        return true
    }

    for (const dir of excludeDirs) {
        if (relativePath.startsWith(dir)) {
            return true
        }
    }

    if (relativePath.endsWith('_controller.js') &&
        !relativePath.startsWith('game/') &&
        !relativePath.startsWith('application/')) {
        return true
    }

    if (relativePath.endsWith('_renderer.js') && !relativePath.startsWith('render/')) {
        return true
    }

    return false
}


function shouldExcludeFilePattern (relativePath, excludeFiles = []) {
    for (const pattern of excludeFiles) {
        if (pattern.startsWith('**/')) {
            const filename = pattern.slice(3)
            if (relativePath.endsWith(filename)) {
                return true
            }
        } else if (pattern.includes('*')) {
            const regex = new RegExp('^' + pattern.replaceAll('*', '.*') + '$')
            if (regex.test(relativePath)) {
                return true
            }
        } else if (relativePath === pattern || relativePath.endsWith('/' + pattern)) {
            return true
        }
    }
    return false
}
