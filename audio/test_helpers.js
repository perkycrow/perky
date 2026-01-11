import {vi} from 'vitest'


export function createMockGainNode () {
    return {
        connect: () => {},
        disconnect: () => {},
        gain: {
            value: 1,
            setValueAtTime: () => {},
            linearRampToValueAtTime: () => {}
        }
    }
}


export function createMockGainNodeWithSpies () {
    return {
        connect: vi.fn(),
        disconnect: vi.fn(),
        gain: {
            value: 1,
            setValueAtTime: vi.fn(),
            linearRampToValueAtTime: vi.fn()
        }
    }
}


export function createMockOscillatorNode () {
    return {
        connect: vi.fn(),
        disconnect: vi.fn(),
        start: vi.fn(),
        stop: vi.fn(),
        type: 'sine',
        frequency: {
            value: 440,
            setValueAtTime: vi.fn()
        },
        onended: null
    }
}


export function createMockBufferSourceNode () {
    return {
        connect: vi.fn(),
        disconnect: vi.fn(),
        start: vi.fn(),
        stop: vi.fn(),
        buffer: null,
        loop: false,
        playbackRate: {
            value: 1,
            setValueAtTime: vi.fn()
        },
        onended: null
    }
}


export function createMockPannerNode () {
    return {
        connect: vi.fn(),
        disconnect: vi.fn(),
        positionX: {
            value: 0,
            setValueAtTime: vi.fn()
        },
        positionY: {
            value: 0,
            setValueAtTime: vi.fn()
        },
        positionZ: {
            value: 0,
            setValueAtTime: vi.fn()
        },
        panningModel: 'HRTF',
        distanceModel: 'linear',
        refDistance: 1,
        maxDistance: 10,
        rolloffFactor: 1
    }
}


export function createMockStereoPannerNode () {
    return {
        connect: vi.fn(),
        disconnect: vi.fn(),
        pan: {
            value: 0,
            setValueAtTime: vi.fn()
        }
    }
}


export function createMockAudioContext () {
    return {
        state: 'suspended',
        currentTime: 0,
        sampleRate: 48000,
        destination: {},
        createGain: () => createMockGainNode(),
        createOscillator: () => createMockOscillatorNode(),
        createBufferSource: () => createMockBufferSourceNode(),
        createPanner: () => createMockPannerNode(),
        createStereoPanner: () => createMockStereoPannerNode(),
        decodeAudioData: buffer => Promise.resolve(buffer),
        resume: () => Promise.resolve(),
        suspend: () => Promise.resolve(),
        close: () => {}
    }
}


export function createMockAudioContextWithSpies () {
    return {
        state: 'suspended',
        currentTime: 0,
        sampleRate: 48000,
        destination: {},
        listener: {
            positionX: {
                value: 0,
                setValueAtTime: vi.fn()
            },
            positionY: {
                value: 0,
                setValueAtTime: vi.fn()
            },
            positionZ: {
                value: 0,
                setValueAtTime: vi.fn()
            }
        },
        createGain: vi.fn(() => createMockGainNodeWithSpies()),
        createOscillator: vi.fn(() => createMockOscillatorNode()),
        createBufferSource: vi.fn(() => createMockBufferSourceNode()),
        createPanner: vi.fn(() => createMockPannerNode()),
        createStereoPanner: vi.fn(() => createMockStereoPannerNode()),
        decodeAudioData: vi.fn(buffer => Promise.resolve(buffer)),
        resume: vi.fn(() => Promise.resolve()),
        suspend: vi.fn(() => Promise.resolve()),
        close: vi.fn()
    }
}


export function createMockPerkyAudioContext (nativeContext = null) {
    const ctx = nativeContext || createMockAudioContextWithSpies()
    const listenerPosition = {x: 0, y: 0, z: 0}

    const mockContext = {
        context: ctx,
        currentTime: ctx.currentTime,
        sampleRate: ctx.sampleRate,
        masterGain: createMockGainNodeWithSpies(),
        createGain: vi.fn(() => createMockGainNodeWithSpies()),
        createOscillator: vi.fn(() => createMockOscillatorNode()),
        createBufferSource: vi.fn(() => createMockBufferSourceNode()),
        createPanner: vi.fn(() => createMockPannerNode()),
        createStereoPanner: vi.fn(() => createMockStereoPannerNode()),
        decodeAudioData: vi.fn(buffer => Promise.resolve(buffer)),
        resume: vi.fn(() => Promise.resolve()),
        suspend: vi.fn(() => Promise.resolve()),
        close: vi.fn(),
        setMasterVolume: vi.fn(),
        getMasterVolume: vi.fn(() => 1),
        setListenerPosition: vi.fn(function (x, y, z = 0) {
            listenerPosition.x = x
            listenerPosition.y = y
            listenerPosition.z = z

            if (this.context?.listener) {
                this.context.listener.positionX.value = x
                this.context.listener.positionY.value = y
                this.context.listener.positionZ.value = z
            }
            return this
        }),
        getListenerPosition: vi.fn(function () {
            return {x: listenerPosition.x, y: listenerPosition.y, z: listenerPosition.z}
        })
    }

    return mockContext
}


export function createMockChannel (options = {}) {
    const audioContext = options.audioContext || createMockPerkyAudioContext()
    return {
        gainNode: audioContext.masterGain || createMockGainNodeWithSpies(),
        registerSource: vi.fn(),
        unregisterSource: vi.fn(),
        volume: 1,
        muted: false
    }
}


export function createMockAudioSystem () {
    return {
        hasBuffer: vi.fn(() => false),
        play: vi.fn(),
        playOscillator: vi.fn(),
        stop: vi.fn(),
        stopChannel: vi.fn(),
        stopAll: vi.fn(),
        getChannel: vi.fn(),
        setChannelVolume: vi.fn(),
        getChannelVolume: vi.fn(() => 1),
        muteChannel: vi.fn(),
        unmuteChannel: vi.fn()
    }
}


export function setupGlobalAudioContext (mockContext) {
    const original = global.window?.AudioContext
    if (!global.window) {
        global.window = {}
    }
    global.window.AudioContext = vi.fn(() => mockContext)

    return () => {
        if (original) {
            global.window.AudioContext = original
        } else {
            delete global.window.AudioContext
        }
    }
}


export function setupGlobalFetch (buffer = new ArrayBuffer(100)) {
    const original = global.fetch
    global.fetch = vi.fn(() => Promise.resolve({
        arrayBuffer: () => Promise.resolve(buffer)
    }))

    return () => {
        if (original) {
            global.fetch = original
        } else {
            delete global.fetch
        }
    }
}
