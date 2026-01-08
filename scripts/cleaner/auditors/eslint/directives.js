import fs from 'fs'
import path from 'path'
import EslintAuditor from './base.js'
import {header, success, hint, listItem, divider} from '../../format.js'


export default class DirectivesAuditor extends EslintAuditor {

    static $name = 'Unused ESLint Directives'
    static $canFix = true

    audit () {
        const unused = this.#findUnusedDirectives()

        if (unused.length === 0) {
            this.printClean('No unused eslint-disable directives')
            return {filesWithIssues: 0, directivesFound: 0, files: []}
        }

        const filesWithIssues = unused.map(f => f.relativePath)
        const totalDirectives = unused.reduce((sum, f) => sum + f.directives.length, 0)

        this.printHeader()
        if (!this.silent) {
            hint('Remove directives that no longer suppress any rules')
            divider()

            for (const file of filesWithIssues) {
                listItem(file)
            }
        }

        return {filesWithIssues: unused.length, directivesFound: totalDirectives, files: filesWithIssues}
    }


    getHint () { // eslint-disable-line local/class-methods-use-this -- clean
        return 'Remove directives that no longer suppress any rules'
    }


    fix () {
        const unused = this.#findUnusedDirectives()

        if (unused.length === 0) {
            this.printClean('No unused eslint-disable directives')
            return {filesFixed: 0, directivesRemoved: 0}
        }

        const title = this.dryRun ? 'Unused Directives (dry run)' : 'Fixing Unused Directives'
        header(title)

        let totalDirectives = 0

        for (const file of unused) {
            totalDirectives += file.directives.length
            if (!this.dryRun) {
                fixFileDirectives(file)
            }
        }

        success(`Removed ${totalDirectives} directive(s) in ${unused.length} file(s)`)

        return {filesFixed: unused.length, directivesRemoved: totalDirectives}
    }


    analyze () { // eslint-disable-line local/class-methods-use-this -- clean
        return []
    }


    #findUnusedDirectives () {
        const target = this.getEslintTarget()
        const {output} = this.runEslintCommand(`--report-unused-disable-directives --format json ${target}`)
        const data = this.parseEslintJson(output)

        if (!data) {
            return []
        }

        return data
            .map(file => this.#extractUnusedFromFile(file))
            .filter(Boolean)
    }


    #extractUnusedFromFile (file) {
        const unusedMessages = file.messages.filter(m =>
            m.message && m.message.includes('Unused eslint-disable directive'))

        if (unusedMessages.length === 0) {
            return null
        }

        return {
            filePath: file.filePath,
            relativePath: path.relative(this.rootDir, file.filePath),
            directives: unusedMessages.map(m => ({line: m.line, message: m.message}))
        }
    }

}


function fixFileDirectives (file) {
    let content = fs.readFileSync(file.filePath, 'utf-8')
    const sortedDirectives = [...file.directives].sort((a, b) => b.line - a.line)

    for (const directive of sortedDirectives) {
        content = removeUnusedDirective(content, directive.line)
    }

    fs.writeFileSync(file.filePath, content, 'utf-8')
}


export function removeUnusedDirective (content, line) {
    const lines = content.split('\n')
    const lineIndex = line - 1

    if (lineIndex < 0 || lineIndex >= lines.length) {
        return content
    }

    const currentLine = lines[lineIndex]

    const inlineMatch = currentLine.match(/^(.+?)\s*\/\/\s*eslint-disable-line\s+[\w-]+\s*$/)
    if (inlineMatch) {
        lines[lineIndex] = inlineMatch[1].trimEnd()
        return lines.join('\n')
    }

    const standaloneMatch = currentLine.match(/^\s*\/\/\s*eslint-disable-next-line\s+[\w-]+\s*$/)
    if (standaloneMatch) {
        lines.splice(lineIndex, 1)
        return lines.join('\n')
    }

    const blockMatch = currentLine.match(/^\s*\/\*\s*eslint-disable\s+[\w-]+\s*\*\/\s*$/)
    if (blockMatch) {
        lines.splice(lineIndex, 1)
        return lines.join('\n')
    }

    return content
}
