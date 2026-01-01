import Random from './random.js'


describe(Random, () => {
    let random

    beforeEach(() => {
        random = new Random('testSeed')
    })


    describe('constructor', () => {

        test('creates instance with default seed', () => {
            const randomWithDefaultSeed = new Random()
            expect(randomWithDefaultSeed).toBeInstanceOf(Random)
            expect(randomWithDefaultSeed.getSeed()).toBeDefined()
        })


        test('creates instance with custom seed', () => {
            const randomWithCustomSeed = new Random('mySeed')
            expect(randomWithCustomSeed).toBeInstanceOf(Random)
            expect(randomWithCustomSeed.getSeed()).toEqual('mySeed')
        })

    })


    describe('determinism', () => {

        test('same seed produces same sequence', () => {
            const random1 = new Random('same-seed')
            const random2 = new Random('same-seed')

            for (let i = 0; i < 10; i++) {
                expect(random1.between(0, 1)).toBe(random2.between(0, 1))
            }
        })


        test('different seeds produce different sequences', () => {
            const random1 = new Random('seed-a')
            const random2 = new Random('seed-b')

            const sequence1 = Array.from({length: 5}, () => random1.between(0, 1))
            const sequence2 = Array.from({length: 5}, () => random2.between(0, 1))

            expect(sequence1).not.toEqual(sequence2)
        })


        test('returns numbers between 0 and 1', () => {
            const testRandom = new Random('test')
            for (let i = 0; i < 100; i++) {
                const value = testRandom.between(0, 1)
                expect(value).toBeGreaterThanOrEqual(0)
                expect(value).toBeLessThan(1)
            }
        })

    })


    describe('setSeed & getSeed', () => {

        test('gets and sets seed', () => {
            expect(random.getSeed()).toEqual('testSeed')

            random.setSeed('newSeed')
            expect(random.getSeed()).toEqual('newSeed')
        })


        test('setSeed resets the generator', () => {
            const firstSequence = [
                random.between(0, 1),
                random.between(0, 1),
                random.between(0, 1)
            ]

            random.setSeed('testSeed')

            const resetSequence = [
                random.between(0, 1),
                random.between(0, 1),
                random.between(0, 1)
            ]

            expect(resetSequence).toEqual(firstSequence)
        })


        test('setSeed returns this for chaining', () => {
            expect(random.setSeed('newSeed')).toBe(random)
        })

    })


    describe('setState & getState', () => {

        test('getState returns current state with all properties', () => {
            const state = random.getState()

            expect(state).toHaveProperty('c')
            expect(state).toHaveProperty('s0')
            expect(state).toHaveProperty('s1')
            expect(state).toHaveProperty('s2')
        })


        test('state changes after generating numbers', () => {
            const initialState = random.getState()

            random.between(0, 10)

            const newState = random.getState()
            expect(newState).not.toEqual(initialState)
        })


        test('setState restores state', () => {
            random.between(0, 1)
            random.between(0, 1)
            random.between(0, 1)

            const savedState = random.getState()

            const afterSave = [
                random.between(0, 1),
                random.between(0, 1),
                random.between(0, 1)
            ]

            random.setState(savedState)

            const afterRestore = [
                random.between(0, 1),
                random.between(0, 1),
                random.between(0, 1)
            ]

            expect(afterRestore).toEqual(afterSave)
        })


        test('setState returns this for chaining', () => {
            const state = random.getState()
            expect(random.setState(state)).toBe(random)
        })


        test('sequence reproduction with state', () => {
            const initialState = random.getState()

            const firstSequence = [
                random.between(0, 100),
                random.between(10, 50),
                random.between(-10, 10)
            ]

            random.setState(initialState)

            const secondSequence = [
                random.between(0, 100),
                random.between(10, 50),
                random.between(-10, 10)
            ]

            expect(secondSequence).toEqual(firstSequence)
        })

    })


    describe('fork', () => {

        test('creates a new Random instance', () => {
            const forkedRandom = random.fork()
            expect(forkedRandom).toBeInstanceOf(Random)
            expect(forkedRandom).not.toBe(random)
        })


        test('forked instance has same seed and state', () => {
            random.between(0, 10)

            const forkedRandom = random.fork()
            expect(forkedRandom.getSeed()).toEqual(random.getSeed())
            expect(forkedRandom.getState()).toEqual(random.getState())
        })


        test('forked instance produces same sequence', () => {
            random.between(0, 10)

            const forkedRandom = random.fork()

            const originalSequence = [
                random.between(0, 100),
                random.between(0, 100),
                random.between(0, 100)
            ]

            random.setState(forkedRandom.getState())

            const forkedSequence = [
                forkedRandom.between(0, 100),
                forkedRandom.between(0, 100),
                forkedRandom.between(0, 100)
            ]

            expect(forkedSequence).toEqual(originalSequence)
        })


        test('forked instance diverges independently', () => {
            random.between(0, 10)

            const forkedRandom = random.fork()

            forkedRandom.between(0, 10)
            expect(forkedRandom.getState()).not.toEqual(random.getState())
        })

    })


    describe('between', () => {

        test('returns value in range', () => {
            const value = random.between(0, 10)
            expect(value).toBeGreaterThanOrEqual(0)
            expect(value).toBeLessThan(10)
        })


        test('works with negative ranges', () => {
            const negativeValue = random.between(-10, 0)
            expect(negativeValue).toBeGreaterThanOrEqual(-10)
            expect(negativeValue).toBeLessThan(0)
        })


        test('works with decimal ranges', () => {
            const value = random.between(0.5, 1.5)
            expect(value).toBeGreaterThanOrEqual(0.5)
            expect(value).toBeLessThan(1.5)
        })

    })


    describe('intBetween', () => {

        test('returns integer in range', () => {
            const value = random.intBetween(0, 10)
            expect(value).toBeGreaterThanOrEqual(0)
            expect(value).toBeLessThan(10)
            expect(Number.isInteger(value)).toBe(true)
        })


        test('returns integers for many iterations', () => {
            for (let i = 0; i < 100; i++) {
                const value = random.intBetween(0, 100)
                expect(Number.isInteger(value)).toBe(true)
            }
        })

    })


    describe('pick', () => {

        test('returns element from array', () => {
            const array = [1, 2, 3, 4, 5]
            const value = random.pick(array)
            expect(array).toContain(value)
        })


        test('can pick all elements over many iterations', () => {
            const array = ['a', 'b', 'c']
            const picked = new Set()

            for (let i = 0; i < 100; i++) {
                picked.add(random.pick(array))
            }

            expect(picked.size).toBe(3)
        })

    })


    describe('oneChanceIn', () => {

        test('returns boolean', () => {
            const result = random.oneChanceIn(2)
            expect(typeof result).toBe('boolean')
        })


        test('higher chances produce fewer true results', () => {
            const testRandom = new Random('oneChanceTest')
            let trueCount2 = 0
            let trueCount10 = 0

            for (let i = 0; i < 1000; i++) {
                if (testRandom.oneChanceIn(2)) {
                    trueCount2++
                }
                if (testRandom.oneChanceIn(10)) {
                    trueCount10++
                }
            }

            expect(trueCount2).toBeGreaterThan(trueCount10)
        })

    })


    describe('coinToss', () => {

        test('returns boolean', () => {
            const result = random.coinToss()
            expect(typeof result).toBe('boolean')
        })


        test('produces roughly equal distribution', () => {
            const testRandom = new Random('coinTossTest')
            let trueCount = 0

            for (let i = 0; i < 1000; i++) {
                if (testRandom.coinToss()) {
                    trueCount++
                }
            }

            expect(trueCount).toBeGreaterThan(400)
            expect(trueCount).toBeLessThan(600)
        })

    })


    describe('weightedChoice', () => {

        test('respects weights distribution', () => {
            const choices = [
                {value: 'rare', weight: 1},
                {value: 'common', weight: 99}
            ]

            const results = {rare: 0, common: 0}
            const testRandom = new Random('weightedTestSeed')

            for (let i = 0; i < 1000; i++) {
                const result = testRandom.weightedChoice(choices)
                results[result]++
            }

            expect(results.common).toBeGreaterThan(results.rare)
            expect(results.rare).toBeGreaterThan(0)
        })


        test('returns undefined for empty array', () => {
            expect(random.weightedChoice([])).toBeUndefined()
        })


        test('returns undefined for undefined input', () => {
            expect(random.weightedChoice()).toBeUndefined()
        })


        test('works with single choice', () => {
            const choices = [{value: 'only', weight: 1}]
            expect(random.weightedChoice(choices)).toBe('only')
        })

    })


    describe('generateSeed', () => {

        test('returns string of default length 10', () => {
            const seed = Random.generateSeed()
            expect(typeof seed).toBe('string')
            expect(seed.length).toBe(10)
        })


        test('respects custom length', () => {
            const customLengthSeed = Random.generateSeed(15)
            expect(customLengthSeed.length).toBe(15)
        })


        test('generates different seeds', () => {
            const seed1 = Random.generateSeed()
            const seed2 = Random.generateSeed()
            expect(seed1).not.toEqual(seed2)
        })

    })

})
