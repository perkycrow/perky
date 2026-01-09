import fs from 'fs'
import path from 'path'
import {pathToFileURL} from 'url'
import Auditor from '../../auditor.js'
import {isExcludedFile} from '../../utils.js'
import {hint, listItem, divider} from '../../format.js'


export default class MissingDocsAuditor extends Auditor {

    static $name = 'Missing Docs'
    static $category = 'coverage'
    static $canFix = false

    async audit () {
        const missing = await this.#findFilesWithoutDocs()

        if (missing.length === 0) {
            this.printClean('All files have corresponding doc files')
            return {filesWithoutDocs: 0, files: []}
        }

        this.printHeader()
        if (!this.silent) {
            hint('These files have no .doc.js documentation')
            divider()

            for (const {expectedDoc} of missing) {
                listItem(expectedDoc)
            }
        }

        return {filesWithoutDocs: missing.length, files: missing.map(m => m.expectedDoc)}
    }


    getHint () { // eslint-disable-line local/class-methods-use-this -- clean
        return 'Create .doc.js files for these source files'
    }


    analyze () { // eslint-disable-line local/class-methods-use-this -- clean
        return []
    }


    async #findFilesWithoutDocs () {
        const config = await this.#loadConfig()
        const excludeDirs = config.missingDocs?.excludeDirs || []
        const excludeFiles = config.missingDocs?.excludeFiles || []

        return this.scanFiles()
            .map(filePath => ({filePath, relativePath: path.relative(this.rootDir, filePath)}))
            .filter(({relativePath}) => !shouldSkipFile(relativePath))
            .filter(({relativePath}) => !isExcludedFile(relativePath))
            .filter(({relativePath}) => !shouldExcludeFromDocAudit(relativePath, excludeDirs))
            .filter(({relativePath}) => !shouldExcludeFilePattern(relativePath, excludeFiles))
            .filter(({filePath}) => !fs.existsSync(filePath.replace(/\.js$/, '.doc.js')))
            .map(({filePath, relativePath}) => ({
                file: relativePath,
                expectedDoc: path.relative(this.rootDir, filePath.replace(/\.js$/, '.doc.js'))
            }))
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


function shouldSkipFile (relativePath) {
    if (relativePath.endsWith('.test.js')) {
        return true
    }

    if (relativePath.endsWith('.doc.js') || relativePath.endsWith('.guide.js')) {
        return true
    }

    return false
}


const EXCLUDED_DIRS = ['scripts/', 'doc/', 'editor/', 'examples/', 'eslint/', 'den/']


export function shouldExcludeFromDocAudit (relativePath, excludeDirs = []) {
    if (!relativePath.includes('/')) {
        return true
    }

    if (relativePath.endsWith('/index.js') || relativePath === 'index.js') {
        return true
    }

    if (relativePath.endsWith('test_helpers.js')) {
        return true
    }

    const allExcludedDirs = [...EXCLUDED_DIRS, ...excludeDirs]

    return allExcludedDirs.some(dir => relativePath.startsWith(dir))
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
