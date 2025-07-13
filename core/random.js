import alea from './libs/alea'


const characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'

/**
 * A seedable random number generator using the Alea algorithm.
 * Provides deterministic random numbers and various utility methods.
 */
export default class Random {

    /**
     * Creates a new Random instance with optional seed.
     * @param {string} [seed] - The seed for the random number generator. If not provided, generates a random seed.
     */
    constructor (seed = Random.generateSeed()) {
        this.random = alea(seed)
        this.currentSeed = seed
    }


    /**
     * Sets a new seed for the random number generator.
     * @param {string} seed - The new seed to use
     * @returns {Random} This instance for method chaining
     */
    setSeed (seed) {
        this.random.setSeed(seed)
        this.currentSeed = seed

        return this
    }


    /**
     * Gets the current seed being used by the generator.
     * @returns {string} The current seed
     */
    getSeed () {
        return this.currentSeed
    }


    /**
     * Sets the internal state of the random number generator.
     * @param {Object} state - The state object to restore
     * @returns {Random} This instance for method chaining
     */
    setState (state) {
        this.random.setState(state)

        return this
    }


    /**
     * Gets the current internal state of the random number generator.
     * @returns {Object} The current state object
     */
    getState () {
        return this.random.state()
    }


    /**
     * Creates a new Random instance with the same seed and state.
     * @returns {Random} A new Random instance that's a copy of this one
     */
    fork () {
        const newRandom = new Random(this.currentSeed)
        newRandom.setState(this.random.state())

        return newRandom
    }


    /**
     * Generates a random number between min and max (exclusive).
     * @param {number} min - The minimum value (inclusive)
     * @param {number} max - The maximum value (exclusive)
     * @returns {number} A random number between min and max
     */
    between (min, max) {
        return this.random() * (max - min) + min
    }


    /**
     * Generates a random integer between min and max (exclusive).
     * @param {number} min - The minimum value (inclusive)
     * @param {number} max - The maximum value (exclusive)
     * @returns {number} A random integer between min and max
     */
    intBetween (min, max) {
        return Math.floor(this.between(min, max))
    }


    /**
     * Picks a random element from an array.
     * @param {any[]} array - The array to pick from
     * @returns {any} A random element from the array
     */
    pick (array) {
        const index = this.intBetween(0, array.length)

        return array[index]
    }


    /**
     * Returns true with a 1 in N chance.
     * @param {number} chances - The number of chances (e.g., 6 for 1 in 6)
     * @returns {boolean} True if the random event occurred
     */
    oneChanceIn (chances) {
        return this.between(0, 1) < 1 / chances
    }


    /**
     * Simulates a coin toss with 50/50 probability.
     * @returns {boolean} True or false with equal probability
     */
    coinToss () {
        return this.between(0, 1) < 0.5
    }


    /**
     * Makes a weighted random choice from an array of choices.
     * @param {Array<{value: any, weight: number}>} choices - Array of choices with their weights
     * @returns {any|undefined} The selected value, or undefined if choices is empty
     * @example
     * // Choose between 'hello' (10% chance) and 'world' (90% chance)
     * random.weightedChoice([
     *   {value: 'hello', weight: 1}, 
     *   {value: 'world', weight: 9}
     * ])
     */
    weightedChoice (choices) {
        if (!choices || choices.length === 0) {
            return undefined
        }

        const totalWeight = choices.reduce((total, choice) => total + choice.weight, 0)

        let randomValue = this.random() * totalWeight

        for (let choice of choices) {
            randomValue -= choice.weight

            if (randomValue <= 0) {
                return choice.value
            }
        }

        return choices[choices.length - 1].value
    }


    /**
     * Generates a random alphanumeric seed string.
     * @param {number} [length=10] - The length of the seed to generate
     * @returns {string} A random alphanumeric string
     */
    static generateSeed (length = 10) {
        let result = ''
    
        const charactersLength = characters.length
    
        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * charactersLength)
            result += characters.charAt(randomIndex)
        }
    
        return result
    }

}
