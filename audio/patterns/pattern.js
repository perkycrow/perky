import PerkyModule from '../../core/perky_module.js'


export default class Pattern extends PerkyModule {

    static $category = 'pattern'
    static $lifecycle = false

    #steps = []
    #bpm = 120
    #playing = false
    #currentStep = 0
    #stepDuration = 0
    #elapsed = 0
    #loop = true
    #swing = 0

    constructor (options = {}) {
        super(options)

        this.#bpm = options.bpm ?? 120
        this.#loop = options.loop ?? true
        this.#swing = options.swing ?? 0

        if (options.steps) {
            this.#steps = options.steps
        } else if (options.pattern) {
            this.#steps = parsePattern(options.pattern)
        }

        this.#updateStepDuration()
    }


    get steps () {
        return this.#steps
    }


    get stepCount () {
        return this.#steps.length
    }


    get bpm () {
        return this.#bpm
    }


    set bpm (value) {
        this.#bpm = Math.max(1, Math.min(999, value))
        this.#updateStepDuration()
    }


    get playing () {
        return this.#playing
    }


    get currentStep () {
        return this.#currentStep
    }


    get loop () {
        return this.#loop
    }


    set loop (value) {
        this.#loop = Boolean(value)
    }


    get swing () {
        return this.#swing
    }


    set swing (value) {
        this.#swing = Math.max(0, Math.min(1, value))
    }


    get progress () {
        if (this.#steps.length === 0) {
            return 0
        }
        return this.#currentStep / this.#steps.length
    }


    #updateStepDuration () {
        this.#stepDuration = 60 / this.#bpm / 4
    }


    setPattern (pattern) {
        this.#steps = typeof pattern === 'string' ? parsePattern(pattern) : pattern
        this.reset()
        return this
    }


    setSteps (steps) {
        this.#steps = steps
        this.reset()
        return this
    }


    setBpm (value) {
        this.bpm = value
        return this
    }


    setSwing (value) {
        this.swing = value
        return this
    }


    play () {
        if (this.#playing) {
            return this
        }

        this.#playing = true
        this.emit('play')
        return this
    }


    stop () {
        if (!this.#playing) {
            return this
        }

        this.#playing = false
        this.emit('stop')
        return this
    }


    reset () {
        this.#currentStep = 0
        this.#elapsed = 0
        this.emit('reset')
        return this
    }


    update (delta) {
        if (!this.#playing || this.#steps.length === 0) {
            return
        }

        this.#elapsed += delta

        const swingOffset = this.#currentStep % 2 === 1 ? this.#swing * this.#stepDuration * 0.5 : 0
        const targetDuration = this.#stepDuration + swingOffset

        while (this.#elapsed >= targetDuration) {
            this.#elapsed -= targetDuration

            const step = this.#steps[this.#currentStep]
            this.#triggerStep(step, this.#currentStep)

            this.#currentStep++

            if (this.#currentStep >= this.#steps.length) {
                if (this.#loop) {
                    this.#currentStep = 0
                    this.emit('loop')
                } else {
                    this.#playing = false
                    this.emit('complete')
                    return
                }
            }
        }
    }


    #triggerStep (step, index) {
        if (step === null || step === '_' || step === '.') {
            return
        }

        if (Array.isArray(step)) {
            for (const subStep of step) {
                this.#triggerStep(subStep, index)
            }
            return
        }

        this.emit('step', step, index)
        this.emit(`step:${step}`, index)
    }


    onStep (callback) {
        this.on('step', callback)
        return this
    }


    map (fn) {
        const newSteps = this.#steps.map((step, i) => fn(step, i))
        return new Pattern({
            steps: newSteps,
            bpm: this.#bpm,
            loop: this.#loop,
            swing: this.#swing
        })
    }


    reverse () {
        return new Pattern({
            steps: [...this.#steps].reverse(),
            bpm: this.#bpm,
            loop: this.#loop,
            swing: this.#swing
        })
    }


    fast (factor) {
        return new Pattern({
            steps: this.#steps,
            bpm: this.#bpm * factor,
            loop: this.#loop,
            swing: this.#swing
        })
    }


    slow (factor) {
        return this.fast(1 / factor)
    }


    every (n, fn) {
        let count = 0
        const newPattern = new Pattern({
            steps: this.#steps,
            bpm: this.#bpm,
            loop: this.#loop,
            swing: this.#swing
        })

        newPattern.on('loop', () => {
            count++
            if (count % n === 0) {
                fn(newPattern)
            }
        })

        return newPattern
    }

}


export function parsePattern (str) { // eslint-disable-line complexity -- clean
    if (!str || typeof str !== 'string') {
        return []
    }

    const steps = []
    let i = 0

    while (i < str.length) {
        const char = str[i]

        if (char === ' ') {
            i++
            continue
        }

        if (char === '[') {
            const {group, end} = parseGroup(str, i)
            steps.push(group)
            i = end
            continue
        }

        if (char === '.' || char === '_' || char === '~') {
            steps.push(null)
            i++
            continue
        }

        let token = ''
        while (i < str.length && !isDelimiter(str[i])) {
            token += str[i]
            i++
        }

        if (token) {
            steps.push(token)
        }
    }

    return steps
}


function parseGroup (str, start) { // eslint-disable-line complexity -- clean
    const group = []
    let i = start + 1

    while (i < str.length && str[i] !== ']') {
        const char = str[i]

        if (char === ' ') {
            i++
            continue
        }

        if (char === '[') {
            const {group: nested, end} = parseGroup(str, i)
            group.push(nested)
            i = end
            continue
        }

        if (char === '.' || char === '_' || char === '~') {
            group.push(null)
            i++
            continue
        }

        let token = ''
        while (i < str.length && !isDelimiter(str[i])) {
            token += str[i]
            i++
        }

        if (token) {
            group.push(token)
        }
    }

    return {group, end: i + 1}
}


function isDelimiter (char) {
    return char === ' ' || char === '[' || char === ']'
}
