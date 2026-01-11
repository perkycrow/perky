import fs from 'fs'
import path from 'path'
import {pathToFileURL} from 'url'
import * as acorn from 'acorn'
import Auditor from '../auditor.js'
import {gray} from '../format.js'
import {isExcludedFile} from '../utils.js'


export default class MultipleClassesAuditor extends Auditor {

    static $name = 'Multiple Classes'
    static $category = 'multiple_classes'
    static $canFix = false
    static $hint = 'Each file should contain only one class. Split into separate files.'

    async audit () {
        const config = await this.#loadConfig()
        const excludeDirs = config.multipleClasses?.excludeDirs || []
        const files = this.scanFiles()
        const issues = []

        for (const filePath of files) {
            const relativePath = path.relative(this.rootDir, filePath)

            if (isExcludedFile(relativePath)) {
                continue
            }

            if (relativePath.endsWith('.test.js') || relativePath.endsWith('.doc.js')) {
                continue
            }

            if (shouldExcludeDir(relativePath, excludeDirs)) {
                continue
            }

            const content = fs.readFileSync(filePath, 'utf-8')
            const fileIssues = this.analyze(content)

            if (fileIssues.length > 0) {
                issues.push({file: relativePath, issues: fileIssues})
            }
        }

        this.#printResults(issues)

        return {
            filesScanned: files.length,
            filesWithIssues: issues.length,
            issues
        }
    }


    analyze (content) { // eslint-disable-line local/class-methods-use-this -- clean
        const ast = parseContent(content)

        if (!ast) {
            return []
        }

        return findMultipleClasses(ast)
    }


    async #loadConfig () {
        const configPath = path.join(this.rootDir, 'cleaner.config.js')
        if (fs.existsSync(configPath)) {
            const fileUrl = pathToFileURL(configPath).href
            return import(fileUrl).then((module) => module.default || {})
        }
        return {}
    }


    #printResults (issues) {
        if (this.silent) {
            return
        }

        if (issues.length === 0) {
            this.printClean('No multiple classes issues found')
        }
    }

}


function shouldExcludeDir (relativePath, excludeDirs) {
    for (const dir of excludeDirs) {
        if (relativePath.startsWith(dir)) {
            return true
        }
    }
    return false
}


function parseContent (content) {
    try {
        return acorn.parse(content, {
            ecmaVersion: 'latest',
            sourceType: 'module',
            locations: true
        })
    } catch {
        return null
    }
}


function extractClassFromNode (node) {
    if (node.type === 'ClassDeclaration') {
        return {
            name: node.id?.name || 'Anonymous',
            line: node.loc.start.line
        }
    }

    const isExport = node.type === 'ExportDefaultDeclaration' || node.type === 'ExportNamedDeclaration'
    if (isExport && node.declaration?.type === 'ClassDeclaration') {
        return {
            name: node.declaration.id?.name || 'Anonymous',
            line: node.loc.start.line
        }
    }

    return null
}


function findMultipleClasses (ast) {
    const classes = ast.body.map(extractClassFromNode).filter(Boolean)

    if (classes.length <= 1) {
        return []
    }

    const classNames = classes.map(c => c.name).join(', ')
    const locations = classes.map(c => `L${c.line}`).join(', ')

    return [`${gray(`${locations}:`)} ${classes.length} classes found: ${classNames}`]
}
