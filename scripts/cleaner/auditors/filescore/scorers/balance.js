import fs from 'fs'
import path from 'path'
import BaseScorer from './base_scorer.js'


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
            const direction = lines < this.#median ? 'small' : lines > this.#median ? 'large' : 'median'
            breakdown.push(`Balance: +${points} (${lines} lines, ${direction})`)
        }

        return {points, breakdown}
    }


    #calculateMedian () {
        const jsFiles = this.#getJsFiles(this.rootDir)
        const sizes = jsFiles
            .map(file => {
                const content = fs.readFileSync(file, 'utf-8')
                return content.split('\n').length
            })
            .sort((a, b) => a - b)

        if (sizes.length === 0) {
            return 100
        }

        const mid = Math.floor(sizes.length / 2)
        return sizes.length % 2 === 0
            ? Math.floor((sizes[mid - 1] + sizes[mid]) / 2)
            : sizes[mid]
    }


    #getJsFiles (dir) {
        const results = []
        const entries = fs.readdirSync(dir, {withFileTypes: true})

        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name)

            if (entry.isDirectory()) {
                if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === 'scripts' || entry.name === 'dist') {
                    continue
                }
                results.push(...this.#getJsFiles(fullPath))
            } else if (entry.isFile() && entry.name.endsWith('.js')) {
                if (!entry.name.endsWith('.test.js') && !entry.name.endsWith('.doc.js')) {
                    results.push(fullPath)
                }
            }
        }

        return results
    }

}
