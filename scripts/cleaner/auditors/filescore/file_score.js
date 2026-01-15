import fs from 'fs'
import path from 'path'
import Auditor from '../../auditor.js'
import {isExcludedFile} from '../../utils.js'
import {bold, dim, cyan, gray, green, yellow} from '../../format.js'

import CoverageScorer from './scorers/coverage.js'
import SizeScorer from './scorers/size.js'
import MaturityScorer from './scorers/maturity.js'
import AgeScorer from './scorers/age.js'
import StabilityScorer from './scorers/stability.js'
import BalanceScorer from './scorers/balance.js'


const SCORERS = [
    CoverageScorer,
    SizeScorer,
    MaturityScorer,
    AgeScorer,
    StabilityScorer,
    BalanceScorer
]


export default class FileScoreAuditor extends Auditor {

    static $name = 'File Scores'
    static $category = 'filescore'
    static $canFix = false
    static $hint = 'Higher score = healthier file'

    #scorers = []


    constructor (rootDir, options = {}) {
        super(rootDir, options)
        this.#scorers = SCORERS.map(ScorerClass => new ScorerClass(rootDir))
    }


    audit () {
        const scores = this.#calculateScores()

        if (scores.length === 0) {
            this.printClean('No files to score')
            return {filesAnalyzed: 0, files: []}
        }

        const sorted = scores.sort((a, b) => b.total - a.total)
        const maxScore = sorted[0].total

        for (const item of sorted) {
            item.percent = maxScore > 0 ? Math.round((item.total / maxScore) * 100) : 0
        }

        const flop = this.options.flop
        const displayList = flop ? [...sorted].reverse().slice(0, 10) : sorted

        this.#printResults(displayList, flop)

        return {
            filesAnalyzed: sorted.length,
            maxScore,
            files: sorted.map(s => ({
                file: s.file,
                score: s.total,
                percent: s.percent
            }))
        }
    }


    #calculateScores () {
        const files = this.scanFiles()
        const results = []

        for (const filePath of files) {
            const relativePath = path.relative(this.rootDir, filePath)

            if (this.#shouldSkip(relativePath)) {
                continue
            }

            const content = fs.readFileSync(filePath, 'utf-8')
            const scoreResult = this.#scoreFile(filePath, content)

            results.push({
                file: relativePath,
                ...scoreResult
            })
        }

        return results
    }


    #shouldSkip (relativePath) {
        if (isExcludedFile(relativePath)) {
            return true
        }

        if (relativePath.endsWith('.test.js')) {
            return true
        }

        if (relativePath.endsWith('.doc.js') || relativePath.endsWith('.guide.js')) {
            return true
        }

        if (relativePath.startsWith('scripts/')) {
            return true
        }

        return false
    }


    #scoreFile (filePath, content) {
        let total = 0
        const breakdown = []

        for (const scorer of this.#scorers) {
            const result = scorer.score(filePath, content)
            const weighted = result.points * scorer.weight
            total += weighted
            breakdown.push(...result.breakdown)
        }

        return {total, breakdown}
    }


    #printResults (displayList, flop) {
        if (this.silent) {
            return
        }

        const title = flop ? '     FLOP 10 FILES       ' : '        FILE SCORES          '
        const subtitle = flop
            ? 'Files needing the most attention'
            : 'Higher score = healthier file'

        console.log('')
        console.log(cyan('  ╭─────────────────────────────╮'))
        console.log(cyan('  │') + bold(title) + cyan('│'))
        console.log(cyan('  ╰─────────────────────────────╯'))
        console.log(dim(`  ${subtitle}`))
        console.log('')

        const verbose = this.options.verbose

        for (const item of displayList) {
            const percent = `${item.percent}%`.padStart(4)
            const points = `(${item.total} pts)`
            const filePadded = item.file.padEnd(45)
            const color = flop ? yellow : (s => s)

            console.log(`  ${color(filePadded)} ${percent} ${gray(points)}`)

            if (verbose && item.breakdown.length > 0) {
                console.log(dim(`    → ${item.breakdown.join(' | ')}`))
            }
        }

        const allScores = this.options.flop ? displayList : displayList
        const avgScore = Math.round(allScores.reduce((sum, s) => sum + s.total, 0) / allScores.length)

        console.log('')
        console.log(`  ${green('Summary:')} ${displayList.length} files${flop ? ' (worst)' : ''}, avg score: ${avgScore} pts`)
        console.log('')
    }

}
