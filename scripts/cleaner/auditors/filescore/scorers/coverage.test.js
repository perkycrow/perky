import {describe, expect, test, vi} from 'vitest'
import CoverageScorer from './coverage.js'


vi.mock('fs', () => ({
    default: {
        existsSync: vi.fn()
    }
}))


import fs from 'fs'


describe('CoverageScorer', () => {

    test('has correct static properties', () => {
        expect(CoverageScorer.$name).toEqual('Coverage')
        expect(CoverageScorer.$weight).toEqual(1)
        expect(CoverageScorer.$description).toEqual('Test and doc file presence')
    })


    test('returns 0 points when no test or doc file exists', () => {
        fs.existsSync.mockReturnValue(false)

        const scorer = new CoverageScorer('/test')
        const result = scorer.score('/test/file.js')

        expect(result).toEqual({points: 0, breakdown: []})
    })


    test('returns 30 points when test file exists', () => {
        fs.existsSync.mockImplementation(path => path.endsWith('.test.js'))

        const scorer = new CoverageScorer('/test')
        const result = scorer.score('/test/file.js')

        expect(result.points).toEqual(30)
        expect(result.breakdown).toContain('Has test: +30')
    })


    test('returns 10 points when doc file exists', () => {
        fs.existsSync.mockImplementation(path => path.endsWith('.doc.js'))

        const scorer = new CoverageScorer('/test')
        const result = scorer.score('/test/file.js')

        expect(result.points).toEqual(10)
        expect(result.breakdown).toContain('Has doc: +10')
    })


    test('returns 40 points when both test and doc files exist', () => {
        fs.existsSync.mockReturnValue(true)

        const scorer = new CoverageScorer('/test')
        const result = scorer.score('/test/file.js')

        expect(result.points).toEqual(40)
        expect(result.breakdown).toHaveLength(2)
        expect(result.breakdown).toContain('Has test: +30')
        expect(result.breakdown).toContain('Has doc: +10')
    })

})
