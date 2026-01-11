import AudioSource from './audio_source.js'
import {vi} from 'vitest'
import {createMockPerkyAudioContext, createMockChannel, createMockGainNodeWithSpies, createMockBufferSourceNode, createMockOscillatorNode, createMockPannerNode} from './test_helpers.js'


describe(AudioSource, () => {

    let source
    let mockAudioContext
    let mockChannel
    let mockGainNode
    let mockSourceNode

    beforeEach(() => {
        mockGainNode = createMockGainNodeWithSpies()
        mockSourceNode = createMockBufferSourceNode()

        mockAudioContext = createMockPerkyAudioContext()
        mockAudioContext.createGain = vi.fn(() => mockGainNode)
        mockAudioContext.createBufferSource = vi.fn(() => mockSourceNode)
        mockAudioContext.createOscillator = vi.fn(() => createMockOscillatorNode())

        mockChannel = createMockChannel({audioContext: mockAudioContext})

        source = new AudioSource({
            audioContext: mockAudioContext,
            channel: mockChannel,
            loop: false,
            volume: 0.8,
            playbackRate: 1.5
        })
    })


    describe('constructor', () => {
        test('sets static category', () => {
            expect(AudioSource.$category).toBe('audioSource')
        })

        test('sets static lifecycle to false', () => {
            expect(AudioSource.$lifecycle).toBe(false)
        })

        test('accepts loop option', () => {
            expect(source.loop).toBe(false)
        })

        test('accepts volume option', () => {
            expect(source.volume).toBe(0.8)
        })

        test('accepts playbackRate option', () => {
            expect(source.playbackRate).toBe(1.5)
        })

        test('defaults loop to false', () => {
            const s = new AudioSource({})
            expect(s.loop).toBe(false)
        })

        test('defaults volume to 1', () => {
            const s = new AudioSource({})
            expect(s.volume).toBe(1)
        })

        test('defaults playbackRate to 1', () => {
            const s = new AudioSource({})
            expect(s.playbackRate).toBe(1)
        })
    })


    describe('playing', () => {
        test('returns false initially', () => {
            expect(source.playing).toBe(false)
        })

        test('returns true while playing', () => {
            source.playBuffer({})
            expect(source.playing).toBe(true)
        })
    })


    describe('loop', () => {
        test('get returns current loop state', () => {
            expect(source.loop).toBe(false)
        })

        test('set updates loop state', () => {
            source.loop = true
            expect(source.loop).toBe(true)
        })

        test('updates source node loop property', () => {
            source.playBuffer({})
            source.loop = true
            expect(mockSourceNode.loop).toBe(true)
        })
    })


    describe('volume', () => {
        test('get returns current volume', () => {
            expect(source.volume).toBe(0.8)
        })

        test('set updates volume', () => {
            source.volume = 0.5
            expect(source.volume).toBe(0.5)
        })

        test('clamps to minimum 0', () => {
            source.volume = -1
            expect(source.volume).toBe(0)
        })

        test('clamps to maximum 1', () => {
            source.volume = 2
            expect(source.volume).toBe(1)
        })
    })


    describe('playbackRate', () => {
        test('get returns current rate', () => {
            expect(source.playbackRate).toBe(1.5)
        })

        test('set updates rate', () => {
            source.playbackRate = 2
            expect(source.playbackRate).toBe(2)
        })

        test('clamps to minimum 0.1', () => {
            source.playbackRate = 0
            expect(source.playbackRate).toBe(0.1)
        })

        test('clamps to maximum 10', () => {
            source.playbackRate = 20
            expect(source.playbackRate).toBe(10)
        })

        test('updates source node rate when playing', () => {
            source.playBuffer({})
            source.playbackRate = 2
            expect(mockSourceNode.playbackRate.setValueAtTime).toHaveBeenCalledWith(2, 0)
        })
    })


    test('channel returns the channel', () => {
        expect(source.channel).toBe(mockChannel)
    })


    describe('gainNode', () => {
        test('returns null before playing', () => {
            expect(source.gainNode).toBeNull()
        })

        test('returns gain node while playing', () => {
            source.playBuffer({})
            expect(source.gainNode).toBe(mockGainNode)
        })
    })


    describe('sourceNode', () => {
        test('returns null before playing', () => {
            expect(source.sourceNode).toBeNull()
        })

        test('returns source node while playing', () => {
            source.playBuffer({})
            expect(source.sourceNode).toBe(mockSourceNode)
        })
    })


    describe('currentTime', () => {
        test('returns 0 when not playing', () => {
            expect(source.currentTime).toBe(0)
        })

        test('returns elapsed time when playing', () => {
            source.playBuffer({})
            mockAudioContext.currentTime = 5
            expect(source.currentTime).toBe(5)
        })
    })


    describe('playBuffer', () => {
        test('creates gain node', () => {
            source.playBuffer({})
            expect(mockAudioContext.createGain).toHaveBeenCalled()
        })

        test('creates buffer source', () => {
            source.playBuffer({})
            expect(mockAudioContext.createBufferSource).toHaveBeenCalled()
        })

        test('sets buffer on source node', () => {
            const buffer = {duration: 10}
            source.playBuffer(buffer)
            expect(mockSourceNode.buffer).toBe(buffer)
        })

        test('sets loop on source node', () => {
            source.loop = true
            source.playBuffer({})
            expect(mockSourceNode.loop).toBe(true)
        })

        test('starts playback', () => {
            source.playBuffer({})
            expect(mockSourceNode.start).toHaveBeenCalledWith(0, 0)
        })

        test('starts with offset', () => {
            source.playBuffer({}, 5)
            expect(mockSourceNode.start).toHaveBeenCalledWith(0, 5)
        })

        test('registers with channel', () => {
            source.playBuffer({})
            expect(mockChannel.registerSource).toHaveBeenCalledWith(source)
        })

        test('emits play event', () => {
            const listener = vi.fn()
            source.on('play', listener)
            source.playBuffer({})
            expect(listener).toHaveBeenCalled()
        })

        test('returns true on success', () => {
            expect(source.playBuffer({})).toBe(true)
        })

        test('returns false without audio context', () => {
            const s = new AudioSource({})
            expect(s.playBuffer({})).toBe(false)
        })

        test('returns false without buffer', () => {
            expect(source.playBuffer(null)).toBe(false)
        })

        test('stops previous playback', () => {
            source.playBuffer({})
            source.playBuffer({})
            expect(mockSourceNode.stop).toHaveBeenCalled()
        })

        test('connects to channel gain node', () => {
            source.playBuffer({})
            expect(mockGainNode.connect).toHaveBeenCalledWith(mockChannel.gainNode)
        })

        test('connects to master gain when no channel', () => {
            const s = new AudioSource({audioContext: mockAudioContext})
            s.playBuffer({})
            expect(mockGainNode.connect).toHaveBeenCalledWith(mockAudioContext.masterGain)
        })

        test('handles onended event', () => {
            source.playBuffer({})
            const listener = vi.fn()
            source.on('ended', listener)
            mockSourceNode.onended()
            expect(listener).toHaveBeenCalled()
        })

        test('unregisters from channel on end', () => {
            source.playBuffer({})
            mockSourceNode.onended()
            expect(mockChannel.unregisterSource).toHaveBeenCalledWith(source)
        })

        test('does not emit ended when looping', () => {
            source.loop = true
            source.playBuffer({})
            const listener = vi.fn()
            source.on('ended', listener)
            mockSourceNode.onended()
            expect(listener).not.toHaveBeenCalled()
        })
    })


    describe('playOscillator', () => {
        test('creates gain node', () => {
            source.playOscillator()
            expect(mockAudioContext.createGain).toHaveBeenCalled()
        })

        test('creates oscillator', () => {
            source.playOscillator()
            expect(mockAudioContext.createOscillator).toHaveBeenCalled()
        })

        test('sets oscillator type', () => {
            source.playOscillator('square')
            const oscillator = mockAudioContext.createOscillator.mock.results[0].value
            expect(oscillator.type).toBe('square')
        })

        test('sets oscillator frequency', () => {
            source.playOscillator('sine', 880)
            const oscillator = mockAudioContext.createOscillator.mock.results[0].value
            expect(oscillator.frequency.setValueAtTime).toHaveBeenCalledWith(880, 0)
        })

        test('starts oscillator', () => {
            source.playOscillator()
            const oscillator = mockAudioContext.createOscillator.mock.results[0].value
            expect(oscillator.start).toHaveBeenCalled()
        })

        test('schedules stop with duration', () => {
            source.playOscillator('sine', 440, 2)
            const oscillator = mockAudioContext.createOscillator.mock.results[0].value
            expect(oscillator.stop).toHaveBeenCalledWith(2)
        })

        test('does not schedule stop without duration', () => {
            source.playOscillator('sine', 440, null)
            const oscillator = mockAudioContext.createOscillator.mock.results[0].value
            expect(oscillator.stop).not.toHaveBeenCalled()
        })

        test('registers with channel', () => {
            source.playOscillator()
            expect(mockChannel.registerSource).toHaveBeenCalledWith(source)
        })

        test('emits play event', () => {
            const listener = vi.fn()
            source.on('play', listener)
            source.playOscillator()
            expect(listener).toHaveBeenCalled()
        })

        test('returns true on success', () => {
            expect(source.playOscillator()).toBe(true)
        })

        test('returns false without audio context', () => {
            const s = new AudioSource({})
            expect(s.playOscillator()).toBe(false)
        })

        test('uses default values', () => {
            source.playOscillator()
            const oscillator = mockAudioContext.createOscillator.mock.results[0].value
            expect(oscillator.type).toBe('sine')
            expect(oscillator.frequency.setValueAtTime).toHaveBeenCalledWith(440, 0)
        })
    })


    describe('stop', () => {
        test('returns false when not playing', () => {
            expect(source.stop()).toBe(false)
        })

        test('stops source node', () => {
            source.playBuffer({})
            source.stop()
            expect(mockSourceNode.stop).toHaveBeenCalled()
        })

        test('disconnects source node', () => {
            source.playBuffer({})
            source.stop()
            expect(mockSourceNode.disconnect).toHaveBeenCalled()
        })

        test('disconnects gain node', () => {
            source.playBuffer({})
            source.stop()
            expect(mockGainNode.disconnect).toHaveBeenCalled()
        })

        test('unregisters from channel', () => {
            source.playBuffer({})
            source.stop()
            expect(mockChannel.unregisterSource).toHaveBeenCalledWith(source)
        })

        test('emits stop event', () => {
            source.playBuffer({})
            const listener = vi.fn()
            source.on('stop', listener)
            source.stop()
            expect(listener).toHaveBeenCalled()
        })

        test('returns true on success', () => {
            source.playBuffer({})
            expect(source.stop()).toBe(true)
        })

        test('sets playing to false', () => {
            source.playBuffer({})
            source.stop()
            expect(source.playing).toBe(false)
        })

        test('handles source node stop error', () => {
            source.playBuffer({})
            mockSourceNode.stop.mockImplementation(() => {
                throw new Error('already stopped')
            })
            expect(() => source.stop()).not.toThrow()
        })
    })


    describe('setVolume', () => {
        test('sets volume', () => {
            source.setVolume(0.5)
            expect(source.volume).toBe(0.5)
        })

        test('returns self for chaining', () => {
            expect(source.setVolume(0.5)).toBe(source)
        })
    })


    test('getVolume returns current volume', () => {
        expect(source.getVolume()).toBe(0.8)
    })


    describe('setLoop', () => {
        test('sets loop', () => {
            source.setLoop(true)
            expect(source.loop).toBe(true)
        })

        test('returns self for chaining', () => {
            expect(source.setLoop(true)).toBe(source)
        })
    })


    describe('setPlaybackRate', () => {
        test('sets playback rate', () => {
            source.setPlaybackRate(2)
            expect(source.playbackRate).toBe(2)
        })

        test('returns self for chaining', () => {
            expect(source.setPlaybackRate(2)).toBe(source)
        })
    })


    describe('fadeIn', () => {
        test('returns self without gain node', () => {
            expect(source.fadeIn()).toBe(source)
        })

        test('sets initial gain to 0', () => {
            source.playBuffer({})
            source.fadeIn(1)
            expect(mockGainNode.gain.setValueAtTime).toHaveBeenCalledWith(0, 0)
        })

        test('ramps to target volume', () => {
            source.playBuffer({})
            source.fadeIn(2)
            expect(mockGainNode.gain.linearRampToValueAtTime).toHaveBeenCalledWith(0.8, 2)
        })

        test('uses default duration of 1', () => {
            source.playBuffer({})
            source.fadeIn()
            expect(mockGainNode.gain.linearRampToValueAtTime).toHaveBeenCalledWith(0.8, 1)
        })

        test('returns self for chaining', () => {
            source.playBuffer({})
            expect(source.fadeIn()).toBe(source)
        })
    })


    describe('fadeOut', () => {
        test('returns self without gain node', () => {
            expect(source.fadeOut()).toBe(source)
        })

        test('sets current gain value', () => {
            source.playBuffer({})
            source.fadeOut(1)
            expect(mockGainNode.gain.setValueAtTime).toHaveBeenCalled()
        })

        test('ramps to 0', () => {
            source.playBuffer({})
            source.fadeOut(2)
            expect(mockGainNode.gain.linearRampToValueAtTime).toHaveBeenCalledWith(0, 2)
        })

        test('stops after fade by default', () => {
            vi.useFakeTimers()
            source.playBuffer({})
            source.fadeOut(1)
            vi.advanceTimersByTime(1000)
            expect(source.playing).toBe(false)
            vi.useRealTimers()
        })

        test('does not stop when stopAfter is false', () => {
            vi.useFakeTimers()
            source.playBuffer({})
            source.fadeOut(1, false)
            vi.advanceTimersByTime(1000)
            expect(source.playing).toBe(true)
            vi.useRealTimers()
        })

        test('returns self for chaining', () => {
            source.playBuffer({})
            expect(source.fadeOut()).toBe(source)
        })
    })


    describe('setPosition', () => {
        test('sets x and y coordinates', () => {
            source.setPosition(100, 200)
            expect(source.x).toBe(100)
            expect(source.y).toBe(200)
        })

        test('updates panner position when playing with spatial audio', () => {
            const spatialSource = new AudioSource({
                audioContext: mockAudioContext,
                channel: mockChannel,
                spatial: true
            })
            const mockPanner = createMockPannerNode()
            mockPanner.positionX = {value: 0, setValueAtTime: vi.fn()}
            mockPanner.positionY = {value: 0, setValueAtTime: vi.fn()}
            mockAudioContext.createPanner = vi.fn(() => mockPanner)
            spatialSource.playBuffer({})
            spatialSource.setPosition(50, 75)
            expect(mockPanner.positionX.setValueAtTime).toHaveBeenCalledWith(50, 0)
            expect(mockPanner.positionY.setValueAtTime).toHaveBeenCalledWith(75, 0)
        })

        test('returns self for chaining', () => {
            expect(source.setPosition(10, 20)).toBe(source)
        })
    })


    describe('getPosition', () => {
        test('returns current position', () => {
            source.setPosition(30, 40)
            expect(source.getPosition()).toEqual({x: 30, y: 40})
        })

        test('returns default position when not set', () => {
            expect(source.getPosition()).toEqual({x: 0, y: 0})
        })
    })


    test('onDispose stops playback', () => {
        source.playBuffer({})
        source.onDispose()
        expect(source.playing).toBe(false)
    })

})
