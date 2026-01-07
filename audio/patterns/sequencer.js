import PerkyModule from '../../core/perky_module.js'
import Pattern from './pattern.js'


export default class Sequencer extends PerkyModule {

    static $category = 'sequencer'

    #audioSystem = null
    #patterns = new Map()
    #playing = false
    #bpm = 120

    constructor (options = {}) {
        super(options)

        this.#audioSystem = options.audioSystem
        this.#bpm = options.bpm ?? 120
    }


    get audioSystem () {
        return this.#audioSystem
    }


    get playing () {
        return this.#playing
    }


    get bpm () {
        return this.#bpm
    }


    set bpm (value) {
        this.#bpm = Math.max(1, Math.min(999, value))
        for (const pattern of this.#patterns.values()) {
            pattern.bpm = this.#bpm
        }
    }


    get patterns () {
        return Array.from(this.#patterns.values())
    }


    get patternCount () {
        return this.#patterns.size
    }


    onInstall (host) {
        this.delegateTo(host, [
            'addPattern',
            'removePattern',
            'getPattern',
            'hasPattern',
            'playPatterns',
            'stopPatterns',
            'setBpm'
        ])
    }


    setBpm (value) {
        this.bpm = value
        return this
    }


    addPattern (name, patternOrString, options = {}) {
        let pattern

        if (patternOrString instanceof Pattern) {
            pattern = patternOrString
        } else {
            pattern = new Pattern({
                pattern: patternOrString,
                bpm: this.#bpm,
                ...options
            })
        }

        pattern.$id = name

        if (options.sounds && this.#audioSystem) {
            this.#bindPatternToSounds(pattern, options.sounds)
        }

        if (options.onStep) {
            pattern.onStep(options.onStep)
        }

        this.#patterns.set(name, pattern)

        if (this.#playing) {
            pattern.play()
        }

        this.emit('pattern:added', name, pattern)
        return pattern
    }


    #bindPatternToSounds (pattern, sounds) {
        pattern.onStep((step, index) => {
            const soundId = sounds[step]

            if (soundId && this.#audioSystem.hasBuffer(soundId)) {
                this.#audioSystem.play(soundId)
            } else if (this.#audioSystem.hasBuffer(step)) {
                this.#audioSystem.play(step)
            } else {
                this.#playOscillatorForStep(step, index)
            }
        })
    }


    #playOscillatorForStep (step) {
        const noteFrequencies = {
            C: 261.63,
            D: 293.66,
            E: 329.63,
            F: 349.23,
            G: 392.00,
            A: 440.00,
            B: 493.88,
            c: 523.25,
            d: 587.33,
            e: 659.25,
            f: 698.46,
            g: 783.99,
            a: 880.00,
            b: 987.77
        }

        const freq = noteFrequencies[step]

        if (freq && this.#audioSystem) {
            this.#audioSystem.playOscillator({
                frequency: freq,
                duration: 0.1,
                volume: 0.3,
                type: 'triangle'
            })
        }
    }


    removePattern (name) {
        const pattern = this.#patterns.get(name)

        if (!pattern) {
            return false
        }

        pattern.stop()
        this.#patterns.delete(name)
        this.emit('pattern:removed', name)
        return true
    }


    getPattern (name) {
        return this.#patterns.get(name) || null
    }


    hasPattern (name) {
        return this.#patterns.has(name)
    }


    playPatterns () {
        if (this.#playing) {
            return this
        }

        this.#playing = true

        for (const pattern of this.#patterns.values()) {
            pattern.play()
        }

        this.emit('play')
        return this
    }


    stopPatterns () {
        if (!this.#playing) {
            return this
        }

        this.#playing = false

        for (const pattern of this.#patterns.values()) {
            pattern.stop()
        }

        this.emit('stop')
        return this
    }


    resetAll () {
        for (const pattern of this.#patterns.values()) {
            pattern.reset()
        }

        this.emit('reset')
        return this
    }


    update (delta) {
        if (!this.#playing) {
            return
        }

        for (const pattern of this.#patterns.values()) {
            pattern.update(delta)
        }
    }


    clear () {
        this.stopPatterns()

        for (const name of this.#patterns.keys()) {
            this.removePattern(name)
        }

        return this
    }


    onDispose () {
        this.clear()
    }

}
