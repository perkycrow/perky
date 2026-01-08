import {vi, beforeEach, afterEach, describe, test, expect} from 'vitest'


describe('audio_unlock', () => {

    let module
    let mockDocument
    let mockWindow
    let documentListeners
    let windowListeners

    beforeEach(async () => {
        // Reset state
        documentListeners = {}
        windowListeners = {}

        // Create mocks
        mockDocument = {
            addEventListener: vi.fn((event, handler, capture) => {
                if (!documentListeners[event]) {
                    documentListeners[event] = []
                }
                documentListeners[event].push({handler, capture})
            }),
            removeEventListener: vi.fn((event, handler) => {
                if (documentListeners[event]) {
                    documentListeners[event] = documentListeners[event].filter(l => l.handler !== handler)
                }
            })
        }

        mockWindow = {
            addEventListener: vi.fn((event, handler) => {
                if (!windowListeners[event]) {
                    windowListeners[event] = []
                }
                windowListeners[event].push({handler})
            }),
            removeEventListener: vi.fn((event, handler) => {
                if (windowListeners[event]) {
                    windowListeners[event] = windowListeners[event].filter(l => l.handler !== handler)
                }
            })
        }

        // Mock globals
        vi.stubGlobal('document', mockDocument)
        vi.stubGlobal('window', mockWindow)

        // Clear module cache and reimport
        vi.resetModules()
        module = await import('./audio_unlock.js')
    })

    afterEach(() => {
        vi.unstubAllGlobals()
    })


    describe('module initialization', () => {
        test('should register event listeners on module load', () => {
            expect(mockDocument.addEventListener).toHaveBeenCalledWith('click', expect.any(Function), true)
            expect(mockDocument.addEventListener).toHaveBeenCalledWith('touchstart', expect.any(Function), true)
            expect(mockDocument.addEventListener).toHaveBeenCalledWith('keydown', expect.any(Function), true)
            expect(mockWindow.addEventListener).toHaveBeenCalledWith('gamepadconnected', expect.any(Function))
        })
    })


    describe('isAudioUnlocked', () => {
        test('should return false initially', () => {
            expect(module.isAudioUnlocked()).toBe(false)
        })

        test('should return true after unlock event', () => {
            const clickListeners = documentListeners.click
            expect(clickListeners).toBeDefined()
            expect(clickListeners.length).toBeGreaterThan(0)

            const handleUnlock = clickListeners[0].handler
            handleUnlock()

            expect(module.isAudioUnlocked()).toBe(true)
        })
    })


    describe('onAudioUnlock', () => {
        test('should queue callback when audio is locked', () => {
            const callback = vi.fn()

            module.onAudioUnlock(callback)

            expect(callback).not.toHaveBeenCalled()
        })

        test('should execute callback immediately when audio is already unlocked', () => {
            const callback = vi.fn()

            // Trigger unlock
            const clickListeners = documentListeners.click
            const handleUnlock = clickListeners[0].handler
            handleUnlock()

            module.onAudioUnlock(callback)

            expect(callback).toHaveBeenCalledTimes(1)
        })

        test('should execute queued callbacks on unlock', () => {
            const callback1 = vi.fn()
            const callback2 = vi.fn()
            const callback3 = vi.fn()

            module.onAudioUnlock(callback1)
            module.onAudioUnlock(callback2)
            module.onAudioUnlock(callback3)

            expect(callback1).not.toHaveBeenCalled()
            expect(callback2).not.toHaveBeenCalled()
            expect(callback3).not.toHaveBeenCalled()

            // Trigger unlock via click
            const clickListeners = documentListeners.click
            const handleUnlock = clickListeners[0].handler
            handleUnlock()

            expect(callback1).toHaveBeenCalledTimes(1)
            expect(callback2).toHaveBeenCalledTimes(1)
            expect(callback3).toHaveBeenCalledTimes(1)
        })

        test('should execute callbacks in the order they were registered', () => {
            const callOrder = []
            const callback1 = vi.fn(() => callOrder.push('callback1'))
            const callback2 = vi.fn(() => callOrder.push('callback2'))
            const callback3 = vi.fn(() => callOrder.push('callback3'))

            module.onAudioUnlock(callback1)
            module.onAudioUnlock(callback2)
            module.onAudioUnlock(callback3)

            // Trigger unlock
            const clickListeners = documentListeners.click
            const handleUnlock = clickListeners[0].handler
            handleUnlock()

            expect(callOrder).toEqual(['callback1', 'callback2', 'callback3'])
        })
    })


    describe('unlock events', () => {
        test('should unlock audio on click event', () => {
            const callback = vi.fn()
            module.onAudioUnlock(callback)

            const clickListeners = documentListeners.click
            const handleUnlock = clickListeners[0].handler
            handleUnlock()

            expect(callback).toHaveBeenCalledTimes(1)
            expect(module.isAudioUnlocked()).toBe(true)
        })

        test('should unlock audio on touchstart event', () => {
            const callback = vi.fn()
            module.onAudioUnlock(callback)

            const touchstartListeners = documentListeners.touchstart
            const handleUnlock = touchstartListeners[0].handler
            handleUnlock()

            expect(callback).toHaveBeenCalledTimes(1)
            expect(module.isAudioUnlocked()).toBe(true)
        })

        test('should unlock audio on keydown event', () => {
            const callback = vi.fn()
            module.onAudioUnlock(callback)

            const keydownListeners = documentListeners.keydown
            const handleUnlock = keydownListeners[0].handler
            handleUnlock()

            expect(callback).toHaveBeenCalledTimes(1)
            expect(module.isAudioUnlocked()).toBe(true)
        })

        test('should unlock audio on gamepadconnected event', () => {
            const callback = vi.fn()
            module.onAudioUnlock(callback)

            const gamepadListeners = windowListeners.gamepadconnected
            const handleUnlock = gamepadListeners[0].handler
            handleUnlock()

            expect(callback).toHaveBeenCalledTimes(1)
            expect(module.isAudioUnlocked()).toBe(true)
        })

        test('should only unlock once even with multiple events', () => {
            const callback = vi.fn()
            module.onAudioUnlock(callback)

            // Trigger multiple unlock events
            const clickListeners = documentListeners.click
            const touchstartListeners = documentListeners.touchstart
            const keydownListeners = documentListeners.keydown

            clickListeners[0].handler()
            touchstartListeners[0].handler()
            keydownListeners[0].handler()

            expect(callback).toHaveBeenCalledTimes(1)
            expect(module.isAudioUnlocked()).toBe(true)
        })
    })


    describe('event cleanup', () => {
        test('should remove all event listeners after unlock', () => {
            // Trigger unlock
            const clickListeners = documentListeners.click
            const handleUnlock = clickListeners[0].handler
            handleUnlock()

            expect(mockDocument.removeEventListener).toHaveBeenCalledWith('click', handleUnlock, true)
            expect(mockDocument.removeEventListener).toHaveBeenCalledWith('touchstart', handleUnlock, true)
            expect(mockDocument.removeEventListener).toHaveBeenCalledWith('keydown', handleUnlock, true)
            expect(mockWindow.removeEventListener).toHaveBeenCalledWith('gamepadconnected', handleUnlock)
        })

        test('should not add callbacks to queue after unlock and cleanup', () => {
            const callback1 = vi.fn()
            const callback2 = vi.fn()

            module.onAudioUnlock(callback1)

            // Trigger unlock
            const clickListeners = documentListeners.click
            const handleUnlock = clickListeners[0].handler
            handleUnlock()

            expect(callback1).toHaveBeenCalledTimes(1)

            // Add callback after unlock
            module.onAudioUnlock(callback2)

            expect(callback2).toHaveBeenCalledTimes(1)
        })
    })


    describe('edge cases', () => {
        test('should handle callback throwing error', () => {
            const errorCallback = vi.fn(() => {
                throw new Error('Callback error')
            })
            const successCallback = vi.fn()

            module.onAudioUnlock(errorCallback)
            module.onAudioUnlock(successCallback)

            const clickListeners = documentListeners.click
            const handleUnlock = clickListeners[0].handler

            expect(() => handleUnlock()).toThrow('Callback error')

            // Due to error, remaining callbacks might not execute
            // This tests the actual behavior
            expect(errorCallback).toHaveBeenCalledTimes(1)
        })

        test('should handle multiple onAudioUnlock calls after unlock', () => {
            // Trigger unlock first
            const clickListeners = documentListeners.click
            const handleUnlock = clickListeners[0].handler
            handleUnlock()

            const callback1 = vi.fn()
            const callback2 = vi.fn()
            const callback3 = vi.fn()

            module.onAudioUnlock(callback1)
            module.onAudioUnlock(callback2)
            module.onAudioUnlock(callback3)

            expect(callback1).toHaveBeenCalledTimes(1)
            expect(callback2).toHaveBeenCalledTimes(1)
            expect(callback3).toHaveBeenCalledTimes(1)
        })
    })

})
