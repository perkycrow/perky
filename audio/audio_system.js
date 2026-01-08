import PerkyModule from '../core/perky_module.js'
import AudioContext from './audio_context.js'
import AudioChannel from './audio_channel.js'
import AudioSource from './audio_source.js'
import {uniqueId} from '../core/utils.js'
import {onAudioUnlock} from './audio_unlock.js'


export default class AudioSystem extends PerkyModule {

    static $category = 'audioSystem'

    #audioContext = null
    #buffers = new Map()
    #pendingAudio = new Map()
    #unlocked = false

    constructor (options = {}) {
        super(options)

        this.#audioContext = new AudioContext()

        const defaultChannels = options.channels ?? ['music', 'sfx', 'ambiance']

        for (const channelName of defaultChannels) {
            this.createChannel(channelName)
        }
    }


    get audioContext () {
        return this.#audioContext
    }


    get unlocked () {
        return this.#unlocked
    }


    get currentTime () {
        return this.#audioContext.currentTime
    }


    get masterVolume () {
        return this.#audioContext.getMasterVolume()
    }


    set masterVolume (value) {
        this.#audioContext.setMasterVolume(value)
    }


    onInstall (host) {
        this.delegateTo(host, [
            'play',
            'playAt',
            'playOscillator',
            'playOscillatorAt',
            'stop',
            'stopChannel',
            'stopAll',
            'setVolume',
            'getVolume',
            'setChannelVolume',
            'getChannelVolume',
            'muteChannel',
            'unmuteChannel',
            'getChannel',
            'hasChannel',
            'unlock',
            'setListenerPosition',
            'getListenerPosition'
        ])

        this.delegateEventsTo(host, [
            'audio:play',
            'audio:stop',
            'audio:unlocked'
        ], 'audio')

        if (host.sourceManager) {
            this.listenTo(host.sourceManager, 'loader:progress', (_progress, {asset, source}) => {
                if (asset.type === 'audio' && source?.type === 'deferred_audio') {
                    this.#pendingAudio.set(asset.id, source.url)
                }
            })
        }
    }


    onStart () {
        onAudioUnlock(() => this.unlock())
    }


    onStop () {
        if (this.#unlocked) {
            this.#audioContext.suspend()
        }
    }


    onDispose () {
        this.stopAll()
        this.#buffers.clear()
        this.#audioContext.dispose()
    }


    async unlock () {
        if (this.#unlocked) {
            return true
        }

        try {
            await this.#audioContext.resume()
            this.#unlocked = true
            await this.#loadPendingAudio()
            this.emit('audio:unlocked')
            return true
        } catch {
            return false
        }
    }


    async #loadPendingAudio () {
        const promises = []

        for (const [id, url] of this.#pendingAudio) {
            promises.push(this.loadBuffer(id, url))
        }

        this.#pendingAudio.clear()
        await Promise.all(promises)
    }


    createChannel (name, options = {}) {
        return this.create(AudioChannel, {
            $id: name,
            $bind: name,
            audioContext: this.#audioContext,
            ...options
        })
    }


    getChannel (name) {
        return this.getChild(name)
    }


    hasChannel (name) {
        return this.hasChild(name)
    }


    listChannels () {
        return this.listNamesFor('audioChannel')
    }


    registerBuffer (id, buffer) {
        this.#buffers.set(id, buffer)
        this.emit('buffer:registered', id, buffer)
    }


    async registerArrayBuffer (id, arrayBuffer) {
        try {
            const audioBuffer = await this.#audioContext.decodeAudioData(arrayBuffer)
            this.registerBuffer(id, audioBuffer)
            return audioBuffer
        } catch (e) {
            this.emit('buffer:error', id, e)
            return null
        }
    }


    getBuffer (id) {
        return this.#buffers.get(id) || null
    }


    hasBuffer (id) {
        return this.#buffers.has(id)
    }


    async loadBuffer (id, url) {
        try {
            const response = await fetch(url)
            const arrayBuffer = await response.arrayBuffer()
            return this.registerArrayBuffer(id, arrayBuffer)
        } catch (e) {
            this.emit('buffer:error', id, e)
            return null
        }
    }


    play (bufferId, options = {}) {
        if (!this.#unlocked) {
            return null
        }

        const buffer = this.#buffers.get(bufferId)

        if (!buffer) {
            return null
        }

        const channelName = options.channel ?? 'sfx'
        const channel = this.getChannel(channelName)

        const sourceId = options.$id ?? uniqueId(this.childrenRegistry, bufferId)

        const source = new AudioSource({
            $id: sourceId,
            audioContext: this.#audioContext,
            channel,
            loop: options.loop ?? false,
            volume: options.volume ?? 1,
            playbackRate: options.playbackRate ?? 1
        })

        source.playBuffer(buffer, options.offset ?? 0)

        this.emit('audio:play', sourceId, bufferId, options)

        return source
    }


    playAt (bufferId, x, y, options = {}) {
        return this.play(bufferId, {
            ...options,
            spatial: true,
            x,
            y
        })
    }


    playOscillator (options = {}) {
        if (!this.#unlocked) {
            return null
        }

        const channel = this.getChannel(options.channel ?? 'sfx')
        const sourceId = options.$id ?? uniqueId(this.childrenRegistry, 'oscillator')

        const source = new AudioSource({
            ...options,
            $id: sourceId,
            audioContext: this.#audioContext,
            channel
        })

        source.playOscillator(options.type, options.frequency, options.duration)
        this.emit('audio:play', sourceId, 'oscillator', options)

        return source
    }


    playOscillatorAt (x, y, options = {}) {
        return this.playOscillator({
            ...options,
            spatial: true,
            x,
            y
        })
    }


    stop (sourceId) {
        for (const channelName of this.listChannels()) {
            const channel = this.getChannel(channelName)
            const source = channel?.getSource(sourceId)
            if (source) {
                source.stop()
                this.emit('audio:stop', sourceId)
                return true
            }
        }
        return false
    }


    stopChannel (channelName) {
        const channel = this.getChannel(channelName)
        if (channel) {
            channel.stopAll()
            return true
        }
        return false
    }


    stopAll () {
        for (const channelName of this.listChannels()) {
            this.stopChannel(channelName)
        }
    }


    setVolume (value) {
        this.masterVolume = value
        this.emit('volume:changed', value)
        return this
    }


    getVolume () {
        return this.masterVolume
    }


    setChannelVolume (channelName, value) {
        const channel = this.getChannel(channelName)
        if (channel) {
            channel.setVolume(value)
        }
        return this
    }


    getChannelVolume (channelName) {
        const channel = this.getChannel(channelName)
        return channel ? channel.getVolume() : 0
    }


    muteChannel (channelName) {
        const channel = this.getChannel(channelName)
        if (channel) {
            channel.mute()
        }
        return this
    }


    unmuteChannel (channelName) {
        const channel = this.getChannel(channelName)
        if (channel) {
            channel.unmute()
        }
        return this
    }


    setListenerPosition (x, y) {
        this.#audioContext.setListenerPosition(x, y, 0)
        return this
    }


    getListenerPosition () {
        const pos = this.#audioContext.getListenerPosition()
        return {x: pos.x, y: pos.y}
    }

}
