import {describe, expect, test} from 'vitest'
import AgeScorer from './age.js'


describe('AgeScorer', () => {

    test('has correct static properties', () => {
        expect(AgeScorer.$name).toEqual('Age')
        expect(AgeScorer.$weight).toEqual(1)
        expect(AgeScorer.$description).toEqual('Older files have proven stability')
    })


    test('can be instantiated', () => {
        const scorer = new AgeScorer('/test')
        expect(scorer).toBeInstanceOf(AgeScorer)
        expect(scorer.rootDir).toEqual('/test')
    })


    test('inherits name getter', () => {
        const scorer = new AgeScorer('/test')
        expect(scorer.name).toEqual('Age')
    })


    test('inherits weight getter', () => {
        const scorer = new AgeScorer('/test')
        expect(scorer.weight).toEqual(1)
    })

})
