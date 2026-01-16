import fs from 'fs'
import path from 'path'
import * as acorn from 'acorn'
import Auditor from '../../auditor.js'
import {findJsFiles} from '../../utils.js'
import {hint, divider, dim, yellow} from '../../../format.js'


export default class ImportUsageAuditor extends Auditor {

    static $name = 'Import Usage'
    static $category = 'coverage'
    static $canFix = false
    static $hint = 'Files ranked by how many times they are imported (0 = unused)'

    audit () {
        const importCounts = this.#analyzeImports()
        const sorted = [...importCounts.entries()].sort((a, b) => b[1] - a[1])

        const unused = sorted.filter(([, count]) => count === 0)

        this.printHeader()

        if (!this.silent) {
            hint('Files by import count (excludes .test.js and .doc.js)')
            divider()

            console.log('')
            for (const [file, count] of sorted) {
                const countStr = String(count).padStart(3)
                const color = count === 0 ? yellow : dim
                console.log(`    ${color(countStr)} ${file}`)
            }

            console.log('')
        }

        return {
            totalFiles: sorted.length,
            unusedFiles: unused.length,
            files: unused.map(([file]) => file)
        }
    }


    #analyzeImports () {
        const sourceFiles = this.#getSourceFiles()
        const importCounts = new Map()

        for (const file of sourceFiles) {
            importCounts.set(file, 0)
        }

        for (const filePath of this.#getAllAnalyzableFiles()) {
            const imports = this.#extractImports(filePath)

            for (const importPath of imports) {
                const resolvedPath = this.#resolveImportPath(filePath, importPath)

                if (resolvedPath && importCounts.has(resolvedPath)) {
                    importCounts.set(resolvedPath, importCounts.get(resolvedPath) + 1)
                }
            }
        }

        return importCounts
    }


    #getSourceFiles () {
        const allFiles = findJsFiles(this.rootDir, [], this.targetPath)
        const sourceFiles = []

        for (const filePath of allFiles) {
            const relativePath = path.relative(this.rootDir, filePath)

            if (this.#shouldExcludeFile(relativePath)) {
                continue
            }

            sourceFiles.push(relativePath)
        }

        return sourceFiles
    }


    #getAllAnalyzableFiles () {
        const allFiles = findJsFiles(this.rootDir, [], this.targetPath)
        const analyzable = []

        for (const filePath of allFiles) {
            const relativePath = path.relative(this.rootDir, filePath)

            if (relativePath.endsWith('.doc.js')) {
                continue
            }

            if (relativePath.endsWith('.test.js')) {
                continue
            }

            analyzable.push(filePath)
        }

        return analyzable
    }


    #shouldExcludeFile (relativePath) { // eslint-disable-line local/class-methods-use-this -- clean
        if (relativePath.endsWith('.test.js')) {
            return true
        }

        if (relativePath.endsWith('.doc.js')) {
            return true
        }

        if (relativePath.startsWith('scripts/')) {
            return true
        }

        if (relativePath.startsWith('examples/')) {
            return true
        }

        if (relativePath.startsWith('den/')) {
            return true
        }

        if (relativePath.startsWith('ghast/')) {
            return true
        }

        if (relativePath.startsWith('doc/')) {
            return true
        }

        if (relativePath.startsWith('editor/')) {
            return true
        }

        if (!relativePath.includes('/')) {
            return true
        }

        return false
    }


    #extractImports (filePath) { // eslint-disable-line local/class-methods-use-this -- clean
        try {
            const content = fs.readFileSync(filePath, 'utf-8')
            const ast = acorn.parse(content, {
                ecmaVersion: 'latest',
                sourceType: 'module'
            })

            const imports = []

            for (const node of ast.body) {
                if (node.type === 'ImportDeclaration' && node.source?.value) {
                    imports.push(node.source.value)
                }
            }

            return imports
        } catch {
            return []
        }
    }


    #resolveImportPath (fromFile, importPath) {
        if (!importPath.startsWith('.')) {
            return null
        }

        const fromDir = path.dirname(fromFile)
        let resolved = path.resolve(fromDir, importPath)

        resolved = path.relative(this.rootDir, resolved)

        if (!resolved.endsWith('.js')) {
            if (fs.existsSync(path.join(this.rootDir, resolved + '.js'))) {
                resolved += '.js'
            } else if (fs.existsSync(path.join(this.rootDir, resolved, 'index.js'))) {
                resolved = path.join(resolved, 'index.js')
            }
        }

        return resolved
    }

}
