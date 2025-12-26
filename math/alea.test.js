import {describe, expect, test} from 'vitest'
import {alea, getMash} from './alea'


describe('alea', () => {

    describe('basic functionality', () => {

        test('returns a function', () => {
            const random = alea('seed')
            expect(typeof random).toBe('function')
        })


        test('returns numbers between 0 and 1', () => {
            const random = alea('test')
            for (let i = 0; i < 100; i++) {
                const value = random()
                expect(value).toBeGreaterThanOrEqual(0)
                expect(value).toBeLessThan(1)
            }
        })

    })


    describe('determinism', () => {

        test('same seed produces same sequence', () => {
            const random1 = alea('same-seed')
            const random2 = alea('same-seed')

            for (let i = 0; i < 10; i++) {
                expect(random1()).toBe(random2())
            }
        })


        test('different seeds produce different sequences', () => {
            const random1 = alea('seed-a')
            const random2 = alea('seed-b')

            const sequence1 = Array.from({length: 5}, () => random1()) // eslint-disable-line max-nested-callbacks
            const sequence2 = Array.from({length: 5}, () => random2()) // eslint-disable-line max-nested-callbacks

            expect(sequence1).not.toEqual(sequence2)
        })

    })


    describe('state management', () => {

        test('state() returns current state', () => {
            const random = alea('test')
            const state = random.state()

            expect(state).toHaveProperty('c')
            expect(state).toHaveProperty('s0')
            expect(state).toHaveProperty('s1')
            expect(state).toHaveProperty('s2')
        })


        test('setState() restores state', () => {
            const random = alea('test')

            // Generate a few numbers
            random()
            random()
            random()

            // Save state
            const savedState = random.state()

            // Generate more numbers
            const afterSave = [random(), random(), random()]

            // Restore state
            random.setState(savedState)

            // Should get same numbers again
            const afterRestore = [random(), random(), random()]

            expect(afterRestore).toEqual(afterSave)
        })


        test('can initialize with state object', () => {
            const random1 = alea('test')
            random1()
            random1()
            const state = random1.state()

            // Initialize new generator with saved state
            const random2 = alea(state)

            // Should produce same sequence
            for (let i = 0; i < 5; i++) {
                expect(random1()).toBe(random2())
            }
        })

    })


    describe('setSeed', () => {

        test('setSeed resets the generator', () => {
            const random = alea('initial')

            const firstSequence = [random(), random(), random()]

            random.setSeed('initial')

            const resetSequence = [random(), random(), random()]

            expect(resetSequence).toEqual(firstSequence)
        })

    })

})


describe('getMash', () => {

    test('returns a function', () => {
        const mash = getMash()
        expect(typeof mash).toBe('function')
    })


    test('returns consistent hash for same input', () => {
        const mash1 = getMash()
        const mash2 = getMash()

        expect(mash1('test')).toBe(mash2('test'))
    })

})
