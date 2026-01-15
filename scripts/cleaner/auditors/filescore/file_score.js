import fs from 'fs'
import path from 'path'
import Auditor from '../../auditor.js'
import {isExcludedFile, loadCleanerConfig, isExcludedByConfig} from '../../utils.js'
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


function printHeader (flop) {
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
}


function printSummary (displayList, flop) {
    const avgScore = Math.round(displayList.reduce((sum, s) => sum + s.total, 0) / displayList.length)

    console.log('')
    console.log(`  ${green('Summary:')} ${displayList.length} files${flop ? ' (worst)' : ''}, avg score: ${avgScore} pts`)
    console.log('')
}


export default class FileScoreAuditor extends Auditor {

    static $name = 'File Scores'
    static $category = 'filescore'
    static $canFix = false
    static $hint = 'Higher score = healthier file'

    #scorers = []
    #excludeDirs = []

    constructor (rootDir, options = {}) {
        super(rootDir, options)
        this.#scorers = SCORERS.map(ScorerClass => new ScorerClass(rootDir))
    }


    async audit () {
        const config = await loadCleanerConfig(this.rootDir)
        this.#excludeDirs = config.filescore?.excludeDirs || []

        for (const scorer of this.#scorers) {
            scorer.excludeDirs = this.#excludeDirs
        }

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
        const allFiles = this.scanFiles()
        const files = allFiles.filter(filePath => {
            const relativePath = path.relative(this.rootDir, filePath)
            return !this.#shouldSkip(relativePath)
        })

        const results = []
        const total = files.length

        for (let i = 0; i < files.length; i++) {
            const filePath = files[i]
            const relativePath = path.relative(this.rootDir, filePath)

            this.#updateProgress(i + 1, total)

            const content = fs.readFileSync(filePath, 'utf-8')
            const scoreResult = this.#scoreFile(filePath, content)

            results.push({
                file: relativePath,
                ...scoreResult
            })
        }

        this.#clearProgress()
        return results
    }


    #updateProgress (current, total) {
        if (this.silent) {
            return
        }

        const percent = Math.round((current / total) * 100)
        const barWidth = 30
        const filled = Math.round((current / total) * barWidth)
        const empty = barWidth - filled
        const bar = '█'.repeat(filled) + '░'.repeat(empty)

        process.stdout.write(`\r  ${cyan('Analyzing')} ${bar} ${percent}% (${current}/${total})`)
    }


    #clearProgress () {
        if (this.silent) {
            return
        }

        process.stdout.write('\r' + ' '.repeat(70) + '\r')
    }


    #shouldSkip (relativePath) {
        if (isExcludedFile(relativePath)) {
            return true
        }

        if (isExcludedByConfig(relativePath, this.#excludeDirs)) {
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

        printHeader(flop)
        this.#printFiles(displayList, flop)
        printSummary(displayList, flop)
    }


    #printFiles (displayList, flop) {
        const verbose = this.options.verbose
        const color = flop ? yellow : s => s

        for (const item of displayList) {
            const percent = `${item.percent}%`.padStart(4)
            const points = `(${item.total} pts)`
            const filePadded = item.file.padEnd(45)

            console.log(`  ${color(filePadded)} ${percent} ${gray(points)}`)

            if (verbose && item.breakdown.length > 0) {
                for (const detail of item.breakdown) {
                    console.log(dim(`      ${detail}`))
                }
            }
        }
    }

}
