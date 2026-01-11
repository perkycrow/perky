
export default class AudioContext {

    #context = null
    #masterGain = null
    #suspended = true
    #pendingDecodes = []
    #masterVolume = 1

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


    get listener () {
        return this.#context?.listener ?? null
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
        this.#masterGain.gain.setValueAtTime(this.#masterVolume, this.#context.currentTime)
        this.#masterGain.connect(this.#context.destination)
        this.#suspended = this.#context.state === 'suspended'

        if (this.#context.state === 'running') {
            this.#processPendingDecodes()
        }

        return this.#context
    }


    #processPendingDecodes () {
        for (const pending of this.#pendingDecodes) {
            this.#context.decodeAudioData(pending.buffer)
                .then(pending.resolve)
                .catch(pending.reject)
        }
        this.#pendingDecodes = []
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
        this.#masterVolume = Math.max(0, Math.min(1, value))

        if (this.#masterGain) {
            this.#masterGain.gain.setValueAtTime(
                this.#masterVolume,
                this.#context.currentTime
            )
        }

        return this
    }


    getMasterVolume () {
        return this.#masterVolume
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

        if (this.#context.state === 'suspended') {
            return new Promise((resolve, reject) => {
                this.#pendingDecodes.push({buffer: arrayBuffer, resolve, reject})
            })
        }

        return this.#context.decodeAudioData(arrayBuffer)
    }


    setListenerPosition (x, y, z = 0) {
        this.init()
        const listener = this.#context.listener

        if (listener.positionX) {
            listener.positionX.setValueAtTime(x, this.#context.currentTime)
            listener.positionY.setValueAtTime(y, this.#context.currentTime)
            listener.positionZ.setValueAtTime(z, this.#context.currentTime)
        } else if (listener.setPosition) {
            listener.setPosition(x, y, z)
        }

        return this
    }


    getListenerPosition () {
        if (!this.#context?.listener) {
            return {x: 0, y: 0, z: 0}
        }

        const listener = this.#context.listener

        if (listener.positionX) {
            return {
                x: listener.positionX.value,
                y: listener.positionY.value,
                z: listener.positionZ.value
            }
        }

        return {x: 0, y: 0, z: 0}
    }


    dispose () {
        if (this.#context) {
            this.#context.close()
            this.#context = null
            this.#masterGain = null
        }
    }

}
