import Sequencer from './sequencer.js'
import Pattern from './pattern.js'
import {vi} from 'vitest'
import {createMockAudioSystem} from '../test_helpers.js'


describe(Sequencer, () => {

    let sequencer
    let mockAudioSystem

    beforeEach(() => {
        mockAudioSystem = createMockAudioSystem()

        sequencer = new Sequencer({
            audioSystem: mockAudioSystem,
            bpm: 140
        })
    })


    describe('constructor', () => {
        test('sets static category', () => {
            expect(Sequencer.$category).toBe('sequencer')
        })

        test('accepts audioSystem option', () => {
            expect(sequencer.audioSystem).toBe(mockAudioSystem)
        })

        test('accepts bpm option', () => {
            expect(sequencer.bpm).toBe(140)
        })

        test('defaults bpm to 120', () => {
            const s = new Sequencer({})
            expect(s.bpm).toBe(120)
        })

        test('starts with no patterns', () => {
            expect(sequencer.patternCount).toBe(0)
        })

        test('starts not playing', () => {
            expect(sequencer.playing).toBe(false)
        })
    })


    describe('audioSystem', () => {
        test('returns the audio system', () => {
            expect(sequencer.audioSystem).toBe(mockAudioSystem)
        })

        test('returns undefined when not set', () => {
            const s = new Sequencer({})
            expect(s.audioSystem).toBeUndefined()
        })
    })


    describe('playing', () => {
        test('returns false initially', () => {
            expect(sequencer.playing).toBe(false)
        })

        test('returns true after playPatterns', () => {
            sequencer.playPatterns()
            expect(sequencer.playing).toBe(true)
        })

        test('returns false after stopPatterns', () => {
            sequencer.playPatterns()
            sequencer.stopPatterns()
            expect(sequencer.playing).toBe(false)
        })
    })


    describe('bpm', () => {
        test('get returns current bpm', () => {
            expect(sequencer.bpm).toBe(140)
        })

        test('set updates bpm', () => {
            sequencer.bpm = 180
            expect(sequencer.bpm).toBe(180)
        })

        test('clamps to minimum 1', () => {
            sequencer.bpm = 0
            expect(sequencer.bpm).toBe(1)
        })

        test('clamps to maximum 999', () => {
            sequencer.bpm = 1500
            expect(sequencer.bpm).toBe(999)
        })

        test('updates all pattern bpms', () => {
            sequencer.addPattern('test', 'a b c')
            sequencer.bpm = 200
            expect(sequencer.getPattern('test').bpm).toBe(200)
        })
    })


    describe('patterns', () => {
        test('returns empty array initially', () => {
            expect(sequencer.patterns).toEqual([])
        })

        test('returns array of patterns', () => {
            sequencer.addPattern('test1', 'a b')
            sequencer.addPattern('test2', 'c d')
            expect(sequencer.patterns).toHaveLength(2)
        })
    })


    describe('patternCount', () => {
        test('returns 0 initially', () => {
            expect(sequencer.patternCount).toBe(0)
        })

        test('returns number of patterns', () => {
            sequencer.addPattern('test1', 'a b')
            sequencer.addPattern('test2', 'c d')
            expect(sequencer.patternCount).toBe(2)
        })
    })


    test('onInstall delegates methods to host', () => {
        const host = {delegate: vi.fn()}
        sequencer.delegateTo = vi.fn()
        sequencer.onInstall(host)
        expect(sequencer.delegateTo).toHaveBeenCalledWith(host, [
            'addPattern',
            'removePattern',
            'getPattern',
            'hasPattern',
            'playPatterns',
            'stopPatterns',
            'setBpm'
        ])
    })


    describe('setBpm', () => {
        test('sets bpm', () => {
            sequencer.setBpm(200)
            expect(sequencer.bpm).toBe(200)
        })

        test('returns self for chaining', () => {
            expect(sequencer.setBpm(120)).toBe(sequencer)
        })
    })


    describe('addPattern', () => {
        test('creates pattern from string', () => {
            const pattern = sequencer.addPattern('test', 'a b c')
            expect(pattern).toBeInstanceOf(Pattern)
            expect(pattern.steps).toEqual(['a', 'b', 'c'])
        })

        test('accepts existing Pattern instance', () => {
            const existing = new Pattern({steps: ['x', 'y']})
            const pattern = sequencer.addPattern('test', existing)
            expect(pattern).toBe(existing)
        })

        test('sets pattern id', () => {
            const pattern = sequencer.addPattern('test', 'a b')
            expect(pattern.$id).toBe('test')
        })

        test('uses sequencer bpm', () => {
            const pattern = sequencer.addPattern('test', 'a b')
            expect(pattern.bpm).toBe(140)
        })

        test('accepts additional options', () => {
            const pattern = sequencer.addPattern('test', 'a b', {loop: false})
            expect(pattern.loop).toBe(false)
        })

        test('binds pattern to sounds when provided', () => {
            mockAudioSystem.hasBuffer.mockReturnValue(true)
            const pattern = sequencer.addPattern('test', 'a b', {
                sounds: {a: 'kick', b: 'snare'}
            })
            pattern.play()
            pattern.update(0.2)
            expect(mockAudioSystem.play).toHaveBeenCalledWith('kick')
        })

        test('registers onStep callback', () => {
            const callback = vi.fn()
            const pattern = sequencer.addPattern('test', 'a b', {onStep: callback})
            pattern.play()
            pattern.update(0.2)
            expect(callback).toHaveBeenCalled()
        })

        test('starts pattern if sequencer is playing', () => {
            sequencer.playPatterns()
            const pattern = sequencer.addPattern('test', 'a b')
            expect(pattern.playing).toBe(true)
        })

        test('emits pattern:added event', () => {
            const listener = vi.fn()
            sequencer.on('pattern:added', listener)
            const pattern = sequencer.addPattern('test', 'a b')
            expect(listener).toHaveBeenCalledWith('test', pattern)
        })

        test('returns the pattern', () => {
            const pattern = sequencer.addPattern('test', 'a b')
            expect(pattern).toBeInstanceOf(Pattern)
        })

        test('plays sound by step name when not in sounds map', () => {
            mockAudioSystem.hasBuffer.mockImplementation(id => id === 'kick')
            sequencer.addPattern('test', 'kick', {sounds: {}})
            sequencer.playPatterns()
            sequencer.update(0.2)
            expect(mockAudioSystem.play).toHaveBeenCalledWith('kick')
        })

        test('plays oscillator for note names', () => {
            mockAudioSystem.hasBuffer.mockReturnValue(false)
            const pattern = sequencer.addPattern('test', 'C', {sounds: {}})
            pattern.play()
            pattern.update(0.2)
            expect(mockAudioSystem.playOscillator).toHaveBeenCalledWith({
                frequency: 261.63,
                duration: 0.1,
                volume: 0.3,
                type: 'triangle'
            })
        })
    })


    describe('removePattern', () => {
        test('removes pattern by name', () => {
            sequencer.addPattern('test', 'a b')
            sequencer.removePattern('test')
            expect(sequencer.hasPattern('test')).toBe(false)
        })

        test('stops pattern before removing', () => {
            const pattern = sequencer.addPattern('test', 'a b')
            pattern.play()
            sequencer.removePattern('test')
            expect(pattern.playing).toBe(false)
        })

        test('emits pattern:removed event', () => {
            sequencer.addPattern('test', 'a b')
            const listener = vi.fn()
            sequencer.on('pattern:removed', listener)
            sequencer.removePattern('test')
            expect(listener).toHaveBeenCalledWith('test')
        })

        test('returns true when pattern exists', () => {
            sequencer.addPattern('test', 'a b')
            expect(sequencer.removePattern('test')).toBe(true)
        })

        test('returns false when pattern does not exist', () => {
            expect(sequencer.removePattern('nonexistent')).toBe(false)
        })
    })


    describe('getPattern', () => {
        test('returns pattern by name', () => {
            const pattern = sequencer.addPattern('test', 'a b')
            expect(sequencer.getPattern('test')).toBe(pattern)
        })

        test('returns null for nonexistent pattern', () => {
            expect(sequencer.getPattern('nonexistent')).toBeNull()
        })
    })


    describe('hasPattern', () => {
        test('returns true when pattern exists', () => {
            sequencer.addPattern('test', 'a b')
            expect(sequencer.hasPattern('test')).toBe(true)
        })

        test('returns false when pattern does not exist', () => {
            expect(sequencer.hasPattern('nonexistent')).toBe(false)
        })
    })


    describe('playPatterns', () => {
        test('sets playing to true', () => {
            sequencer.playPatterns()
            expect(sequencer.playing).toBe(true)
        })

        test('plays all patterns', () => {
            const pattern1 = sequencer.addPattern('test1', 'a b')
            const pattern2 = sequencer.addPattern('test2', 'c d')
            sequencer.playPatterns()
            expect(pattern1.playing).toBe(true)
            expect(pattern2.playing).toBe(true)
        })

        test('emits play event', () => {
            const listener = vi.fn()
            sequencer.on('play', listener)
            sequencer.playPatterns()
            expect(listener).toHaveBeenCalled()
        })

        test('returns self for chaining', () => {
            expect(sequencer.playPatterns()).toBe(sequencer)
        })

        test('does not emit when already playing', () => {
            sequencer.playPatterns()
            const listener = vi.fn()
            sequencer.on('play', listener)
            sequencer.playPatterns()
            expect(listener).not.toHaveBeenCalled()
        })
    })


    describe('stopPatterns', () => {
        test('sets playing to false', () => {
            sequencer.playPatterns()
            sequencer.stopPatterns()
            expect(sequencer.playing).toBe(false)
        })

        test('stops all patterns', () => {
            const pattern1 = sequencer.addPattern('test1', 'a b')
            const pattern2 = sequencer.addPattern('test2', 'c d')
            sequencer.playPatterns()
            sequencer.stopPatterns()
            expect(pattern1.playing).toBe(false)
            expect(pattern2.playing).toBe(false)
        })

        test('emits stop event', () => {
            sequencer.playPatterns()
            const listener = vi.fn()
            sequencer.on('stop', listener)
            sequencer.stopPatterns()
            expect(listener).toHaveBeenCalled()
        })

        test('returns self for chaining', () => {
            expect(sequencer.stopPatterns()).toBe(sequencer)
        })

        test('does not emit when already stopped', () => {
            const listener = vi.fn()
            sequencer.on('stop', listener)
            sequencer.stopPatterns()
            expect(listener).not.toHaveBeenCalled()
        })
    })


    describe('resetAll', () => {
        test('resets all patterns', () => {
            const pattern1 = sequencer.addPattern('test1', 'a b')
            const pattern2 = sequencer.addPattern('test2', 'c d')
            pattern1.play()
            pattern2.play()
            pattern1.update(1)
            pattern2.update(1)
            sequencer.resetAll()
            expect(pattern1.currentStep).toBe(0)
            expect(pattern2.currentStep).toBe(0)
        })

        test('emits reset event', () => {
            const listener = vi.fn()
            sequencer.on('reset', listener)
            sequencer.resetAll()
            expect(listener).toHaveBeenCalled()
        })

        test('returns self for chaining', () => {
            expect(sequencer.resetAll()).toBe(sequencer)
        })
    })


    describe('update', () => {
        test('does nothing when not playing', () => {
            const pattern = sequencer.addPattern('test', 'a b')
            const listener = vi.fn()
            pattern.on('step', listener)
            sequencer.update(1)
            expect(listener).not.toHaveBeenCalled()
        })

        test('updates all patterns when playing', () => {
            const pattern1 = sequencer.addPattern('test1', 'a b')
            const pattern2 = sequencer.addPattern('test2', 'c d')
            const listener1 = vi.fn()
            const listener2 = vi.fn()
            pattern1.on('step', listener1)
            pattern2.on('step', listener2)
            sequencer.playPatterns()
            sequencer.update(0.2)
            expect(listener1).toHaveBeenCalled()
            expect(listener2).toHaveBeenCalled()
        })
    })


    describe('clear', () => {
        test('removes all patterns', () => {
            sequencer.addPattern('test1', 'a b')
            sequencer.addPattern('test2', 'c d')
            sequencer.clear()
            expect(sequencer.patternCount).toBe(0)
        })

        test('stops patterns before clearing', () => {
            sequencer.playPatterns()
            sequencer.clear()
            expect(sequencer.playing).toBe(false)
        })

        test('returns self for chaining', () => {
            expect(sequencer.clear()).toBe(sequencer)
        })
    })


    test('onDispose clears all patterns', () => {
        sequencer.addPattern('test', 'a b')
        sequencer.onDispose()
        expect(sequencer.patternCount).toBe(0)
    })

})
