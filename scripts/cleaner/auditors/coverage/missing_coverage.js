import fs from 'fs'
import path from 'path'
import Auditor from '../../auditor.js'
import {isExcludedFile} from '../../utils.js'
import {hint, listItem, divider, dim} from '../../format.js'


export default class MissingCoverageAuditor extends Auditor {

    static $name = 'Missing Coverage'
    static $category = 'coverage'
    static $canFix = false

    audit () {
        const missing = this.#findMissingCoverage()

        if (missing.length === 0) {
            this.printClean('All exports appear to be tested')
            return {filesWithMissingCoverage: 0, files: []}
        }

        this.printHeader()
        if (!this.silent) {
            hint('These exports/methods are not referenced in test files')
            divider()

            for (const {file, missing: missingExports} of missing) {
                listItem(file)
                for (const name of missingExports) {
                    console.log(dim(`      → ${name}`))
                }
            }
        }

        const filesList = missing.map(m =>
            `${m.file}\n      → ${m.missing.join('\n      → ')}`)

        return {
            filesWithMissingCoverage: missing.length,
            files: filesList
        }
    }


    getHint () { // eslint-disable-line local/class-methods-use-this -- clean
        return 'Exports/methods not referenced in corresponding test file'
    }


    analyze () { // eslint-disable-line local/class-methods-use-this -- clean
        return []
    }


    #findMissingCoverage () {
        const files = this.scanFiles()
        const results = []

        for (const filePath of files) {
            const relativePath = path.relative(this.rootDir, filePath)

            if (isExcludedFile(relativePath)) {
                continue
            }

            if (relativePath.endsWith('.test.js') || relativePath.endsWith('.doc.js') || relativePath.endsWith('.guide.js')) {
                continue
            }

            if (relativePath.startsWith('scripts/')) {
                continue
            }

            const testPath = filePath.replace(/\.js$/, '.test.js')

            if (!fs.existsSync(testPath)) {
                continue
            }

            const sourceContent = fs.readFileSync(filePath, 'utf-8')
            const testContent = fs.readFileSync(testPath, 'utf-8')

            const exports = extractExports(sourceContent)
            const missing = findUntested(exports, testContent)

            if (missing.length > 0) {
                results.push({
                    file: relativePath,
                    missing
                })
            }
        }

        return results
    }

}


function extractExports (content) {
    const exports = []

    const namedExportRegex = /export\s+(?:async\s+)?function\s+(\w+)/g
    let match
    while ((match = namedExportRegex.exec(content)) !== null) {
        exports.push(match[1])
    }

    const namedConstRegex = /export\s+(?:const|let|var)\s+(\w+)/g
    while ((match = namedConstRegex.exec(content)) !== null) {
        const name = match[1]
        if (name !== 'default') {
            exports.push(name)
        }
    }

    const defaultClassRegex = /export\s+default\s+class\s+(\w+)/
    const classMatch = content.match(defaultClassRegex)
    if (classMatch) {
        const className = classMatch[1]
        exports.push(className)

        const methods = extractClassMethods(content, className)
        exports.push(...methods)
    }

    return exports
}


function extractClassMethods (content, className) {
    const methods = []

    const classStart = content.indexOf(`class ${className}`)
    if (classStart === -1) {
        return methods
    }

    const classBody = extractClassBody(content, classStart)
    const methodRegex = /^\s{4}(?!static\s)(?!#)(\w+)\s*\([^)]*\)\s*\{/gm
    let match

    while ((match = methodRegex.exec(classBody)) !== null) {
        const name = match[1]
        if (name !== 'constructor' && name !== 'get' && name !== 'set') {
            methods.push(name)
        }
    }

    return methods
}


function extractClassBody (content, classStart) {
    let braceCount = 0
    let classBody = ''
    let started = false

    for (let i = classStart; i < content.length; i++) {
        if (content[i] === '{') {
            braceCount++
            started = true
        }
        if (content[i] === '}') {
            braceCount--
        }
        if (started) {
            classBody += content[i]
        }
        if (started && braceCount === 0) {
            break
        }
    }

    return classBody
}


const LIFECYCLE_METHODS = new Set([
    'onInstall', 'onUninstall', 'onStart', 'onStop', 'onDispose',
    'connectedCallback', 'disconnectedCallback', 'attributeChangedCallback',
    'adoptedCallback', 'update', 'render', 'onUpdate', 'onRender',
    'buildDOM', 'onModuleSet', 'renderNodeContent', 'updateChildren'
])


function findUntested (exports, testContent) {
    return exports.filter(name => {
        if (LIFECYCLE_METHODS.has(name)) {
            return false
        }

        const patterns = [
            new RegExp(`\\b${name}\\b`),
            new RegExp(`['"]${name}['"]`),
            new RegExp(`\\.${name}\\b`)
        ]
        return !patterns.some(p => p.test(testContent))
    })
}
