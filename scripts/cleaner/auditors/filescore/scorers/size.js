import BaseScorer from './base_scorer.js'


export default class SizeScorer extends BaseScorer {

    static $name = 'Size'
    static $weight = 1
    static $description = 'Smaller files score higher'

    #maxLines = 500
    #pointsPerSavedChunk = 2
    #chunkSize = 50


    score (filePath, content) {
        const lines = content.split('\n').length
        const savedLines = Math.max(0, this.#maxLines - lines)
        const points = Math.floor(savedLines / this.#chunkSize) * this.#pointsPerSavedChunk
        const breakdown = points > 0 ? [`Compact: +${points} (${lines} lines)`] : []

        return {points, breakdown}
    }

}
