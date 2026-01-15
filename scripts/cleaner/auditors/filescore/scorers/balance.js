import fs from 'fs'
import path from 'path'
import BaseScorer from './base_scorer.js'


function isValidJsFile (name) {
    if (!name.endsWith('.js')) {
        return false
    }
    if (name.endsWith('.test.js') || name.endsWith('.doc.js')) {
        return false
    }
    return true
}


export default class BalanceScorer extends BaseScorer {

    static $name = 'Balance'
    static $weight = 1
    static $description = 'Files close to median size are well-scoped'

    #maxBonus = 15
    #median = null

    score (filePath, content) {
        if (this.#median === null) {
            this.#median = this.#calculateMedian()
        }

        const lines = content.split('\n').length
        const deviation = Math.abs(lines - this.#median)

        const penalty = Math.floor(Math.log2(1 + deviation / 20))
        const points = Math.max(0, this.#maxBonus - penalty)

        const breakdown = []
        if (points > 0) {
            const direction = this.#getDirection(lines)
            breakdown.push(`Balance: +${points} (${lines} lines, ${direction})`)
        }

        return {points, breakdown}
    }


    #getDirection (lines) {
        if (lines < this.#median) {
            return 'small'
        }
        if (lines > this.#median) {
            return 'large'
        }
        return 'median'
    }


    #calculateMedian () {
        const jsFiles = this.#getJsFiles(this.rootDir)
        const sizes = jsFiles
            .map(file => fs.readFileSync(file, 'utf-8').split('\n').length)
            .sort((a, b) => a - b)

        if (sizes.length === 0) {
            return 100
        }

        const mid = Math.floor(sizes.length / 2)
        if (sizes.length % 2 === 0) {
            return Math.floor((sizes[mid - 1] + sizes[mid]) / 2)
        }
        return sizes[mid]
    }


    #getJsFiles (dir, relativeTo = this.rootDir) {
        const entries = fs.readdirSync(dir, {withFileTypes: true})
        const results = []

        for (const entry of entries) {
            this.#processEntry(entry, dir, relativeTo, results)
        }

        return results
    }


    #processEntry (entry, dir, relativeTo, results) {
        const fullPath = path.join(dir, entry.name)

        if (entry.isDirectory()) {
            this.#processDirectory(entry, fullPath, relativeTo, results)
            return
        }

        if (isValidJsFile(entry.name)) {
            results.push(fullPath)
        }
    }


    #processDirectory (entry, fullPath, relativeTo, results) {
        const skipDirs = ['node_modules', '.git', 'scripts', 'dist']
        if (skipDirs.includes(entry.name)) {
            return
        }

        const relativePath = path.relative(relativeTo, fullPath)
        if (this.excludeDirs.some(excluded => relativePath.startsWith(excluded))) {
            return
        }

        results.push(...this.#getJsFiles(fullPath, relativeTo))
    }

}
