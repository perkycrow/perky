import fs from 'fs'
import path from 'path'
import * as acorn from 'acorn'
import Auditor from '../auditor.js'
import {gray} from '../format.js'
import {isExcludedFile} from '../utils.js'


export default class FunctionOrderAuditor extends Auditor {

    static $name = 'Function Order'
    static $category = 'function_order'
    static $canFix = false
    static $hint = 'Functions should be declared after the export default class.'

    audit () {
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

        return findFunctionsBeforeClass(ast)
    }


    #printResults (issues) {
        if (this.silent) {
            return
        }

        if (issues.length === 0) {
            this.printClean('No function order issues found')
        }
    }

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


function findExportDefaultClass (ast) {
    for (const node of ast.body) {
        if (node.type === 'ExportDefaultDeclaration' && node.declaration?.type === 'ClassDeclaration') {
            return {
                name: node.declaration.id?.name || 'Anonymous',
                startLine: node.loc.start.line,
                endLine: node.loc.end.line
            }
        }
    }
    return null
}


function findFunctionsBeforeClass (ast) {
    const exportDefaultClass = findExportDefaultClass(ast)

    if (!exportDefaultClass) {
        return []
    }

    const issues = []

    for (const node of ast.body) {
        if (node.type === 'FunctionDeclaration') {
            if (node.loc.start.line < exportDefaultClass.startLine) {
                const name = node.id?.name || 'anonymous'
                issues.push(`${gray(`L${node.loc.start.line}:`)} function ${name}() declared before class`)
            }
        }
    }

    return issues
}
