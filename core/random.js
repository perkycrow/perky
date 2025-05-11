import alea from './libs/alea'


const characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'

export default class Random {

    constructor (seed = Random.generateSeed()) {
        this.random = alea(seed)
        this.currentSeed = seed
    }


    setSeed (seed) {
        this.random.setSeed(seed)
        this.currentSeed = seed

        return this
    }


    getSeed () {
        return this.currentSeed
    }


    setState (state) {
        this.random.setState(state)

        return this
    }


    getState () {
        return this.random.state()
    }


    fork () {
        const newRandom = new Random(this.currentSeed)
        newRandom.setState(this.random.state())

        return newRandom
    }


    between (min, max) {
        return this.random() * (max - min) + min
    }


    intBetween (min, max) {
        return Math.floor(this.between(min, max))
    }


    pick (array) {
        const index = this.intBetween(0, array.length)

        return array[index]
    }


    oneChanceIn (chances) {
        return this.between(0, 1) < 1 / chances
    }


    coinToss () {
        return this.between(0, 1) < 0.5
    }


    // [{value: 'hello', weight: 1}, {value: 'world', weight: 10}]
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
