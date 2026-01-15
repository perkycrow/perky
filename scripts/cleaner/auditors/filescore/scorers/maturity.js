import {execSync} from 'child_process'
import BaseScorer from './base_scorer.js'


export default class MaturityScorer extends BaseScorer {

    static $name = 'Maturity'
    static $weight = 1
    static $description = 'Work sessions and total changes indicate refinement'

    #sessionGapDays = 7
    #pointsPerSession = 5
    #linesPerPoint = 100

    score (filePath) {
        const sessions = this.#countSessions(filePath)
        const totalLines = this.#getTotalLinesChanged(filePath)

        const sessionPoints = sessions * this.#pointsPerSession
        const churnPoints = Math.floor(totalLines / this.#linesPerPoint)
        const points = sessionPoints + churnPoints

        const breakdown = []
        if (sessionPoints > 0) {
            breakdown.push(`Sessions: +${sessionPoints} (${sessions})`)
        }
        if (churnPoints > 0) {
            breakdown.push(`Churn: +${churnPoints} (${totalLines} lines)`)
        }

        return {points, breakdown}
    }


    #countSessions (filePath) {
        const timestamps = this.#getCommitTimestamps(filePath)

        if (timestamps.length <= 1) {
            return timestamps.length
        }

        const gapMs = this.#sessionGapDays * 24 * 60 * 60 * 1000
        let sessions = 1

        for (let i = 1; i < timestamps.length; i++) {
            const diff = timestamps[i - 1] - timestamps[i]
            if (diff > gapMs) {
                sessions++
            }
        }

        return sessions
    }


    #getCommitTimestamps (filePath) {
        try {
            const output = execSync(
                `git log --format=%ct -- "${filePath}"`,
                {cwd: this.rootDir, encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe']}
            ).trim()

            if (!output) {
                return []
            }

            return output.split('\n').map(ts => parseInt(ts, 10) * 1000)
        } catch {
            return []
        }
    }


    #getTotalLinesChanged (filePath) {
        try {
            const output = execSync(
                `git log --numstat --format="" -- "${filePath}"`,
                {cwd: this.rootDir, encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe']}
            ).trim()

            if (!output) {
                return 0
            }

            let total = 0
            for (const line of output.split('\n')) {
                const match = line.match(/^(\d+)\s+(\d+)/)
                if (match) {
                    total += parseInt(match[1], 10) + parseInt(match[2], 10)
                }
            }

            return total
        } catch {
            return 0
        }
    }

}
