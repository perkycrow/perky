import fs from 'fs'
import path from 'path'
import * as acorn from 'acorn'
import BaseScorer from './base_scorer.js'
import {findJsFiles} from '../../../utils.js'


export default class UsageScorer extends BaseScorer {

    static $name = 'Usage'
    static $weight = 1
    static $description = 'How many times the file is imported elsewhere'

    #importCounts = null
    #usedBonus = 15

    score (filePath) {
        const relativePath = path.relative(this.rootDir, filePath)
        const counts = this.#getImportCounts()
        const count = counts.get(relativePath) ?? 0

        if (count === 0) {
            return {points: 0, breakdown: []}
        }

        return {
            points: this.#usedBonus,
            breakdown: [`Used (${count} imports): +${this.#usedBonus}`]
        }
    }


    #getImportCounts () {
        if (this.#importCounts) {
            return this.#importCounts
        }

        this.#importCounts = new Map()
        const sourceFiles = this.#getSourceFiles()

        for (const file of sourceFiles) {
            this.#importCounts.set(file, 0)
        }

        for (const filePath of this.#getAllAnalyzableFiles()) {
            const imports = this.#extractImports(filePath)

            for (const importPath of imports) {
                const resolvedPath = this.#resolveImportPath(filePath, importPath)

                if (resolvedPath && this.#importCounts.has(resolvedPath)) {
                    this.#importCounts.set(resolvedPath, this.#importCounts.get(resolvedPath) + 1)
                }
            }
        }

        return this.#importCounts
    }


    #getSourceFiles () {
        const allFiles = findJsFiles(this.rootDir)
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
        const allFiles = findJsFiles(this.rootDir)
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


    #shouldExcludeFile (relativePath) {
        if (relativePath.endsWith('.test.js')) {
            return true
        }

        if (relativePath.endsWith('.doc.js')) {
            return true
        }

        if (relativePath.startsWith('scripts/')) {
            return true
        }

        if (!relativePath.includes('/')) {
            return true
        }

        for (const dir of this.excludeDirs) {
            if (relativePath.startsWith(dir)) {
                return true
            }
        }

        return false
    }


    #extractImports (filePath) {
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
