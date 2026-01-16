import {describe, expect, test, vi, beforeEach} from 'vitest'
import UsageScorer from './usage.js'


vi.mock('fs', () => ({
    default: {
        readFileSync: vi.fn(),
        existsSync: vi.fn()
    }
}))


vi.mock('../../../utils.js', () => ({
    findJsFiles: vi.fn()
}))


import fs from 'fs'
import {findJsFiles} from '../../../utils.js'


describe('UsageScorer', () => {

    beforeEach(() => {
        vi.clearAllMocks()
    })


    test('has correct static properties', () => {
        expect(UsageScorer.$name).toEqual('Usage')
        expect(UsageScorer.$weight).toEqual(1)
        expect(UsageScorer.$description).toEqual('How many times the file is imported elsewhere')
    })


    test('returns 0 points when file has no imports', () => {
        findJsFiles.mockReturnValue(['/test/core/module.js', '/test/core/other.js'])
        fs.readFileSync.mockReturnValue('const x = 1')
        fs.existsSync.mockReturnValue(false)

        const scorer = new UsageScorer('/test')
        scorer.excludeDirs = []
        const result = scorer.score('/test/core/module.js')

        expect(result).toEqual({points: 0, breakdown: []})
    })


    test('returns 15 points when file is imported', () => {
        findJsFiles.mockReturnValue(['/test/core/module.js', '/test/core/other.js'])
        fs.readFileSync.mockImplementation(path => {
            if (path === '/test/core/other.js') {
                return "import Module from './module.js'"
            }
            return ''
        })
        fs.existsSync.mockReturnValue(true)

        const scorer = new UsageScorer('/test')
        scorer.excludeDirs = []
        const result = scorer.score('/test/core/module.js')

        expect(result.points).toEqual(15)
        expect(result.breakdown).toContain('Used (1 imports): +15')
    })


    test('counts multiple imports correctly', () => {
        findJsFiles.mockReturnValue([
            '/test/core/module.js',
            '/test/core/a.js',
            '/test/core/b.js'
        ])
        fs.readFileSync.mockImplementation(path => {
            if (path.endsWith('a.js') || path.endsWith('b.js')) {
                return "import Module from './module.js'"
            }
            return ''
        })
        fs.existsSync.mockReturnValue(true)

        const scorer = new UsageScorer('/test')
        scorer.excludeDirs = []
        const result = scorer.score('/test/core/module.js')

        expect(result.points).toEqual(15)
        expect(result.breakdown).toContain('Used (2 imports): +15')
    })

})
