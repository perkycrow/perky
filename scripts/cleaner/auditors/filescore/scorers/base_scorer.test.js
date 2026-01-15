import {describe, expect, test} from 'vitest'
import BaseScorer from './base_scorer.js'


describe('BaseScorer', () => {

    test('has default static properties', () => {
        expect(BaseScorer.$name).toEqual('Base')
        expect(BaseScorer.$weight).toEqual(1)
        expect(BaseScorer.$description).toEqual('')
    })


    test('stores rootDir', () => {
        const scorer = new BaseScorer('/test/path')
        expect(scorer.rootDir).toEqual('/test/path')
    })


    test('has name getter', () => {
        const scorer = new BaseScorer('/test')
        expect(scorer.name).toEqual('Base')
    })


    test('has weight getter', () => {
        const scorer = new BaseScorer('/test')
        expect(scorer.weight).toEqual(1)
    })


    test('has excludeDirs getter and setter', () => {
        const scorer = new BaseScorer('/test')
        expect(scorer.excludeDirs).toEqual([])

        scorer.excludeDirs = ['dir1/', 'dir2/']
        expect(scorer.excludeDirs).toEqual(['dir1/', 'dir2/'])
    })


    test('score returns default result', () => {
        const scorer = new BaseScorer('/test')
        const result = scorer.score('/test/file.js', 'content')

        expect(result).toEqual({points: 0, breakdown: []})
    })

})
