import fs from 'fs'
import path from 'path'
import Auditor from '../auditor.js'
import {loadCleanerConfig} from '../utils.js'
import {bold, dim, cyan, gray, green} from '../../format.js'


export default class FileLengthAuditor extends Auditor {

    static $name = 'File Length'
    static $category = 'file_length'
    static $canFix = false
    static $hint = 'Files sorted by line count'

    #excludeFiles = []


    async audit () {
        const config = await loadCleanerConfig(this.rootDir)
        this.#excludeFiles = config.fileLength?.excludeFiles || []

        const files = this.scanFiles()
        const entries = []

        for (const filePath of files) {
            const relativePath = path.relative(this.rootDir, filePath)

            if (this.#shouldSkip(relativePath)) {
                continue
            }

            const content = fs.readFileSync(filePath, 'utf-8')
            const lineCount = content.split('\n').length

            entries.push({file: relativePath, lines: lineCount})
        }

        const sorted = entries.sort((a, b) => b.lines - a.lines)

        this.#printResults(sorted)

        return {
            filesAnalyzed: sorted.length,
            totalLines: sorted.reduce((sum, e) => sum + e.lines, 0),
            files: sorted.map(e => ({file: e.file, lines: e.lines}))
        }
    }


    #shouldSkip (relativePath) {
        if (relativePath.endsWith('.test.js')) {
            return true
        }

        if (relativePath.endsWith('.doc.js') || relativePath.endsWith('.guide.js')) {
            return true
        }

        for (const pattern of this.#excludeFiles) {
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


    #printResults (sorted) {
        if (this.silent) {
            return
        }

        console.log('')
        console.log(cyan('  ╭─────────────────────────────╮'))
        console.log(cyan('  │') + bold('       FILE LENGTH           ') + cyan('│'))
        console.log(cyan('  ╰─────────────────────────────╯'))
        console.log(dim('  Files sorted by line count'))
        console.log('')

        for (const item of sorted) {
            const lines = String(item.lines).padStart(5)
            const filePadded = item.file.padEnd(50)
            console.log(`  ${filePadded} ${lines} ${gray('lines')}`)
        }

        const totalLines = sorted.reduce((sum, e) => sum + e.lines, 0)
        const avgLines = Math.round(totalLines / sorted.length)

        console.log('')
        console.log(`  ${green('Summary:')} ${sorted.length} files, ${totalLines} total lines, avg ${avgLines} lines/file`)
        console.log('')
    }

}
