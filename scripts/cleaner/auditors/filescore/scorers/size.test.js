import {describe, expect, test} from 'vitest'
import SizeScorer from './size.js'


describe('SizeScorer', () => {

    test('has correct static properties', () => {
        expect(SizeScorer.$name).toEqual('Size')
        expect(SizeScorer.$weight).toEqual(1)
        expect(SizeScorer.$description).toEqual('Smaller files score higher')
    })


    test('returns max points for empty file', () => {
        const scorer = new SizeScorer('/test')
        const content = ''
        const result = scorer.score('/test/file.js', content)

        // maxLines=500, chunkSize=50, pointsPerChunk=2
        // savedLines = 500 - 1 = 499
        // points = floor(499/50) * 2 = 9 * 2 = 18
        expect(result.points).toEqual(18)
        expect(result.breakdown).toHaveLength(1)
    })


    test('returns 0 points for file exceeding max lines', () => {
        const scorer = new SizeScorer('/test')
        const content = '\n'.repeat(600)
        const result = scorer.score('/test/file.js', content)

        expect(result.points).toEqual(0)
        expect(result.breakdown).toEqual([])
    })


    test('calculates points based on saved lines', () => {
        const scorer = new SizeScorer('/test')

        // 200 lines -> savedLines = 500-200 = 300 -> floor(300/50)*2 = 12
        const content = '\n'.repeat(199)
        const result = scorer.score('/test/file.js', content)

        expect(result.points).toEqual(12)
        expect(result.breakdown[0]).toMatch(/Compact: \+12 \(200 lines\)/)
    })


    test('returns 0 points for file at max lines', () => {
        const scorer = new SizeScorer('/test')
        const content = '\n'.repeat(499)
        const result = scorer.score('/test/file.js', content)

        expect(result.points).toEqual(0)
        expect(result.breakdown).toEqual([])
    })

})
