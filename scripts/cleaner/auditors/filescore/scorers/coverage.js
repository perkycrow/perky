import fs from 'fs'
import BaseScorer from './base_scorer.js'


function hasTestFile (filePath) {
    const testPath = filePath.replace(/\.js$/, '.test.js')
    return fs.existsSync(testPath)
}


function hasDocFile (filePath) {
    const docPath = filePath.replace(/\.js$/, '.doc.js')
    return fs.existsSync(docPath)
}


export default class CoverageScorer extends BaseScorer {

    static $name = 'Coverage'
    static $weight = 1
    static $description = 'Test and doc file presence'

    #testPoints = 30
    #docPoints = 10

    score (filePath) {
        let points = 0
        const breakdown = []

        if (hasTestFile(filePath)) {
            points += this.#testPoints
            breakdown.push(`Has test: +${this.#testPoints}`)
        }

        if (hasDocFile(filePath)) {
            points += this.#docPoints
            breakdown.push(`Has doc: +${this.#docPoints}`)
        }

        return {points, breakdown}
    }

}
