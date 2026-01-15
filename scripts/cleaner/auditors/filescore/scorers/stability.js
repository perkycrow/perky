import {execSync} from 'child_process'
import BaseScorer from './base_scorer.js'


export default class StabilityScorer extends BaseScorer {

    static $name = 'Stability'
    static $weight = 1
    static $description = 'No recent changes indicates consolidation'

    #stableDays = 30
    #stableBonus = 10

    score (filePath) {
        const daysSinceLastCommit = this.#getDaysSinceLastCommit(filePath)
        const isStable = daysSinceLastCommit >= this.#stableDays
        const points = isStable ? this.#stableBonus : 0
        const breakdown = isStable ? [`Stable: +${points} (${daysSinceLastCommit} days)`] : []

        return {points, breakdown}
    }


    #getDaysSinceLastCommit (filePath) {
        try {
            const timestamp = execSync(
                `git log -1 --format=%ct -- "${filePath}"`,
                {cwd: this.rootDir, encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe']}
            ).trim()

            if (!timestamp) {
                return 0
            }

            const lastCommitDate = new Date(parseInt(timestamp, 10) * 1000)
            const now = new Date()
            const diffMs = now - lastCommitDate
            const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))

            return days
        } catch {
            return 0
        }
    }

}
