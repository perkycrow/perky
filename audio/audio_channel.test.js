import AudioChannel from './audio_channel.js'
import {vi} from 'vitest'


describe(AudioChannel, () => {

    let channel
    let mockAudioContext

    beforeEach(() => {
        mockAudioContext = {
            context: {currentTime: 0},
            masterGain: {},
            createGain: vi.fn(() => ({
                connect: vi.fn(),
                disconnect: vi.fn(),
                gain: {value: 1, setValueAtTime: vi.fn()}
            }))
        }

        channel = new AudioChannel({
            audioContext: mockAudioContext,
            volume: 0.8
        })
    })


    describe('constructor', () => {
        test('sets default volume to 1', () => {
            const defaultChannel = new AudioChannel({})
            expect(defaultChannel.volume).toBe(1)
        })

        test('accepts custom volume', () => {
            expect(channel.volume).toBe(0.8)
        })

        test('sets static category', () => {
            expect(AudioChannel.$category).toBe('audioChannel')
        })
    })


    describe('volume', () => {
        test('get returns current volume', () => {
            expect(channel.volume).toBe(0.8)
        })

        test('set updates volume', () => {
            channel.volume = 0.5
            expect(channel.volume).toBe(0.5)
        })

        test('clamps volume to minimum 0', () => {
            channel.volume = -1
            expect(channel.volume).toBe(0)
        })

        test('clamps volume to maximum 1', () => {
            channel.volume = 2
            expect(channel.volume).toBe(1)
        })
    })


    describe('muted', () => {
        test('defaults to false', () => {
            expect(channel.muted).toBe(false)
        })

        test('set updates muted state', () => {
            channel.muted = true
            expect(channel.muted).toBe(true)
        })

        test('converts truthy values to boolean', () => {
            channel.muted = 1
            expect(channel.muted).toBe(true)
            channel.muted = 0
            expect(channel.muted).toBe(false)
        })
    })


    describe('gainNode', () => {
        test('returns null without audio context', () => {
            const noCtxChannel = new AudioChannel({})
            expect(noCtxChannel.gainNode).toBeNull()
        })

        test('creates gain node lazily when accessed with audio context', () => {
            expect(channel.gainNode).not.toBeNull()
            expect(mockAudioContext.createGain).toHaveBeenCalled()
        })
    })


    describe('sources', () => {
        test('returns empty array initially', () => {
            expect(channel.sources).toEqual([])
        })

        test('sourceCount returns 0 initially', () => {
            expect(channel.sourceCount).toBe(0)
        })
    })


    describe('onInstall', () => {
        test('is a no-op as gain node is created lazily', () => {
            // onInstall is empty, gain node is created lazily on first access
            expect(() => channel.onInstall()).not.toThrow()
        })

        test('gain node connects to master gain when accessed', () => {
            const gainNode = channel.gainNode
            expect(gainNode.connect).toHaveBeenCalledWith(mockAudioContext.masterGain)
        })

        test('does nothing without audio context', () => {
            const noCtxChannel = new AudioChannel({})
            expect(() => noCtxChannel.onInstall()).not.toThrow()
            expect(noCtxChannel.gainNode).toBeNull()
        })
    })


    describe('onDispose', () => {
        test('stops all sources', () => {
            const mockSource = {$id: 'test', stop: vi.fn()}
            channel.registerSource(mockSource)
            channel.onDispose()
            expect(mockSource.stop).toHaveBeenCalled()
        })

        test('disconnects gain node if it exists', () => {
            const gainNode = channel.gainNode // Force creation
            channel.onDispose()
            expect(gainNode.disconnect).toHaveBeenCalled()
        })

        test('clears internal gain node reference', () => {
            // Access gainNode to create it
            const gainNode = channel.gainNode
            expect(gainNode).not.toBeNull()
            channel.onDispose()

            // After dispose, the internal #gainNode is set to null
            // Accessing gainNode again would create a new one (lazy)
            // We verify dispose worked by checking disconnect was called
            expect(gainNode.disconnect).toHaveBeenCalled()
        })
    })


    describe('registerSource', () => {
        test('registers source by id', () => {
            const source = {$id: 'test-source'}
            const result = channel.registerSource(source)
            expect(result).toBe(true)
            expect(channel.sourceCount).toBe(1)
        })

        test('returns false for null source', () => {
            expect(channel.registerSource(null)).toBe(false)
        })

        test('returns false for source without id', () => {
            expect(channel.registerSource({})).toBe(false)
        })

        test('emits source:added event', () => {
            const listener = vi.fn()
            channel.on('source:added', listener)
            const source = {$id: 'test'}
            channel.registerSource(source)
            expect(listener).toHaveBeenCalledWith(source)
        })
    })


    describe('unregisterSource', () => {
        test('unregisters existing source', () => {
            const source = {$id: 'test'}
            channel.registerSource(source)
            const result = channel.unregisterSource(source)
            expect(result).toBe(true)
            expect(channel.sourceCount).toBe(0)
        })

        test('returns false for null source', () => {
            expect(channel.unregisterSource(null)).toBe(false)
        })

        test('returns false for non-registered source', () => {
            expect(channel.unregisterSource({$id: 'unknown'})).toBe(false)
        })

        test('emits source:removed event', () => {
            const listener = vi.fn()
            channel.on('source:removed', listener)
            const source = {$id: 'test'}
            channel.registerSource(source)
            channel.unregisterSource(source)
            expect(listener).toHaveBeenCalledWith(source)
        })
    })


    describe('getSource', () => {
        test('returns registered source', () => {
            const source = {$id: 'test'}
            channel.registerSource(source)
            expect(channel.getSource('test')).toBe(source)
        })

        test('returns null for unknown source', () => {
            expect(channel.getSource('unknown')).toBeNull()
        })
    })


    describe('hasSource', () => {
        test('returns true for registered source', () => {
            channel.registerSource({$id: 'test'})
            expect(channel.hasSource('test')).toBe(true)
        })

        test('returns false for unknown source', () => {
            expect(channel.hasSource('unknown')).toBe(false)
        })
    })


    describe('stopAll', () => {
        test('stops all registered sources', () => {
            const source1 = {$id: 's1', stop: vi.fn()}
            const source2 = {$id: 's2', stop: vi.fn()}
            channel.registerSource(source1)
            channel.registerSource(source2)
            channel.stopAll()
            expect(source1.stop).toHaveBeenCalled()
            expect(source2.stop).toHaveBeenCalled()
        })

        test('clears sources map', () => {
            channel.registerSource({$id: 'test', stop: vi.fn()})
            channel.stopAll()
            expect(channel.sourceCount).toBe(0)
        })

        test('handles sources without stop method', () => {
            channel.registerSource({$id: 'test'})
            expect(() => channel.stopAll()).not.toThrow()
        })
    })


    describe('setVolume', () => {
        test('sets volume', () => {
            channel.setVolume(0.5)
            expect(channel.volume).toBe(0.5)
        })

        test('emits volume:changed event', () => {
            const listener = vi.fn()
            channel.on('volume:changed', listener)
            channel.setVolume(0.5)
            expect(listener).toHaveBeenCalledWith(0.5)
        })

        test('returns self for chaining', () => {
            expect(channel.setVolume(0.5)).toBe(channel)
        })
    })


    test('getVolume returns current volume', () => {
        channel.volume = 0.7
        expect(channel.getVolume()).toBe(0.7)
    })


    describe('mute', () => {
        test('sets muted to true', () => {
            channel.mute()
            expect(channel.muted).toBe(true)
        })

        test('emits muted event', () => {
            const listener = vi.fn()
            channel.on('muted', listener)
            channel.mute()
            expect(listener).toHaveBeenCalled()
        })

        test('returns self for chaining', () => {
            expect(channel.mute()).toBe(channel)
        })
    })


    describe('unmute', () => {
        test('sets muted to false', () => {
            channel.muted = true
            channel.unmute()
            expect(channel.muted).toBe(false)
        })

        test('emits unmuted event', () => {
            const listener = vi.fn()
            channel.on('unmuted', listener)
            channel.muted = true
            channel.unmute()
            expect(listener).toHaveBeenCalled()
        })

        test('returns self for chaining', () => {
            expect(channel.unmute()).toBe(channel)
        })
    })


    describe('toggleMute', () => {
        test('mutes when unmuted', () => {
            channel.toggleMute()
            expect(channel.muted).toBe(true)
        })

        test('unmutes when muted', () => {
            channel.muted = true
            channel.toggleMute()
            expect(channel.muted).toBe(false)
        })

        test('returns self for chaining', () => {
            expect(channel.toggleMute()).toBe(channel)
        })
    })


    describe('gain updates', () => {
        test('updates gain when volume changes', () => {
            channel.onInstall()
            channel.volume = 0.5
            expect(channel.gainNode.gain.setValueAtTime).toHaveBeenCalledWith(0.5, 0)
        })

        test('sets gain to 0 when muted', () => {
            channel.onInstall()
            channel.muted = true
            expect(channel.gainNode.gain.setValueAtTime).toHaveBeenCalledWith(0, 0)
        })

        test('restores volume when unmuted', () => {
            channel.onInstall()
            channel.muted = true
            channel.muted = false
            expect(channel.gainNode.gain.setValueAtTime).toHaveBeenLastCalledWith(0.8, 0)
        })
    })

})
