import fs from 'fs'
import path from 'path'
import Auditor from '../auditor.js'


export default class ImportsAuditor extends Auditor {

    static $name = 'Import Extensions'
    static $category = 'imports'
    static $canFix = true
    static $hint = 'Add .js extension for ESM compatibility'

    analyze (content, _relativePath, absolutePath) { // eslint-disable-line local/class-methods-use-this -- clean
        const fileDir = path.dirname(absolutePath)
        const lines = content.split('\n')
        const issues = []

        lines.forEach((line, index) => {
            const match = matchImportLine(line)

            if (!match) {
                return
            }

            const importPath = match[2]

            if (hasJsExtension(importPath)) {
                return
            }

            const {correctedPath, isDirectory} = resolveImportPath(fileDir, importPath)

            issues.push({
                line: index + 1,
                importPath,
                correctedPath,
                isDirectory,
                fullLine: line,
                prefix: match[1],
                suffix: match[3]
            })
        })

        return issues
    }


    repair (content, relativePath, absolutePath) {
        const issues = this.analyze(content, relativePath, absolutePath)

        if (issues.length === 0) {
            return {result: content, fixed: false}
        }

        const lines = content.split('\n')
        const sortedIssues = [...issues].sort((a, b) => b.line - a.line)

        for (const issue of sortedIssues) {
            const lineIndex = issue.line - 1
            const newLine = issue.prefix + issue.correctedPath + issue.suffix
            lines[lineIndex] = newLine
        }

        return {
            result: lines.join('\n'),
            fixed: true,
            fixCount: issues.length
        }
    }

}


function matchImportLine (line) {
    const importMatch = line.match(/^(\s*import\s+.+\s+from\s+['"])(\.[^'"]+)(['"].*)$/)
    const exportMatch = line.match(/^(\s*export\s+.+\s+from\s+['"])(\.[^'"]+)(['"].*)$/)
    const dynamicMatch = line.match(/^(.+import\s*\(\s*['"])(\.[^'"]+)(['"]\s*\).*)$/)

    return importMatch || exportMatch || dynamicMatch
}


export function hasJsExtension (importPath) {
    return importPath.endsWith('.js') || importPath.endsWith('.json') || importPath.endsWith('.css')
}


function resolveImportPath (fileDir, importPath) {
    const resolvedPath = path.resolve(fileDir, importPath)

    try {
        const stats = fs.statSync(resolvedPath)
        if (stats.isDirectory()) {
            const indexPath = path.join(resolvedPath, 'index.js')
            if (fs.existsSync(indexPath)) {
                return {correctedPath: importPath + '/index.js', isDirectory: true}
            }
            return {correctedPath: importPath + '.js', isDirectory: true}
        }
    } catch {

    }

    return {correctedPath: importPath + '.js', isDirectory: false}
}
