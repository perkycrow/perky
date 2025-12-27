const CHARACTERS = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'


export default class Random {

    #c
    #s0
    #s1
    #s2
    #seed


    constructor (seed = Random.generateSeed()) {
        this.#seed = seed
        this.#initSeed(seed)
    }


    #next () {
        const t = 2091639 * this.#s0 + this.#c * 2.3283064365386963e-10
        this.#c = t | 0 // eslint-disable-line no-bitwise
        this.#s0 = this.#s1
        this.#s1 = this.#s2
        this.#s2 = t - this.#c

        return this.#s2
    }


    #initSeed (seed) {
        const mash = createMash()
        this.#c = 1
        this.#s0 = 0.8633289230056107 - mash(seed)
        if (this.#s0 < 0) {
            this.#s0 += 1
        }
        this.#s1 = 0.15019597788341343 - mash(seed)
        if (this.#s1 < 0) {
            this.#s1 += 1
        }
        this.#s2 = 0.9176952994894236 - mash(seed)
        if (this.#s2 < 0) {
            this.#s2 += 1
        }
    }


    setSeed (seed) {
        this.#seed = seed
        this.#initSeed(seed)

        return this
    }


    getSeed () {
        return this.#seed
    }


    setState (state) {
        this.#c = state.c
        this.#s0 = state.s0
        this.#s1 = state.s1
        this.#s2 = state.s2

        return this
    }


    getState () {
        return {
            c: this.#c,
            s0: this.#s0,
            s1: this.#s1,
            s2: this.#s2
        }
    }


    fork () {
        const forked = new Random(this.#seed)
        forked.setState(this.getState())

        return forked
    }


    between (min, max) {
        return this.#next() * (max - min) + min
    }


    intBetween (min, max) {
        return Math.floor(this.between(min, max))
    }


    pick (array) {
        return array[this.intBetween(0, array.length)]
    }


    oneChanceIn (chances) {
        return this.#next() < 1 / chances
    }


    coinToss () {
        return this.#next() < 0.5
    }


    weightedChoice (choices) {
        if (!choices || choices.length === 0) {
            return undefined
        }

        const totalWeight = choices.reduce((total, choice) => total + choice.weight, 0)

        let randomValue = this.#next() * totalWeight

        for (const choice of choices) {
            randomValue -= choice.weight

            if (randomValue <= 0) {
                return choice.value
            }
        }

        return choices[choices.length - 1].value
    }


    static generateSeed (length = 10) {
        let result = ''

        for (let i = 0; i < length; i++) {
            result += CHARACTERS.charAt(Math.floor(Math.random() * CHARACTERS.length))
        }

        return result
    }

}


function createMash () {
    let n = 0xeaee1443

    return function (string) {
        string = String(string)

        for (let i = 0; i < string.length; i++) {
            n += string.charCodeAt(i)
            let h = 0.02519603282416938 * n
            n = h >>> 0 // eslint-disable-line no-bitwise
            h = (h - n) * n
            n = h >>> 0 // eslint-disable-line no-bitwise
            n += (h - n) * 0x100000000
        }

        return (n >>> 0) * 2.3283064365386963e-10 // eslint-disable-line no-bitwise
    }
}
