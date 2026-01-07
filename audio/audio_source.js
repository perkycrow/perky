import PerkyModule from '../core/perky_module.js'


export default class AudioSource extends PerkyModule {

    static $category = 'audioSource'
    static $lifecycle = false

    #audioContext = null
    #channel = null
    #gainNode = null
    #pannerNode = null
    #sourceNode = null
    #playing = false
    #loop = false
    #volume = 1
    #playbackRate = 1
    #startTime = 0
    #pauseTime = 0
    #x = 0
    #y = 0
    #spatial = false
    #refDistance = 1
    #maxDistance = 10
    #rolloffFactor = 1

    constructor (options = {}) {
        super(options)

        this.#audioContext = options.audioContext
        this.#channel = options.channel
        this.#loop = options.loop ?? false
        this.#volume = options.volume ?? 1
        this.#playbackRate = options.playbackRate ?? 1
        this.#spatial = options.spatial ?? false

        this.#initSpatialOptions(options)
    }


    #initSpatialOptions (options) {
        this.#x = options.x ?? 0
        this.#y = options.y ?? 0
        this.#refDistance = options.refDistance ?? 1
        this.#maxDistance = options.maxDistance ?? 10
        this.#rolloffFactor = options.rolloffFactor ?? 1
    }


    get playing () {
        return this.#playing
    }


    get loop () {
        return this.#loop
    }


    set loop (value) {
        this.#loop = Boolean(value)
        if (this.#sourceNode && 'loop' in this.#sourceNode) {
            this.#sourceNode.loop = this.#loop
        }
    }


    get volume () {
        return this.#volume
    }


    set volume (value) {
        this.#volume = Math.max(0, Math.min(1, value))
        this.#updateGain()
    }


    get playbackRate () {
        return this.#playbackRate
    }


    set playbackRate (value) {
        this.#playbackRate = Math.max(0.1, Math.min(10, value))
        if (this.#sourceNode && 'playbackRate' in this.#sourceNode) {
            this.#sourceNode.playbackRate.setValueAtTime(
                this.#playbackRate,
                this.#audioContext.context.currentTime
            )
        }
    }


    get channel () {
        return this.#channel
    }


    get gainNode () {
        return this.#gainNode
    }


    get sourceNode () {
        return this.#sourceNode
    }


    get currentTime () {
        if (!this.#playing) {
            return this.#pauseTime
        }

        return this.#audioContext.currentTime - this.#startTime
    }


    get x () {
        return this.#x
    }


    set x (value) {
        this.#x = value
        this.#updatePannerPosition()
    }


    get y () {
        return this.#y
    }


    set y (value) {
        this.#y = value
        this.#updatePannerPosition()
    }


    get spatial () {
        return this.#spatial
    }


    get refDistance () {
        return this.#refDistance
    }


    get maxDistance () {
        return this.#maxDistance
    }


    get rolloffFactor () {
        return this.#rolloffFactor
    }


    #updatePannerPosition () {
        if (this.#pannerNode && this.#audioContext?.context) {
            const ctx = this.#audioContext.context
            this.#pannerNode.positionX.setValueAtTime(this.#x, ctx.currentTime)
            this.#pannerNode.positionY.setValueAtTime(this.#y, ctx.currentTime)
        }
    }


    #updateGain () {
        if (this.#gainNode && this.#audioContext?.context) {
            this.#gainNode.gain.setValueAtTime(
                this.#volume,
                this.#audioContext.context.currentTime
            )
        }
    }


    #setupNodes () {
        if (!this.#audioContext) {
            return false
        }

        this.#gainNode = this.#audioContext.createGain()
        this.#updateGain()

        let outputNode = this.#gainNode

        if (this.#spatial) {
            this.#pannerNode = this.#audioContext.createPanner()
            this.#configurePanner()
            this.#gainNode.connect(this.#pannerNode)
            outputNode = this.#pannerNode
        }

        if (this.#channel?.gainNode) {
            outputNode.connect(this.#channel.gainNode)
        } else {
            outputNode.connect(this.#audioContext.masterGain)
        }

        return true
    }


    #configurePanner () {
        if (!this.#pannerNode) {
            return
        }

        this.#pannerNode.panningModel = 'HRTF'
        this.#pannerNode.distanceModel = 'linear'
        this.#pannerNode.refDistance = this.#refDistance
        this.#pannerNode.maxDistance = this.#maxDistance
        this.#pannerNode.rolloffFactor = this.#rolloffFactor

        this.#updatePannerPosition()
    }


    #cleanupSourceNode () {
        if (this.#sourceNode) {
            try {
                this.#sourceNode.disconnect()
            } catch {

            }
            this.#sourceNode = null
        }
    }


    playBuffer (buffer, offset = 0) {
        if (!this.#audioContext || !buffer) {
            return false
        }

        this.stop()
        this.#setupNodes()

        this.#sourceNode = this.#audioContext.createBufferSource()
        this.#sourceNode.buffer = buffer
        this.#sourceNode.loop = this.#loop
        this.#sourceNode.playbackRate.setValueAtTime(
            this.#playbackRate,
            this.#audioContext.context.currentTime
        )
        this.#sourceNode.connect(this.#gainNode)

        this.#sourceNode.onended = () => {
            if (this.#playing && !this.#loop) {
                this.#playing = false
                this.emit('ended')
                this.#channel?.unregisterSource(this)
            }
        }

        this.#sourceNode.start(0, offset)
        this.#startTime = this.#audioContext.currentTime - offset
        this.#playing = true

        this.#channel?.registerSource(this)
        this.emit('play')

        return true
    }


    playOscillator (type = 'sine', frequency = 440, duration = null) {
        if (!this.#audioContext) {
            return false
        }

        this.stop()
        this.#setupNodes()

        this.#sourceNode = this.#audioContext.createOscillator()
        this.#sourceNode.type = type
        this.#sourceNode.frequency.setValueAtTime(
            frequency,
            this.#audioContext.context.currentTime
        )
        this.#sourceNode.connect(this.#gainNode)

        this.#sourceNode.onended = () => {
            if (this.#playing) {
                this.#playing = false
                this.emit('ended')
                this.#channel?.unregisterSource(this)
            }
        }

        this.#sourceNode.start()
        this.#startTime = this.#audioContext.currentTime
        this.#playing = true

        if (duration !== null && duration > 0) {
            this.#sourceNode.stop(this.#audioContext.context.currentTime + duration)
        }

        this.#channel?.registerSource(this)
        this.emit('play')

        return true
    }


    stop () {
        if (!this.#playing) {
            return false
        }

        this.#playing = false
        this.#pauseTime = 0

        if (this.#sourceNode) {
            try {
                this.#sourceNode.stop()
            } catch {

            }
        }

        this.#cleanupSourceNode()

        if (this.#pannerNode) {
            this.#pannerNode.disconnect()
            this.#pannerNode = null
        }

        if (this.#gainNode) {
            this.#gainNode.disconnect()
            this.#gainNode = null
        }

        this.#channel?.unregisterSource(this)
        this.emit('stop')

        return true
    }


    setPosition (x, y) {
        this.#x = x
        this.#y = y
        this.#updatePannerPosition()
        return this
    }


    getPosition () {
        return {x: this.#x, y: this.#y}
    }


    setVolume (value) {
        this.volume = value
        return this
    }


    getVolume () {
        return this.#volume
    }


    setLoop (value) {
        this.loop = value
        return this
    }


    setPlaybackRate (value) {
        this.playbackRate = value
        return this
    }


    fadeIn (duration = 1) {
        if (!this.#gainNode || !this.#audioContext?.context) {
            return this
        }

        const ctx = this.#audioContext.context
        this.#gainNode.gain.setValueAtTime(0, ctx.currentTime)
        this.#gainNode.gain.linearRampToValueAtTime(this.#volume, ctx.currentTime + duration)

        return this
    }


    fadeOut (duration = 1, stopAfter = true) {
        if (!this.#gainNode || !this.#audioContext?.context) {
            return this
        }

        const ctx = this.#audioContext.context
        this.#gainNode.gain.setValueAtTime(this.#gainNode.gain.value, ctx.currentTime)
        this.#gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + duration)

        if (stopAfter) {
            setTimeout(() => this.stop(), duration * 1000)
        }

        return this
    }


    onDispose () {
        this.stop()
    }

}
