import AudioContext from './audio_context.js'
import {vi} from 'vitest'


describe(AudioContext, () => {

    let audioContext
    let mockNativeContext

    beforeEach(() => {
        mockNativeContext = {
            state: 'suspended',
            currentTime: 0,
            sampleRate: 48000,
            destination: {},
            createGain: vi.fn(() => ({
                connect: vi.fn(),
                gain: {value: 1, setValueAtTime: vi.fn()}
            })),
            createOscillator: vi.fn(() => ({})),
            createBufferSource: vi.fn(() => ({})),
            createPanner: vi.fn(() => ({})),
            createStereoPanner: vi.fn(() => ({})),
            decodeAudioData: vi.fn(buffer => Promise.resolve(buffer)),
            resume: vi.fn(() => Promise.resolve()),
            suspend: vi.fn(() => Promise.resolve()),
            close: vi.fn()
        }

        global.window = {
            AudioContext: vi.fn(() => mockNativeContext)
        }

        audioContext = new AudioContext()
    })


    afterEach(() => {
        delete global.window
    })


    describe('constructor', () => {
        test('starts with null context', () => {
            expect(audioContext.context).toBeNull()
        })

        test('starts with null masterGain', () => {
            expect(audioContext.masterGain).toBeNull()
        })

        test('starts suspended', () => {
            expect(audioContext.suspended).toBe(true)
        })
    })


    describe('getters', () => {
        test('currentTime returns 0 when no context', () => {
            expect(audioContext.currentTime).toBe(0)
        })

        test('sampleRate returns 44100 when no context', () => {
            expect(audioContext.sampleRate).toBe(44100)
        })

        test('currentTime returns context time after init', () => {
            mockNativeContext.currentTime = 5.5
            audioContext.init()
            expect(audioContext.currentTime).toBe(5.5)
        })

        test('sampleRate returns context rate after init', () => {
            audioContext.init()
            expect(audioContext.sampleRate).toBe(48000)
        })
    })


    describe('init', () => {
        test('creates native audio context', () => {
            audioContext.init()
            expect(global.window.AudioContext).toHaveBeenCalled()
        })

        test('creates master gain node', () => {
            audioContext.init()
            expect(mockNativeContext.createGain).toHaveBeenCalled()
            expect(audioContext.masterGain).not.toBeNull()
        })

        test('connects master gain to destination', () => {
            audioContext.init()
            const masterGain = audioContext.masterGain
            expect(masterGain.connect).toHaveBeenCalledWith(mockNativeContext.destination)
        })

        test('returns existing context if already initialized', () => {
            const first = audioContext.init()
            const second = audioContext.init()
            expect(first).toBe(second)
            expect(global.window.AudioContext).toHaveBeenCalledTimes(1)
        })

        test('uses webkitAudioContext fallback', () => {
            delete global.window.AudioContext
            global.window.webkitAudioContext = vi.fn(() => mockNativeContext)
            audioContext.init()
            expect(global.window.webkitAudioContext).toHaveBeenCalled()
        })

        test('throws error if no AudioContext available', () => {
            delete global.window.AudioContext
            expect(() => audioContext.init()).toThrow('Web Audio API is not supported')
        })

        test('sets suspended based on context state', () => {
            mockNativeContext.state = 'running'
            audioContext.init()
            expect(audioContext.suspended).toBe(false)
        })
    })


    describe('resume', () => {
        test('initializes context if not yet created', async () => {
            await audioContext.resume()
            expect(audioContext.context).not.toBeNull()
        })

        test('resumes suspended context', async () => {
            await audioContext.resume()
            expect(mockNativeContext.resume).toHaveBeenCalled()
        })

        test('sets suspended to false', async () => {
            await audioContext.resume()
            expect(audioContext.suspended).toBe(false)
        })

        test('does not resume if already running', async () => {
            mockNativeContext.state = 'running'
            audioContext.init()
            await audioContext.resume()
            expect(mockNativeContext.resume).not.toHaveBeenCalled()
        })

        test('returns self for chaining', async () => {
            const result = await audioContext.resume()
            expect(result).toBe(audioContext)
        })
    })


    describe('suspend', () => {
        test('suspends running context', () => {
            audioContext.init()
            mockNativeContext.state = 'running'
            audioContext.suspend()
            expect(mockNativeContext.suspend).toHaveBeenCalled()
        })

        test('sets suspended to true', () => {
            audioContext.init()
            mockNativeContext.state = 'running'
            audioContext.suspend()
            expect(audioContext.suspended).toBe(true)
        })

        test('does nothing if already suspended', () => {
            audioContext.init()
            audioContext.suspend()
            expect(mockNativeContext.suspend).not.toHaveBeenCalled()
        })

        test('does nothing if no context', () => {
            audioContext.suspend()
            expect(mockNativeContext.suspend).not.toHaveBeenCalled()
        })

        test('returns self for chaining', () => {
            const result = audioContext.suspend()
            expect(result).toBe(audioContext)
        })
    })


    describe('setMasterVolume', () => {
        test('sets gain value', () => {
            audioContext.init()
            audioContext.setMasterVolume(0.5)
            expect(audioContext.masterGain.gain.setValueAtTime).toHaveBeenCalledWith(0.5, 0)
        })

        test('clamps volume to 0-1 range', () => {
            audioContext.init()
            audioContext.setMasterVolume(2)
            expect(audioContext.masterGain.gain.setValueAtTime).toHaveBeenCalledWith(1, 0)
            audioContext.setMasterVolume(-1)
            expect(audioContext.masterGain.gain.setValueAtTime).toHaveBeenCalledWith(0, 0)
        })

        test('does nothing without masterGain', () => {
            expect(() => audioContext.setMasterVolume(0.5)).not.toThrow()
        })

        test('returns self for chaining', () => {
            const result = audioContext.setMasterVolume(0.5)
            expect(result).toBe(audioContext)
        })
    })


    describe('getMasterVolume', () => {
        test('returns current gain value', () => {
            audioContext.init()
            expect(audioContext.getMasterVolume()).toBe(1)
        })

        test('returns 1 if no masterGain', () => {
            expect(audioContext.getMasterVolume()).toBe(1)
        })
    })


    describe('factory methods', () => {
        test('createGain initializes and creates gain node', () => {
            const gain = audioContext.createGain()
            expect(mockNativeContext.createGain).toHaveBeenCalled()
            expect(gain).toBeDefined()
        })

        test('createOscillator initializes and creates oscillator', () => {
            audioContext.createOscillator()
            expect(mockNativeContext.createOscillator).toHaveBeenCalled()
        })

        test('createBufferSource initializes and creates buffer source', () => {
            audioContext.createBufferSource()
            expect(mockNativeContext.createBufferSource).toHaveBeenCalled()
        })

        test('createPanner initializes and creates panner', () => {
            audioContext.createPanner()
            expect(mockNativeContext.createPanner).toHaveBeenCalled()
        })

        test('createStereoPanner initializes and creates stereo panner', () => {
            audioContext.createStereoPanner()
            expect(mockNativeContext.createStereoPanner).toHaveBeenCalled()
        })
    })


    describe('decodeAudioData', () => {
        test('decodes array buffer when context is running', async () => {
            audioContext.init()
            mockNativeContext.state = 'running'
            const buffer = new ArrayBuffer(100)
            const result = await audioContext.decodeAudioData(buffer)
            expect(mockNativeContext.decodeAudioData).toHaveBeenCalledWith(buffer)
            expect(result).toBe(buffer)
        })

        test('queues decoding when context is suspended', () => {
            const buffer = new ArrayBuffer(100)

            // Decode is queued when suspended, returns a pending promise
            const decodePromise = audioContext.decodeAudioData(buffer)

            // Decode should not be called yet (still suspended)
            expect(mockNativeContext.decodeAudioData).not.toHaveBeenCalled()

            // The promise exists but won't resolve until context is resumed
            expect(decodePromise).toBeInstanceOf(Promise)
        })

        test('initializes context before decoding', async () => {
            mockNativeContext.state = 'running'
            await audioContext.decodeAudioData(new ArrayBuffer(100))
            expect(audioContext.context).not.toBeNull()
        })
    })


    describe('dispose', () => {
        test('closes context', () => {
            audioContext.init()
            audioContext.dispose()
            expect(mockNativeContext.close).toHaveBeenCalled()
        })

        test('sets context to null', () => {
            audioContext.init()
            audioContext.dispose()
            expect(audioContext.context).toBeNull()
        })

        test('sets masterGain to null', () => {
            audioContext.init()
            audioContext.dispose()
            expect(audioContext.masterGain).toBeNull()
        })

        test('does nothing if no context', () => {
            expect(() => audioContext.dispose()).not.toThrow()
        })
    })

})
