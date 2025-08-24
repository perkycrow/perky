import ApplicationRunner from './application_runner'
import Application from './application'
import {vi} from 'vitest'


describe(ApplicationRunner, () => {
    let container
    let MockApplication
    let params
    let runner
    let originalReadyState
    

    beforeEach(() => {
        container = document.createElement('div')
        
        MockApplication = vi.fn().mockImplementation(function (p) {
            this.params = p
            this.mountTo = vi.fn()
            this.start = vi.fn()
        })
        
        params = {config: 'test'}

        originalReadyState = document.readyState
        Object.defineProperty(document, 'readyState', {
            writable: true,
            value: 'complete'
        })
        
        runner = new ApplicationRunner(container, MockApplication, params)
    })
    

    afterEach(() => {
        vi.restoreAllMocks()
        Object.defineProperty(document, 'readyState', {
            writable: true,
            value: originalReadyState
        })
    })
    

    test('constructor stores parameters correctly', () => {
        expect(runner.container).toBe(container)
        expect(runner.Application).toBe(MockApplication)
        expect(runner.params).toBe(params)
    })
    

    test('constructor with default params', () => {
        const runnerWithDefaults = new ApplicationRunner(container, MockApplication)
        
        expect(runnerWithDefaults.container).toBe(container)
        expect(runnerWithDefaults.Application).toBe(MockApplication)
        expect(runnerWithDefaults.params).toEqual({})
    })
    

    test('run calls init immediately when document is ready', () => {
        Object.defineProperty(document, 'readyState', {
            writable: true,
            value: 'complete'
        })
        
        const initSpy = vi.spyOn(runner, 'init')
        
        runner.run()
        
        expect(initSpy).toHaveBeenCalledOnce()
    })
    

    test('run calls init immediately when document is interactive', () => {
        Object.defineProperty(document, 'readyState', {
            writable: true,
            value: 'interactive'
        })
        
        const initSpy = vi.spyOn(runner, 'init')
        
        runner.run()
        
        expect(initSpy).toHaveBeenCalledOnce()
    })
    

    test('run waits for DOMContentLoaded when document is loading', () => {
        Object.defineProperty(document, 'readyState', {
            writable: true,
            value: 'loading'
        })
        
        const addEventListenerSpy = vi.spyOn(document, 'addEventListener')
        const initSpy = vi.spyOn(runner, 'init')
        
        runner.run()
        
        expect(initSpy).not.toHaveBeenCalled()
        expect(addEventListenerSpy).toHaveBeenCalledWith('DOMContentLoaded', expect.any(Function))
        
        const eventHandler = addEventListenerSpy.mock.calls[0][1]
        eventHandler()
        
        expect(initSpy).toHaveBeenCalledOnce()
    })
    

    test('init creates application instance with correct parameters', () => {
        runner.init()
        
        expect(MockApplication).toHaveBeenCalledWith(params)
        expect(runner.application).toBeInstanceOf(MockApplication)
    })
    

    test('init mounts application to container', () => {
        runner.init()
        
        expect(runner.application.mountTo).toHaveBeenCalledWith(container)
    })
    

    test('init starts application', () => {
        runner.init()
        
        expect(runner.application.start).toHaveBeenCalledOnce()
    })
    

    test('init sequence is correct', () => {
        const mountToSpy = vi.fn()
        const startSpy = vi.fn()
        
        MockApplication.mockImplementation(function (p) {
            this.params = p
            this.mountTo = mountToSpy
            this.start = startSpy
        })
        
        const newRunner = new ApplicationRunner(container, MockApplication, params)
        newRunner.init()
        
        expect(MockApplication).toHaveBeenCalledBefore(mountToSpy)
        expect(mountToSpy).toHaveBeenCalledBefore(startSpy)
    })
    

    test('static run method creates runner and calls run', () => {
        const runSpy = vi.spyOn(ApplicationRunner.prototype, 'run')
        
        ApplicationRunner.run(container, MockApplication, params)
        
        expect(runSpy).toHaveBeenCalledOnce()
    })
    

    test('static run method with minimal parameters', () => {
        const runSpy = vi.spyOn(ApplicationRunner.prototype, 'run')
        
        ApplicationRunner.run(container, MockApplication)
        
        expect(runSpy).toHaveBeenCalledOnce()
    })
    

    test('integration test with real Application class', () => {
        global.ResizeObserver = vi.fn().mockImplementation(() => ({
            observe: vi.fn(),
            unobserve: vi.fn(),
            disconnect: vi.fn()
        }))
        
        const realRunner = new ApplicationRunner(container, Application, {
            manifest: {metadata: {name: 'Test App'}}
        })
        
        realRunner.init()
        
        expect(realRunner.application).toBeInstanceOf(Application)
        expect(realRunner.application.mounted).toBe(true)
    })
    

    test('run with document state transition', () => {
        Object.defineProperty(document, 'readyState', {
            writable: true,
            value: 'loading'
        })
        
        const initSpy = vi.spyOn(runner, 'init')
        let eventCallback
        
        vi.spyOn(document, 'addEventListener').mockImplementation((event, callback) => {
            if (event === 'DOMContentLoaded') {
                eventCallback = callback
            }
        })
        
        runner.run()
        
        expect(initSpy).not.toHaveBeenCalled()
        
        Object.defineProperty(document, 'readyState', {
            writable: true,
            value: 'complete'
        })
        
        eventCallback()
        
        expect(initSpy).toHaveBeenCalledOnce()
    })
    

    test('error handling in init', () => {
        MockApplication.mockImplementation(() => {
            throw new Error('Application initialization failed')
        })
        
        expect(() => {
            runner.init()
        }).toThrow('Application initialization failed')
    })

})
