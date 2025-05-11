import Random from './random'


describe(Random, () => {
    let random
    
    beforeEach(() => {
        random = new Random('testSeed')
    })

    
    test('constructor', () => {
        const randomWithDefaultSeed = new Random()
        expect(randomWithDefaultSeed).toBeInstanceOf(Random)
        expect(randomWithDefaultSeed.getSeed()).toBeDefined()
        
        const randomWithCustomSeed = new Random('mySeed')
        expect(randomWithCustomSeed).toBeInstanceOf(Random)
        expect(randomWithCustomSeed.getSeed()).toEqual('mySeed')
    })
    
    
    test('setSeed & getSeed', () => {
        expect(random.getSeed()).toEqual('testSeed')
        
        random.setSeed('newSeed')
        expect(random.getSeed()).toEqual('newSeed')
    })
    
    
    test('setState & getState', () => {
        const initialState = random.getState()
        expect(initialState).toBeDefined()

        random.between(0, 10)
        
        const newState = random.getState()
        expect(newState).not.toEqual(initialState)

        random.setState(initialState)
        expect(random.getState()).toEqual(initialState)
    })
    
    
    test('fork', () => {
        random.between(0, 10)
        
        const forkedRandom = random.fork()
        expect(forkedRandom).toBeInstanceOf(Random)
        expect(forkedRandom).not.toBe(random)
        expect(forkedRandom.getSeed()).toEqual(random.getSeed())
        expect(forkedRandom.getState()).toEqual(random.getState())

        forkedRandom.between(0, 10)
        expect(forkedRandom.getState()).not.toEqual(random.getState())
    })
    
    
    test('between', () => {
        const value = random.between(0, 10)
        expect(value).toBeGreaterThanOrEqual(0)
        expect(value).toBeLessThan(10)

        const negativeValue = random.between(-10, 0)
        expect(negativeValue).toBeGreaterThanOrEqual(-10)
        expect(negativeValue).toBeLessThan(0)
    })
    
    
    test('intBetween', () => {
        const value = random.intBetween(0, 10)
        expect(value).toBeGreaterThanOrEqual(0)
        expect(value).toBeLessThan(10)
        expect(Number.isInteger(value)).toBe(true)
    })
    
    
    test('pick', () => {
        const array = [1, 2, 3, 4, 5]
        const value = random.pick(array)
        expect(array).toContain(value)
    })
    
    
    test('weightedChoice', () => {
        const choices = [
            {value: 'rare', weight: 1},
            {value: 'common', weight: 10}
        ]

        const testRandom = new Random('testSeed')

        const originalRandom = testRandom.random

        testRandom.random = () => 0.01
        expect(testRandom.weightedChoice(choices)).toEqual('rare')

        testRandom.random = () => 0.9
        expect(testRandom.weightedChoice(choices)).toEqual('common')

        testRandom.random = originalRandom

        expect(testRandom.weightedChoice([])).toBeUndefined()
        expect(testRandom.weightedChoice()).toBeUndefined()
    })
    
    
    test('generateSeed', () => {
        const seed = Random.generateSeed()
        expect(typeof seed).toBe('string')
        expect(seed.length).toBe(10)
        
        const customLengthSeed = Random.generateSeed(15)
        expect(customLengthSeed.length).toBe(15)
    })

})
