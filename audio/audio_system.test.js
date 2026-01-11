import AudioSystem from './audio_system.js'
import AudioChannel from './audio_channel.js'
import {vi, beforeEach, afterEach} from 'vitest'
import {createMockAudioContextWithSpies, setupGlobalAudioContext, setupGlobalFetch} from './test_helpers.js'

// Mock audio_unlock module
vi.mock('./audio_unlock.js', () => ({
    onAudioUnlock: vi.fn(),
    isAudioUnlocked: vi.fn(() => false)
}))


describe(AudioSystem, () => {

    let system
    let mockContext
    let mockOnAudioUnlock
    let cleanupAudioContext
    let cleanupFetch

    beforeEach(async () => {
        // Get the mocked onAudioUnlock
        const audioUnlockModule = await import('./audio_unlock.js')
        mockOnAudioUnlock = audioUnlockModule.onAudioUnlock
        mockOnAudioUnlock.mockClear()

        mockContext = createMockAudioContextWithSpies()
        cleanupAudioContext = setupGlobalAudioContext(mockContext)
        cleanupFetch = setupGlobalFetch()

        system = new AudioSystem()
    })


    afterEach(() => {
        cleanupAudioContext()
        cleanupFetch()
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


    test('onStart registers audio unlock callback', () => {
        system.onStart()
        expect(mockOnAudioUnlock).toHaveBeenCalledWith(expect.any(Function))
    })


    test('onStop suspends audio context when unlocked', async () => {
        // Mark system as unlocked first
        await system.unlock()
        const suspendSpy = vi.spyOn(system.audioContext, 'suspend')
        system.onStop()
        expect(suspendSpy).toHaveBeenCalled()
    })

    test('onStop does nothing when not unlocked', () => {
        const suspendSpy = vi.spyOn(system.audioContext, 'suspend')
        system.onStop()
        expect(suspendSpy).not.toHaveBeenCalled()
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
            // Set context to running so decodeAudioData doesn't queue
            mockContext.state = 'running'
            const buffer = await system.loadBuffer('test', 'http://example.com/audio.mp3')
            expect(global.fetch).toHaveBeenCalledWith('http://example.com/audio.mp3')
            expect(buffer).toBeDefined()
        })

        test('registers loaded buffer', async () => {
            // Set context to running so decodeAudioData doesn't queue
            mockContext.state = 'running'
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
        beforeEach(async () => {
            // Unlock the system so play() works
            await system.unlock()
        })

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
        beforeEach(async () => {
            // Unlock the system so playOscillator() works
            await system.unlock()
        })

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
        beforeEach(async () => {
            // Unlock the system so play() works
            await system.unlock()
        })

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


    describe('playAt', () => {
        beforeEach(async () => {
            // Unlock the system so playAt() works
            await system.unlock()
        })

        test('returns null for unknown buffer', () => {
            expect(system.playAt('unknown', 10, 20)).toBeNull()
        })

        test('creates audio source', () => {
            system.registerBuffer('test', {})
            const source = system.playAt('test', 100, 200)
            expect(source).not.toBeNull()
        })

        test('calls play with spatial options', () => {
            system.registerBuffer('test', {})
            const playSpy = vi.spyOn(system, 'play')
            system.playAt('test', 150, 250, {volume: 0.5})
            expect(playSpy).toHaveBeenCalledWith('test', expect.objectContaining({
                spatial: true,
                x: 150,
                y: 250,
                volume: 0.5
            }))
        })

        test('emits audio:play event', () => {
            const listener = vi.fn()
            system.on('audio:play', listener)
            system.registerBuffer('test', {})
            system.playAt('test', 10, 20)
            expect(listener).toHaveBeenCalled()
        })
    })


    describe('playOscillatorAt', () => {
        beforeEach(async () => {
            // Unlock the system so playOscillatorAt() works
            await system.unlock()
        })

        test('creates oscillator source with spatial audio enabled', () => {
            const source = system.playOscillatorAt(100, 200)
            expect(source).not.toBeNull()

            // Verify spatial audio is enabled by checking position properties
            const pos = source.getPosition()
            expect(pos.x).toBe(100)
            expect(pos.y).toBe(200)
        })

        test('sets position coordinates', () => {
            const source = system.playOscillatorAt(150, 250)
            const pos = source.getPosition()
            expect(pos.x).toBe(150)
            expect(pos.y).toBe(250)
        })

        test('accepts options', () => {
            const source = system.playOscillatorAt(10, 20, {type: 'square', frequency: 880, volume: 0.3})
            expect(source.volume).toBe(0.3)
        })

        test('emits audio:play event', () => {
            const listener = vi.fn()
            system.on('audio:play', listener)
            system.playOscillatorAt(10, 20)
            expect(listener).toHaveBeenCalled()
        })
    })


    describe('setListenerPosition', () => {
        test('sets listener position on audio context', () => {
            const spy = vi.spyOn(system.audioContext, 'setListenerPosition')
            system.setListenerPosition(50, 75)
            expect(spy).toHaveBeenCalledWith(50, 75, 0)
        })

        test('returns self for chaining', () => {
            expect(system.setListenerPosition(10, 20)).toBe(system)
        })
    })


    describe('getListenerPosition', () => {
        test('calls getListenerPosition on audio context', () => {
            const spy = vi.spyOn(system.audioContext, 'getListenerPosition')
            system.getListenerPosition()
            expect(spy).toHaveBeenCalled()
        })

        test('returns object with x and y properties', () => {
            const pos = system.getListenerPosition()
            expect(pos).toHaveProperty('x')
            expect(pos).toHaveProperty('y')
            expect(pos.z).toBeUndefined()
        })
    })

})
