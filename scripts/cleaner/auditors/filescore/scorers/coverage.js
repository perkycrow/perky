import fs from 'fs'
import BaseScorer from './base_scorer.js'


export default class CoverageScorer extends BaseScorer {

    static $name = 'Coverage'
    static $weight = 1
    static $description = 'Test and doc file presence'


    score (filePath) {
        let points = 0
        const breakdown = []

        const testPath = filePath.replace(/\.js$/, '.test.js')
        if (fs.existsSync(testPath)) {
            points += 30
            breakdown.push('Has test: +30')
        }

        const docPath = filePath.replace(/\.js$/, '.doc.js')
        if (fs.existsSync(docPath)) {
            points += 10
            breakdown.push('Has doc: +10')
        }

        return {points, breakdown}
    }

}
