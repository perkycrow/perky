import {describe, expect, test} from 'vitest'
import StabilityScorer from './stability.js'


describe('StabilityScorer', () => {

    test('has correct static properties', () => {
        expect(StabilityScorer.$name).toEqual('Stability')
        expect(StabilityScorer.$weight).toEqual(1)
        expect(StabilityScorer.$description).toEqual('No recent changes indicates consolidation')
    })


    test('can be instantiated', () => {
        const scorer = new StabilityScorer('/test')
        expect(scorer).toBeInstanceOf(StabilityScorer)
        expect(scorer.rootDir).toEqual('/test')
    })


    test('inherits name getter', () => {
        const scorer = new StabilityScorer('/test')
        expect(scorer.name).toEqual('Stability')
    })


    test('inherits weight getter', () => {
        const scorer = new StabilityScorer('/test')
        expect(scorer.weight).toEqual(1)
    })

})
