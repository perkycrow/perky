import ActiveService from '../src/active_service'
import Notifier from '../src/notifier'
import {vi} from 'vitest'


describe(ActiveService, () => {
    let service
    let engine

    class MockEngine extends Notifier {
        constructor () {
            super()
            this.existingProp = 'hello'
        }
    }

    class TestService extends ActiveService {
        static shortcuts = [
            'methodA',
            {shortcutB: 'internalMethodB'},
            'methodDoesNotExist',
            {shortcutC: 'methodDoesNotExist'},
            'existingProp'
        ]

        // eslint-disable-next-line class-methods-use-this
        install (_engine) {
            _engine.hello = 'world'
        }

        // eslint-disable-next-line class-methods-use-this
        uninstall (_engine) {
            delete _engine.hello
        }

        // eslint-disable-next-line class-methods-use-this
        methodA () {
            return 'A'
        }

        // eslint-disable-next-line class-methods-use-this
        internalMethodB () {
            return 'B'
        }
    }


    beforeEach(() => {
        service = new TestService()
        engine = new MockEngine()

        vi.spyOn(console, 'warn').mockImplementation(() => {})
        vi.spyOn(console, 'error').mockImplementation(() => {})
    })


    afterEach(() => {
        vi.restoreAllMocks()
    })


    test('constructor', () => {
        expect(service).toBeInstanceOf(ActiveService)

        expect(service.shortcuts).toBeInstanceOf(Map)
        expect(service.shortcuts.size).toBe(0)
    })


    test('install', () => {
        service.emit('registered', engine)

        expect(engine.methodA).toBeDefined()
        expect(typeof engine.methodA).toBe('function')
        expect(engine.shortcutB).toBeDefined()
        expect(typeof engine.shortcutB).toBe('function')

        expect(engine.methodDoesNotExist).toBeUndefined()
        expect(engine.shortcutC).toBeUndefined()
        expect(engine.existingProp).toBe('hello')

        expect(engine.hello).toBe('world')
    })


    test('shortcuts', () => {
        const spyA = vi.spyOn(service, 'methodA')
        const spyB = vi.spyOn(service, 'internalMethodB')

        service.emit('registered', engine)

        const resultA = engine.methodA()
        const resultB = engine.shortcutB()

        expect(resultA).toBe('A')
        expect(resultB).toBe('B')

        expect(spyA).toHaveBeenCalledTimes(1)
        expect(spyB).toHaveBeenCalledTimes(1)
    })


    test('uninstall', () => {
        service.emit('registered', engine)
        expect(engine.methodA).toBeDefined()
        expect(engine.shortcutB).toBeDefined()
        expect(service.shortcuts.size).toBeGreaterThan(0)

        service.emit('unregistered', engine)

        expect(engine.methodA).toBeUndefined()
        expect(engine.shortcutB).toBeUndefined()

        expect(service.shortcuts.size).toBe(0)

        expect(engine.hello).toBeUndefined()
    })

})
