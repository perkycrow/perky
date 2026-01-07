import AudioSystem from './audio_system.js'
import AudioChannel from './audio_channel.js'
import {vi} from 'vitest'


describe(AudioSystem, () => {

    let system
    let mockContext

    beforeEach(() => {
        mockContext = {
            state: 'suspended',
            currentTime: 0,
            sampleRate: 48000,
            destination: {},
            createGain: vi.fn(() => ({
                connect: vi.fn(),
                disconnect: vi.fn(),
                gain: {value: 1, setValueAtTime: vi.fn()}
            })),
            createOscillator: vi.fn(() => ({
                connect: vi.fn(),
                disconnect: vi.fn(),
                start: vi.fn(),
                stop: vi.fn(),
                type: 'sine',
                frequency: {setValueAtTime: vi.fn()},
                onended: null
            })),
            createBufferSource: vi.fn(() => ({
                connect: vi.fn(),
                disconnect: vi.fn(),
                start: vi.fn(),
                stop: vi.fn(),
                buffer: null,
                loop: false,
                playbackRate: {setValueAtTime: vi.fn()},
                onended: null
            })),
            decodeAudioData: vi.fn(b => Promise.resolve(b)),
            resume: vi.fn(() => Promise.resolve()),
            suspend: vi.fn(() => Promise.resolve()),
            close: vi.fn()
        }

        global.window = {
            AudioContext: vi.fn(() => mockContext)
        }

        global.fetch = vi.fn(() => Promise.resolve({
            arrayBuffer: () => Promise.resolve(new ArrayBuffer(100))
        }))

        system = new AudioSystem()
    })


    afterEach(() => {
        delete global.window
        delete global.fetch
    })


    describe('constructor', () => {
        test('sets static category', () => {
            expect(AudioSystem.$category).toBe('audioSystem')
        })

        test('creates default channels', () => {
            expect(system.hasChannel('music')).toBe(true)
            expect(system.hasChannel('sfx')).toBe(true)
            expect(system.hasChannel('ambiance')).toBe(true)
        })

        test('accepts custom channels', () => {
            const custom = new AudioSystem({channels: ['voice', 'effects']})
            expect(custom.hasChannel('voice')).toBe(true)
            expect(custom.hasChannel('effects')).toBe(true)
            expect(custom.hasChannel('music')).toBe(false)
        })
    })


    test('audioContext returns the audio context', () => {
        expect(system.audioContext).toBeDefined()
    })


    test('unlocked starts as false', () => {
        expect(system.unlocked).toBe(false)
    })


    test('currentTime returns context current time', () => {
        expect(system.currentTime).toBe(0)
    })


    describe('masterVolume', () => {
        test('get returns master volume', () => {
            expect(system.masterVolume).toBeDefined()
        })

        test('set calls setMasterVolume on context', () => {
            const spy = vi.spyOn(system.audioContext, 'setMasterVolume')
            system.masterVolume = 0.5
            expect(spy).toHaveBeenCalledWith(0.5)
        })
    })


    describe('onInstall', () => {
        test('delegates audio methods to host', () => {
            const host = {emit: vi.fn()}
            system.onInstall(host)
            expect(host.play).toBeDefined()
            expect(host.stop).toBeDefined()
            expect(host.unlock).toBeDefined()
        })

        test('delegates audio events to host', () => {
            const host = {emit: vi.fn(), on: vi.fn()}
            system.onInstall(host)
            system.emit('audio:play', 'test')
            expect(host.emit).toHaveBeenCalled()
        })
    })


    test('onStart calls unlock', async () => {
        const unlockSpy = vi.spyOn(system, 'unlock')
        system.onStart()
        expect(unlockSpy).toHaveBeenCalled()
    })


    test('onStop suspends audio context', () => {
        const suspendSpy = vi.spyOn(system.audioContext, 'suspend')
        system.onStop()
        expect(suspendSpy).toHaveBeenCalled()
    })


    describe('onDispose', () => {
        test('stops all sounds', () => {
            const stopAllSpy = vi.spyOn(system, 'stopAll')
            system.onDispose()
            expect(stopAllSpy).toHaveBeenCalled()
        })

        test('disposes audio context', () => {
            const disposeSpy = vi.spyOn(system.audioContext, 'dispose')
            system.onDispose()
            expect(disposeSpy).toHaveBeenCalled()
        })
    })


    describe('unlock', () => {
        test('resumes audio context', async () => {
            await system.unlock()
            expect(mockContext.resume).toHaveBeenCalled()
        })

        test('sets unlocked to true', async () => {
            await system.unlock()
            expect(system.unlocked).toBe(true)
        })

        test('emits audio:unlocked event', async () => {
            const listener = vi.fn()
            system.on('audio:unlocked', listener)
            await system.unlock()
            expect(listener).toHaveBeenCalled()
        })

        test('returns true on success', async () => {
            expect(await system.unlock()).toBe(true)
        })

        test('returns true if already unlocked', async () => {
            await system.unlock()
            expect(await system.unlock()).toBe(true)
        })

        test('returns false on error', async () => {
            mockContext.resume.mockRejectedValue(new Error('failed'))
            expect(await system.unlock()).toBe(false)
        })
    })


    describe('createChannel', () => {
        test('creates new channel', () => {
            const channel = system.createChannel('custom')
            expect(channel).toBeInstanceOf(AudioChannel)
        })

        test('registers channel by name', () => {
            system.createChannel('custom')
            expect(system.hasChannel('custom')).toBe(true)
        })
    })


    describe('getChannel', () => {
        test('returns existing channel', () => {
            const channel = system.getChannel('sfx')
            expect(channel).toBeInstanceOf(AudioChannel)
        })

        test('returns null for unknown channel', () => {
            expect(system.getChannel('unknown')).toBeNull()
        })
    })


    describe('hasChannel', () => {
        test('returns true for existing channel', () => {
            expect(system.hasChannel('sfx')).toBe(true)
        })

        test('returns false for unknown channel', () => {
            expect(system.hasChannel('unknown')).toBe(false)
        })
    })


    test('listChannels returns channel names', () => {
        const channels = system.listChannels()
        expect(channels).toContain('music')
        expect(channels).toContain('sfx')
        expect(channels).toContain('ambiance')
    })


    describe('registerBuffer', () => {
        test('stores buffer by id', () => {
            const buffer = {duration: 10}
            system.registerBuffer('test', buffer)
            expect(system.getBuffer('test')).toBe(buffer)
        })

        test('emits buffer:registered event', () => {
            const listener = vi.fn()
            system.on('buffer:registered', listener)
            const buffer = {}
            system.registerBuffer('test', buffer)
            expect(listener).toHaveBeenCalledWith('test', buffer)
        })
    })


    describe('getBuffer', () => {
        test('returns registered buffer', () => {
            const buffer = {}
            system.registerBuffer('test', buffer)
            expect(system.getBuffer('test')).toBe(buffer)
        })

        test('returns null for unknown buffer', () => {
            expect(system.getBuffer('unknown')).toBeNull()
        })
    })


    describe('hasBuffer', () => {
        test('returns true for registered buffer', () => {
            system.registerBuffer('test', {})
            expect(system.hasBuffer('test')).toBe(true)
        })

        test('returns false for unknown buffer', () => {
            expect(system.hasBuffer('unknown')).toBe(false)
        })
    })


    describe('loadBuffer', () => {
        test('fetches and decodes audio', async () => {
            const buffer = await system.loadBuffer('test', 'http://example.com/audio.mp3')
            expect(global.fetch).toHaveBeenCalledWith('http://example.com/audio.mp3')
            expect(buffer).toBeDefined()
        })

        test('registers loaded buffer', async () => {
            await system.loadBuffer('test', 'http://example.com/audio.mp3')
            expect(system.hasBuffer('test')).toBe(true)
        })

        test('returns null on error', async () => {
            global.fetch.mockRejectedValue(new Error('network error'))
            const buffer = await system.loadBuffer('test', 'http://example.com/audio.mp3')
            expect(buffer).toBeNull()
        })

        test('emits buffer:error on failure', async () => {
            const listener = vi.fn()
            system.on('buffer:error', listener)
            global.fetch.mockRejectedValue(new Error('network error'))
            await system.loadBuffer('test', 'http://example.com/audio.mp3')
            expect(listener).toHaveBeenCalled()
        })
    })


    describe('play', () => {
        test('returns null for unknown buffer', () => {
            expect(system.play('unknown')).toBeNull()
        })

        test('creates audio source for registered buffer', () => {
            system.registerBuffer('test', {duration: 1})
            const source = system.play('test')
            expect(source).not.toBeNull()
        })

        test('uses sfx channel by default', () => {
            system.registerBuffer('test', {})
            const source = system.play('test')
            expect(source.channel).toBe(system.getChannel('sfx'))
        })

        test('uses specified channel', () => {
            system.registerBuffer('test', {})
            const source = system.play('test', {channel: 'music'})
            expect(source.channel).toBe(system.getChannel('music'))
        })

        test('emits audio:play event', () => {
            const listener = vi.fn()
            system.on('audio:play', listener)
            system.registerBuffer('test', {})
            system.play('test')
            expect(listener).toHaveBeenCalled()
        })

        test('accepts loop option', () => {
            system.registerBuffer('test', {})
            const source = system.play('test', {loop: true})
            expect(source.loop).toBe(true)
        })

        test('accepts volume option', () => {
            system.registerBuffer('test', {})
            const source = system.play('test', {volume: 0.5})
            expect(source.volume).toBe(0.5)
        })

        test('accepts playbackRate option', () => {
            system.registerBuffer('test', {})
            const source = system.play('test', {playbackRate: 2})
            expect(source.playbackRate).toBe(2)
        })
    })


    describe('playOscillator', () => {
        test('creates oscillator source', () => {
            const source = system.playOscillator()
            expect(source).not.toBeNull()
        })

        test('uses sfx channel by default', () => {
            const source = system.playOscillator()
            expect(source.channel).toBe(system.getChannel('sfx'))
        })

        test('accepts type option', () => {
            const source = system.playOscillator({type: 'square'})
            expect(source).not.toBeNull()
        })

        test('emits audio:play event', () => {
            const listener = vi.fn()
            system.on('audio:play', listener)
            system.playOscillator()
            expect(listener).toHaveBeenCalled()
        })
    })


    describe('stop', () => {
        test('returns false for unknown source', () => {
            expect(system.stop('unknown')).toBe(false)
        })

        test('stops playing source', () => {
            system.registerBuffer('test', {})
            const source = system.play('test')
            const result = system.stop(source.$id)
            expect(result).toBe(true)
        })

        test('emits audio:stop event', () => {
            const listener = vi.fn()
            system.on('audio:stop', listener)
            system.registerBuffer('test', {})
            const source = system.play('test')
            system.stop(source.$id)
            expect(listener).toHaveBeenCalled()
        })
    })


    describe('stopChannel', () => {
        test('returns false for unknown channel', () => {
            expect(system.stopChannel('unknown')).toBe(false)
        })

        test('stops all sources in channel', () => {
            const channel = system.getChannel('sfx')
            const stopAllSpy = vi.spyOn(channel, 'stopAll')
            system.stopChannel('sfx')
            expect(stopAllSpy).toHaveBeenCalled()
        })

        test('returns true on success', () => {
            expect(system.stopChannel('sfx')).toBe(true)
        })
    })


    test('stopAll stops all channels', () => {
        const musicChannel = system.getChannel('music')
        const sfxChannel = system.getChannel('sfx')
        const musicSpy = vi.spyOn(musicChannel, 'stopAll')
        const sfxSpy = vi.spyOn(sfxChannel, 'stopAll')
        system.stopAll()
        expect(musicSpy).toHaveBeenCalled()
        expect(sfxSpy).toHaveBeenCalled()
    })


    describe('setVolume', () => {
        test('sets master volume', () => {
            const spy = vi.spyOn(system.audioContext, 'setMasterVolume')
            system.setVolume(0.5)
            expect(spy).toHaveBeenCalledWith(0.5)
        })

        test('emits volume:changed event', () => {
            const listener = vi.fn()
            system.on('volume:changed', listener)
            system.setVolume(0.5)
            expect(listener).toHaveBeenCalledWith(0.5)
        })

        test('returns self for chaining', () => {
            expect(system.setVolume(0.5)).toBe(system)
        })
    })


    test('getVolume returns master volume from context', () => {
        const spy = vi.spyOn(system.audioContext, 'getMasterVolume').mockReturnValue(0.7)
        expect(system.getVolume()).toBe(0.7)
        expect(spy).toHaveBeenCalled()
    })


    describe('setChannelVolume', () => {
        test('sets channel volume', () => {
            system.setChannelVolume('sfx', 0.5)
            expect(system.getChannel('sfx').volume).toBe(0.5)
        })

        test('does nothing for unknown channel', () => {
            expect(() => system.setChannelVolume('unknown', 0.5)).not.toThrow()
        })

        test('returns self for chaining', () => {
            expect(system.setChannelVolume('sfx', 0.5)).toBe(system)
        })
    })


    describe('getChannelVolume', () => {
        test('returns channel volume', () => {
            system.setChannelVolume('sfx', 0.7)
            expect(system.getChannelVolume('sfx')).toBe(0.7)
        })

        test('returns 0 for unknown channel', () => {
            expect(system.getChannelVolume('unknown')).toBe(0)
        })
    })


    describe('muteChannel', () => {
        test('mutes channel', () => {
            system.muteChannel('sfx')
            expect(system.getChannel('sfx').muted).toBe(true)
        })

        test('does nothing for unknown channel', () => {
            expect(() => system.muteChannel('unknown')).not.toThrow()
        })

        test('returns self for chaining', () => {
            expect(system.muteChannel('sfx')).toBe(system)
        })
    })


    describe('unmuteChannel', () => {
        test('unmutes channel', () => {
            system.muteChannel('sfx')
            system.unmuteChannel('sfx')
            expect(system.getChannel('sfx').muted).toBe(false)
        })

        test('does nothing for unknown channel', () => {
            expect(() => system.unmuteChannel('unknown')).not.toThrow()
        })

        test('returns self for chaining', () => {
            expect(system.unmuteChannel('sfx')).toBe(system)
        })
    })

})
