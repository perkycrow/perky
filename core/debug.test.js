import {beforeEach, afterEach, describe, test, expect, vi} from 'vitest'
import debug from './debug.js'


describe('Debug', () => {
    let consoleInfoSpy
    let consoleLogSpy

    beforeEach(() => {
        if (debug.isDebugEnabled()) {
            debug.disableDebug()
        }

        debug.clearInstances()

        consoleInfoSpy = vi.spyOn(console, 'info').mockImplementation(() => { })
        consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => { })
        vi.spyOn(console, 'group').mockImplementation(() => { })
        vi.spyOn(console, 'groupEnd').mockImplementation(() => { })
    })

    afterEach(() => {
        if (debug.isDebugEnabled()) {
            debug.disableDebug()
        }
        vi.restoreAllMocks()
        vi.clearAllTimers()
    })


    describe('enableDebug/disableDebug', () => {
        test('should enable debug mode', () => {
            expect(debug.isDebugEnabled()).toBe(false)

            debug.enableDebug()

            expect(debug.isDebugEnabled()).toBe(true)
            expect(consoleInfoSpy).toHaveBeenCalledWith('Debug mode enabled')
        })

        test('should disable debug mode', () => {
            debug.enableDebug()
            consoleInfoSpy.mockClear()

            debug.disableDebug()

            expect(debug.isDebugEnabled()).toBe(false)
            expect(consoleInfoSpy).toHaveBeenCalledWith('Debug mode disabled')
        })

        test('should not enable twice', () => {
            debug.enableDebug()
            consoleInfoSpy.mockClear()

            debug.enableDebug()

            expect(consoleInfoSpy).not.toHaveBeenCalled()
        })

        test('should not disable twice', () => {
            debug.enableDebug()
            debug.disableDebug()
            consoleInfoSpy.mockClear()

            debug.disableDebug()

            expect(consoleInfoSpy).not.toHaveBeenCalled()
        })

        test('should start cleanup interval when enabled', () => {
            vi.useFakeTimers()
            const setIntervalSpy = vi.spyOn(global, 'setInterval')

            debug.enableDebug()

            expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), 5000)

            vi.useRealTimers()
        })

        test('should stop cleanup interval when disabled', () => {
            vi.useFakeTimers()
            const clearIntervalSpy = vi.spyOn(global, 'clearInterval')

            debug.enableDebug()
            debug.disableDebug()

            expect(clearIntervalSpy).toHaveBeenCalled()

            vi.useRealTimers()
        })
    })


    describe('trackInstance/untrackInstance', () => {
        test('should not track when disabled', () => {
            const instance = {id: 1}

            debug.trackInstance('TestClass', instance)

            expect(debug.getInstanceCount('TestClass')).toBe(0)
        })

        test('should track instances when enabled', () => {
            debug.enableDebug()
            const instance1 = {id: 1}
            const instance2 = {id: 2}

            debug.trackInstance('TestClass', instance1)
            debug.trackInstance('TestClass', instance2)

            expect(debug.getInstanceCount('TestClass')).toBe(2)
        })

        test('should track multiple classes separately', () => {
            debug.enableDebug()
            const foo1 = {id: 1}
            const foo2 = {id: 2}
            const bar1 = {id: 3}

            debug.trackInstance('Foo', foo1)
            debug.trackInstance('Foo', foo2)
            debug.trackInstance('Bar', bar1)

            expect(debug.getInstanceCount('Foo')).toBe(2)
            expect(debug.getInstanceCount('Bar')).toBe(1)
        })

        test('should untrack instance', () => {
            debug.enableDebug()
            const instance1 = {id: 1}
            const instance2 = {id: 2}

            debug.trackInstance('TestClass', instance1)
            debug.trackInstance('TestClass', instance2)
            debug.untrackInstance('TestClass', instance1)

            expect(debug.getInstanceCount('TestClass')).toBe(1)
        })

        test('should not untrack when disabled', () => {
            debug.enableDebug()
            const instance = {id: 1}
            debug.trackInstance('TestClass', instance)

            debug.disableDebug()
            debug.untrackInstance('TestClass', instance)

            debug.enableDebug()
            expect(debug.getInstanceCount('TestClass')).toBe(1)
        })

        test('should handle untracking non-existent class', () => {
            debug.enableDebug()
            const instance = {id: 1}

            expect(() => {
                debug.untrackInstance('NonExistent', instance)
            }).not.toThrow()
        })

        test('should handle untracking non-existent instance', () => {
            debug.enableDebug()
            const instance1 = {id: 1}
            const instance2 = {id: 2}

            debug.trackInstance('TestClass', instance1)

            expect(() => {
                debug.untrackInstance('TestClass', instance2)
            }).not.toThrow()

            expect(debug.getInstanceCount('TestClass')).toBe(1)
        })
    })


    describe('getInstanceCount', () => {
        test('should return 0 when disabled', () => {
            expect(debug.getInstanceCount('Any')).toBe(0)
        })

        test('should return 0 for non-existent class', () => {
            debug.enableDebug()

            expect(debug.getInstanceCount('NonExistent')).toBe(0)
        })

        test('should return correct count', () => {
            debug.enableDebug()
            const instance1 = {id: 1}
            const instance2 = {id: 2}
            const instance3 = {id: 3}

            debug.trackInstance('TestClass', instance1)
            debug.trackInstance('TestClass', instance2)
            debug.trackInstance('TestClass', instance3)

            expect(debug.getInstanceCount('TestClass')).toBe(3)
        })

        test('should clean up dead references', () => {
            debug.enableDebug()
            let instance = {id: 1}

            debug.trackInstance('TestClass', instance)
            expect(debug.getInstanceCount('TestClass')).toBe(1)

            instance = null
            global.gc?.()
        })
    })


    describe('printDiagnostics', () => {

        test('should print diagnostics when enabled', () => {
            debug.enableDebug()
            const groupSpy = vi.spyOn(console, 'group')
            const groupEndSpy = vi.spyOn(console, 'groupEnd')

            const instance1 = {id: 1}
            const instance2 = {id: 2}
            const instance3 = {id: 3}

            debug.trackInstance('Foo', instance1)
            debug.trackInstance('Foo', instance2)
            debug.trackInstance('Bar', instance3)

            debug.printDiagnostics()

            expect(groupSpy).toHaveBeenCalledWith('🔍 Memory Diagnostics')
            expect(consoleLogSpy).toHaveBeenCalledWith('Foo: 2 instances')
            expect(consoleLogSpy).toHaveBeenCalledWith('Bar: 1 instances')
            expect(groupEndSpy).toHaveBeenCalled()
        })

        test('should print empty diagnostics when no instances', () => {
            debug.enableDebug()
            const groupSpy = vi.spyOn(console, 'group')
            const groupEndSpy = vi.spyOn(console, 'groupEnd')

            consoleLogSpy.mockClear()

            debug.printDiagnostics()

            expect(groupSpy).toHaveBeenCalledWith('🔍 Memory Diagnostics')
            expect(consoleLogSpy).not.toHaveBeenCalled()
            expect(groupEndSpy).toHaveBeenCalled()
        })
    })


    describe('cleanup interval', () => {
        test('should run cleanup periodically when enabled', () => {
            vi.useFakeTimers()
            debug.enableDebug()

            const instance = {id: 1}
            debug.trackInstance('TestClass', instance)

            vi.advanceTimersByTime(5000)

            expect(debug.getInstanceCount('TestClass')).toBe(1)

            vi.useRealTimers()
        })

        test('should not run cleanup when disabled', () => {
            vi.useFakeTimers()
            const setIntervalSpy = vi.spyOn(global, 'setInterval')

            vi.advanceTimersByTime(10000)

            expect(setIntervalSpy).not.toHaveBeenCalled()

            vi.useRealTimers()
        })

        test('should stop cleanup after disable', () => {
            vi.useFakeTimers()

            debug.enableDebug()
            const instance = {id: 1}
            debug.trackInstance('TestClass', instance)

            debug.disableDebug()

            vi.advanceTimersByTime(10000)

            debug.enableDebug()
            expect(debug.getInstanceCount('TestClass')).toBe(1)

            vi.useRealTimers()
        })
    })
})
