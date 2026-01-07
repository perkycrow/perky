
export default class AudioContext {

    #context = null
    #masterGain = null
    #suspended = true

    get context () {
        return this.#context
    }


    get masterGain () {
        return this.#masterGain
    }


    get currentTime () {
        return this.#context?.currentTime ?? 0
    }


    get suspended () {
        return this.#suspended
    }


    get sampleRate () {
        return this.#context?.sampleRate ?? 44100
    }


    init () {
        if (this.#context) {
            return this.#context
        }

        const AudioContextClass = window.AudioContext || window.webkitAudioContext

        if (!AudioContextClass) {
            throw new Error('Web Audio API is not supported in this browser')
        }

        this.#context = new AudioContextClass()
        this.#masterGain = this.#context.createGain()
        this.#masterGain.connect(this.#context.destination)
        this.#suspended = this.#context.state === 'suspended'

        return this.#context
    }


    async resume () {
        if (!this.#context) {
            this.init()
        }

        if (this.#context.state === 'suspended') {
            await this.#context.resume()
            this.#suspended = false
        }

        return this
    }


    suspend () {
        if (this.#context && this.#context.state === 'running') {
            this.#context.suspend()
            this.#suspended = true
        }

        return this
    }


    setMasterVolume (value) {
        if (this.#masterGain) {
            this.#masterGain.gain.setValueAtTime(
                Math.max(0, Math.min(1, value)),
                this.#context.currentTime
            )
        }

        return this
    }


    getMasterVolume () {
        return this.#masterGain?.gain.value ?? 1
    }


    createGain () {
        this.init()
        return this.#context.createGain()
    }


    createOscillator () {
        this.init()
        return this.#context.createOscillator()
    }


    createBufferSource () {
        this.init()
        return this.#context.createBufferSource()
    }


    createPanner () {
        this.init()
        return this.#context.createPanner()
    }


    createStereoPanner () {
        this.init()
        return this.#context.createStereoPanner()
    }


    async decodeAudioData (arrayBuffer) {
        this.init()
        return this.#context.decodeAudioData(arrayBuffer)
    }


    dispose () {
        if (this.#context) {
            this.#context.close()
            this.#context = null
            this.#masterGain = null
        }
    }

}
