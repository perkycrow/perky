import {execSync} from 'child_process'
import fs from 'fs'
import path from 'path'
import Auditor from '../../auditor.js'
import {isExcludedFile} from '../../utils.js'
import {hint, listItem, divider} from '../../format.js'


export default class StaleFilesAuditor extends Auditor {

    static $name = 'Stale Files'
    static $category = 'coverage'
    static $canFix = false

    static $hint (auditor) {
        return `Source modified ${auditor.thresholdDays}+ days after test/doc - may need review`
    }

    thresholdDays = 30

    audit () {
        const staleTests = this.#findStaleFiles('.test.js')
        const staleDocs = this.#findStaleFiles('.doc.js')
        const allStale = [...staleTests, ...staleDocs]

        if (allStale.length === 0) {
            this.printClean('All test and doc files are up to date')
            return {staleFiles: 0, files: []}
        }

        this.printHeader()
        if (!this.silent) {
            hint(`File not updated within ${this.thresholdDays} days of source change`)
            divider()

            for (const {file, daysBehind} of allStale) {
                listItem(`${file} (${daysBehind} days behind)`)
            }
        }

        return {staleFiles: allStale.length, files: allStale.map(s => s.file)}
    }


    analyze () { // eslint-disable-line local/class-methods-use-this -- clean
        return []
    }


    #findStaleFiles (suffix) {
        const files = this.scanFiles()
        const stale = []

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

            const relatedPath = filePath.replace(/\.js$/, suffix)

            if (!fs.existsSync(relatedPath)) {
                continue
            }

            const sourceDate = this.#getLastCommitDate(filePath)
            const relatedDate = this.#getLastCommitDate(relatedPath)

            if (!sourceDate || !relatedDate) {
                continue
            }

            const diffDays = Math.floor((sourceDate - relatedDate) / (1000 * 60 * 60 * 24))

            if (diffDays > this.thresholdDays) {
                stale.push({
                    file: path.relative(this.rootDir, relatedPath),
                    daysBehind: diffDays
                })
            }
        }

        return stale.sort((a, b) => b.daysBehind - a.daysBehind)
    }


    #getLastCommitDate (filePath) {
        try {
            const timestamp = execSync(
                `git log -1 --format=%ct -- "${filePath}"`,
                {cwd: this.rootDir, encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe']}
            ).trim()

            if (!timestamp) {
                return null
            }

            return new Date(parseInt(timestamp, 10) * 1000)
        } catch {
            return null
        }
    }

}
