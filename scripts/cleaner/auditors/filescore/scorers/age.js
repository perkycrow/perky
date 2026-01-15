import {execSync} from 'child_process'
import BaseScorer from './base_scorer.js'


export default class AgeScorer extends BaseScorer {

    static $name = 'Age'
    static $weight = 1
    static $description = 'Older files have proven stability'

    #pointsPerMonth = 2
    #maxMonths = 24


    score (filePath) {
        const months = this.#getAgeInMonths(filePath)
        const cappedMonths = Math.min(months, this.#maxMonths)
        const points = cappedMonths * this.#pointsPerMonth
        const breakdown = points > 0 ? [`Age: +${points} (${months} months)`] : []

        return {points, breakdown}
    }


    #getAgeInMonths (filePath) {
        try {
            const timestamp = execSync(
                `git log --follow --format=%ct --diff-filter=A -- "${filePath}" | tail -1`,
                {cwd: this.rootDir, encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe']}
            ).trim()

            if (!timestamp) {
                return 0
            }

            const createdDate = new Date(parseInt(timestamp, 10) * 1000)
            const now = new Date()
            const diffMs = now - createdDate
            const months = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 30))

            return months
        } catch {
            return 0
        }
    }

}
