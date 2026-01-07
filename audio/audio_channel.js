import PerkyModule from '../core/perky_module.js'


export default class AudioChannel extends PerkyModule {

    static $category = 'audioChannel'

    #audioContext = null
    #gainNode = null
    #volume = 1
    #muted = false
    #sources = new Map()

    constructor (options = {}) {
        super(options)

        this.#audioContext = options.audioContext
        this.#volume = options.volume ?? 1
    }


    get volume () {
        return this.#volume
    }


    set volume (value) {
        this.#volume = Math.max(0, Math.min(1, value))
        this.#updateGain()
    }


    get muted () {
        return this.#muted
    }


    set muted (value) {
        this.#muted = Boolean(value)
        this.#updateGain()
    }


    get gainNode () {
        return this.#gainNode
    }


    get sources () {
        return Array.from(this.#sources.values())
    }


    get sourceCount () {
        return this.#sources.size
    }


    onInstall (host) {
        const ctx = this.#audioContext

        if (ctx) {
            this.#gainNode = ctx.createGain()
            this.#gainNode.connect(ctx.masterGain)
            this.#updateGain()
        }
    }


    onDispose () {
        this.stopAll()

        if (this.#gainNode) {
            this.#gainNode.disconnect()
            this.#gainNode = null
        }
    }


    #updateGain () {
        if (this.#gainNode && this.#audioContext?.context) {
            const effectiveVolume = this.#muted ? 0 : this.#volume
            this.#gainNode.gain.setValueAtTime(
                effectiveVolume,
                this.#audioContext.context.currentTime
            )
        }
    }


    registerSource (source) {
        if (!source || !source.$id) {
            return false
        }

        this.#sources.set(source.$id, source)
        this.emit('source:added', source)

        return true
    }


    unregisterSource (source) {
        if (!source || !this.#sources.has(source.$id)) {
            return false
        }

        this.#sources.delete(source.$id)
        this.emit('source:removed', source)

        return true
    }


    getSource (id) {
        return this.#sources.get(id) || null
    }


    hasSource (id) {
        return this.#sources.has(id)
    }


    stopAll () {
        for (const source of this.#sources.values()) {
            if (source.stop) {
                source.stop()
            }
        }

        this.#sources.clear()
    }


    setVolume (value) {
        this.volume = value
        this.emit('volume:changed', this.#volume)
        return this
    }


    getVolume () {
        return this.#volume
    }


    mute () {
        this.muted = true
        this.emit('muted')
        return this
    }


    unmute () {
        this.muted = false
        this.emit('unmuted')
        return this
    }


    toggleMute () {
        if (this.#muted) {
            this.unmute()
        } else {
            this.mute()
        }
        return this
    }

}
