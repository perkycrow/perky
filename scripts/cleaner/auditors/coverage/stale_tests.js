import {execSync} from 'child_process'
import fs from 'fs'
import path from 'path'
import Auditor from '../../auditor.js'
import {findJsFiles, isExcludedFile} from '../../utils.js'
import {hint, listItem, divider} from '../../format.js'


export default class StaleTestsAuditor extends Auditor {

    static $name = 'Stale Tests'
    static $category = 'coverage'
    static $canFix = false

    #thresholdDays = 30

    audit () {
        const stale = this.#findStaleTests()

        if (stale.length === 0) {
            this.printClean('All test files are up to date')
            return {staleTests: 0, files: []}
        }

        this.printHeader()
        if (!this.silent) {
            hint(`Test file not updated within ${this.#thresholdDays} days of source change`)
            divider()

            for (const {file, daysBehind} of stale) {
                listItem(`${file} (${daysBehind} days behind)`)
            }
        }

        return {staleTests: stale.length, files: stale.map(s => s.file)}
    }


    getHint () {
        return `Source file modified ${this.#thresholdDays}+ days after its test - may need review`
    }


    analyze () { // eslint-disable-line local/class-methods-use-this -- clean
        return []
    }


    #findStaleTests () {
        const files = findJsFiles(this.rootDir)
        const stale = []

        for (const filePath of files) {
            const relativePath = path.relative(this.rootDir, filePath)

            if (isExcludedFile(relativePath)) {
                continue
            }

            if (relativePath.endsWith('.test.js')) {
                continue
            }

            if (relativePath.endsWith('.doc.js')) {
                continue
            }

            const testPath = filePath.replace(/\.js$/, '.test.js')

            if (!fs.existsSync(testPath)) {
                continue
            }

            const sourceDate = this.#getLastCommitDate(filePath)
            const testDate = this.#getLastCommitDate(testPath)

            if (!sourceDate || !testDate) {
                continue
            }

            const diffDays = Math.floor((sourceDate - testDate) / (1000 * 60 * 60 * 24))

            if (diffDays > this.#thresholdDays) {
                stale.push({
                    file: path.relative(this.rootDir, testPath),
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
