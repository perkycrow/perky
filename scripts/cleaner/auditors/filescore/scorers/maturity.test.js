import {describe, expect, test} from 'vitest'
import MaturityScorer from './maturity.js'


describe('MaturityScorer', () => {

    test('has correct static properties', () => {
        expect(MaturityScorer.$name).toEqual('Maturity')
        expect(MaturityScorer.$weight).toEqual(1)
        expect(MaturityScorer.$description).toEqual('Work sessions and total changes indicate refinement')
    })


    test('can be instantiated', () => {
        const scorer = new MaturityScorer('/test')
        expect(scorer).toBeInstanceOf(MaturityScorer)
        expect(scorer.rootDir).toEqual('/test')
    })


    test('inherits name getter', () => {
        const scorer = new MaturityScorer('/test')
        expect(scorer.name).toEqual('Maturity')
    })


    test('inherits weight getter', () => {
        const scorer = new MaturityScorer('/test')
        expect(scorer.weight).toEqual(1)
    })

})
