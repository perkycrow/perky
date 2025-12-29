import ApplicationManager from './application_manager'
import Application from './application'
import PerkyModule from '../core/perky_module'
import Registry from '../core/registry'
import {vi} from 'vitest'


class MockApplication extends Application {
    constructor (params = {}) {
        super(params)
        this.mockStart = vi.fn()
        this.mockStop = vi.fn()
        this.mockDispatchAction = vi.fn()
        this.mockDispose = vi.fn()
        this.mockDismount = vi.fn()
    }

    onStart () {
        this.mockStart()
    }

    onStop () {
        this.mockStop()
    }

    dispatchAction (...args) {
        this.mockDispatchAction(...args)
        return super.dispatchAction(...args)
    }

    onDispose () {
        this.mockDispose()
    }
}


describe(ApplicationManager, () => {
    let appManager
    let MockApp

    beforeEach(() => {
        appManager = new ApplicationManager()
        MockApp = MockApplication
    })

    afterEach(() => {
        vi.restoreAllMocks()
    })


    test('constructor', () => {
        expect(appManager).toBeInstanceOf(PerkyModule)
        expect(appManager.constructors).toBeInstanceOf(Registry)
    })


    test('constructor initializes children registry', () => {
        expect(appManager.childrenRegistry).toBeInstanceOf(Registry)
        expect(appManager.childrenRegistry.size).toBe(0)
    })


    test('register', () => {
        appManager.register('testApp', MockApp)

        expect(appManager.constructors.has('testApp')).toBe(true)
        expect(appManager.constructors.get('testApp')).toBe(MockApp)
    })


    test('register duplicate name throws error', () => {
        appManager.register('testApp', MockApp)

        expect(() => {
            appManager.register('testApp', MockApp)
        }).toThrow('Application "testApp" is already registered.')
    })


    test('unregister', () => {
        appManager.register('testApp', MockApp)
        expect(appManager.constructors.has('testApp')).toBe(true)

        appManager.unregister('testApp')
        expect(appManager.constructors.has('testApp')).toBe(false)
    })


    test('unregister non-existent app', () => {
        expect(() => {
            appManager.unregister('nonExistent')
        }).not.toThrow()

        expect(appManager.constructors.has('nonExistent')).toBe(false)
    })


    test('createApp', () => {
        appManager.register('testApp', MockApp)

        const app = appManager.createApp('testApp', {$name: 'TestInstance'})

        expect(app).toBeInstanceOf(MockApp)
        expect(app.$id).toBeTruthy()
        expect(app.$name).toBe('TestInstance')
        expect(app.$category).toBe('application')
        expect(appManager.childrenRegistry.has(app.$id)).toBe(true)
        expect(appManager.getChild(app.$id)).toBe(app)
    })


    test('createApp with default params', () => {
        appManager.register('testApp', MockApp)

        const app = appManager.createApp('testApp')

        expect(app).toBeInstanceOf(MockApp)
        expect(app.$id).toBeTruthy()
        expect(app.$name).toBe('application')
    })


    test('createApp generates unique names', () => {
        appManager.register('testApp', MockApp)

        const app1 = appManager.createApp('testApp')
        const app2 = appManager.createApp('testApp')
        const app3 = appManager.createApp('testApp')

        expect(app1.$id).toBeTruthy()
        expect(app2.$id).toBeTruthy()
        expect(app3.$id).toBeTruthy()
        expect(app1.$id).not.toBe(app2.$id)
        expect(app2.$id).not.toBe(app3.$id)
    })


    test('createApp unregistered app throws error', () => {
        expect(() => {
            appManager.createApp('nonExistent')
        }).toThrow('Application "nonExistent" is not registered.')
    })


    test('spawn', async () => {
        appManager.register('testApp', MockApp)

        const app = await appManager.spawn('testApp', {$name: 'SpawnedApp'})

        expect(app).toBeInstanceOf(MockApp)
        expect(app.$id).toBeTruthy()
        expect(app.$name).toBe('SpawnedApp')
        expect(app.mockStart).toHaveBeenCalled()
        expect(appManager.childrenRegistry.has(app.$id)).toBe(true)
    })


    test('startApp', () => {
        appManager.register('testApp', MockApp)
        const app = appManager.createApp('testApp')

        appManager.startApp(app.$id)

        expect(app.mockStart).toHaveBeenCalled()
    })


    test('startApp non-existent app', () => {
        expect(() => {
            appManager.startApp('nonExistent')
        }).not.toThrow()
    })


    test('stopApp', async () => {
        appManager.register('testApp', MockApp)
        const app = await appManager.spawn('testApp')

        appManager.stopApp(app.$id)

        expect(app.mockStop).toHaveBeenCalled()
    })


    test('stopApp non-existent app', () => {
        expect(() => {
            appManager.stopApp('nonExistent')
        }).not.toThrow()
    })


    test('execute', () => {
        appManager = new ApplicationManager()
        appManager.register('TestApp', Application)

        const app = appManager.createApp('TestApp')
        const actionSpy = vi.fn()
        app.mainController.testAction = actionSpy

        appManager.execute(app.$id, 'testAction', 'arg1', 'arg2')

        expect(actionSpy).toHaveBeenCalledWith('arg1', 'arg2')
    })


    test('execute non-existent app', () => {
        expect(() => {
            appManager.execute('nonExistent', 'testAction')
        }).not.toThrow()
    })


    test('disposeApp', async () => {
        appManager.register('testApp', MockApp)
        const app = await appManager.spawn('testApp')
        const appName = app.$id

        appManager.disposeApp(appName)

        expect(app.mockDispose).toHaveBeenCalled()
        expect(appManager.childrenRegistry.has(appName)).toBe(false)
    })


    test('disposeApp non-existent app', () => {
        expect(() => {
            appManager.disposeApp('nonExistent')
        }).not.toThrow()
    })


    test('disposeApp calls app.dispose() which triggers dismount', async () => {
        appManager.register('testApp', MockApp)
        const container = document.createElement('div')
        const app = await appManager.spawn('testApp', {container})
        const appName = app.$id

        expect(app.perkyView.mounted).toBe(true)
        const dismountSpy = vi.spyOn(app.perkyView, 'dismount')

        appManager.disposeApp(appName)

        expect(app.mockDispose).toHaveBeenCalled()
        expect(dismountSpy).toHaveBeenCalledTimes(1)
        expect(appManager.childrenRegistry.has(appName)).toBe(false)
    })


    test('disposeApp vs stopApp - disposeApp should call app.dispose(), not just stop()', async () => {
        appManager.register('testApp', MockApp)
        const container = document.createElement('div')
        const app = await appManager.spawn('testApp', {container})
        const appName = app.$id

        appManager.stopApp(appName)
        expect(app.mockStop).toHaveBeenCalledTimes(1)
        expect(app.mockDispose).not.toHaveBeenCalled()
        expect(appManager.childrenRegistry.has(appName)).toBe(true)

        const dismountSpy = vi.spyOn(app.perkyView, 'dismount')
        appManager.disposeApp(appName)
        expect(app.mockDispose).toHaveBeenCalled()
        expect(dismountSpy).toHaveBeenCalledTimes(1)
        expect(appManager.childrenRegistry.has(appName)).toBe(false)
    })


    test('list all apps', () => {
        appManager.register('testApp', MockApp)

        const app1 = appManager.createApp('testApp', {$name: 'App1'})
        const app2 = appManager.createApp('testApp', {$name: 'App2'})
        const app3 = appManager.createApp('testApp', {$name: 'Different'})

        const allApps = appManager.list()

        expect(allApps).toHaveLength(3)
        expect(allApps).toContain(app1)
        expect(allApps).toContain(app2)
        expect(allApps).toContain(app3)
    })


    test('list with grep filter', () => {
        appManager.register('testApp', MockApp)

        const app1 = appManager.createApp('testApp', {$name: 'GameApp'})
        const app2 = appManager.createApp('testApp', {$name: 'MenuApp'})
        const app3 = appManager.createApp('testApp', {$name: 'SettingsApp'})

        const gameApps = appManager.list('Game')
        const menuApps = appManager.list('Menu')
        const appApps = appManager.list('App')

        expect(gameApps).toHaveLength(1)
        expect(gameApps).toContain(app1)

        expect(menuApps).toHaveLength(1)
        expect(menuApps).toContain(app2)

        expect(appApps).toHaveLength(3)
        expect(appApps).toContain(app1)
        expect(appApps).toContain(app2)
        expect(appApps).toContain(app3)
    })


    test('list with no matches', () => {
        appManager.register('testApp', MockApp)
        appManager.createApp('testApp', {$name: 'TestApp'})

        const noMatches = appManager.list('NonExistent')

        expect(noMatches).toHaveLength(0)
    })


    test('list empty registry', () => {
        const emptyList = appManager.list()

        expect(emptyList).toHaveLength(0)
        expect(emptyList).toEqual([])
    })


    test('integration scenario - preload then title then game', async () => {
        class PreloadApp extends MockApp {
            constructor (params) {
                super({...params, $name: 'Preload'})
            }
        }

        class TitleApp extends MockApp {
            constructor (params) {
                super({...params, $name: 'TitleScreen'})
            }
        }

        class GameApp extends MockApp {
            constructor (params) {
                super({...params, $name: 'Game'})
            }
        }

        appManager.register('preload', PreloadApp)
        appManager.register('title', TitleApp)
        appManager.register('game', GameApp)

        const preload = await appManager.spawn('preload')
        expect(preload.mockStart).toHaveBeenCalled()

        appManager.stopApp(preload.$id)
        expect(preload.mockStop).toHaveBeenCalled()

        const title = await appManager.spawn('title')
        expect(title.mockStart).toHaveBeenCalled()

        appManager.stopApp(title.$id)
        await appManager.spawn('game')

        expect(appManager.list()).toHaveLength(3)
        expect(appManager.list('Game')).toHaveLength(1)
        expect(appManager.list('Title')).toHaveLength(1)
    })


    test('integration scenario - settings overlay', async () => {
        class GameApp extends MockApp {
            constructor (params) {
                super({...params, $name: 'Game'})
            }
        }

        class SettingsApp extends MockApp {
            constructor (params) {
                super({...params, $name: 'Settings'})
            }
        }

        appManager.register('game', GameApp)
        appManager.register('settings', SettingsApp)

        const game = await appManager.spawn('game')
        const settings = await appManager.spawn('settings')

        expect(game.mockStart).toHaveBeenCalled()
        expect(settings.mockStart).toHaveBeenCalled()

        const runningApps = appManager.list()
        expect(runningApps).toHaveLength(2)

        appManager.disposeApp(settings.$id)
        expect(settings.mockDispose).toHaveBeenCalled()
        expect(appManager.childrenRegistry.has(settings.$id)).toBe(false)
        expect(appManager.childrenRegistry.has(game.$id)).toBe(true)
    })


    test('multiple instances of same app type', () => {
        appManager.register('dialog', MockApp)

        const dialog1 = appManager.createApp('dialog', {$name: 'ConfirmDialog'})
        const dialog2 = appManager.createApp('dialog', {$name: 'AlertDialog'})
        const dialog3 = appManager.createApp('dialog', {$name: 'InputDialog'})

        expect(dialog1.$id).toBeTruthy()
        expect(dialog2.$id).toBeTruthy()
        expect(dialog3.$id).toBeTruthy()
        expect(dialog1.$id).not.toBe(dialog2.$id)
        expect(dialog2.$id).not.toBe(dialog3.$id)

        expect(appManager.list()).toHaveLength(3)
        expect(appManager.list('Dialog')).toHaveLength(3)

        appManager.disposeApp(dialog2.$id)
        expect(appManager.list()).toHaveLength(2)
        expect(appManager.childrenRegistry.has(dialog1.$id)).toBe(true)
        expect(appManager.childrenRegistry.has(dialog2.$id)).toBe(false)
        expect(appManager.childrenRegistry.has(dialog3.$id)).toBe(true)
    })


    test('app lifecycle management', () => {
        appManager.register('testApp', MockApp)

        const app = appManager.createApp('testApp')
        const startSpy = vi.spyOn(app, 'start')
        const stopSpy = vi.spyOn(app, 'stop')

        expect(startSpy).not.toHaveBeenCalled()
        expect(stopSpy).not.toHaveBeenCalled()

        appManager.startApp(app.$id)
        expect(startSpy).toHaveBeenCalledTimes(1)

        appManager.stopApp(app.$id)
        expect(app.mockStop).toHaveBeenCalledTimes(1)

        appManager.startApp(app.$id)
        expect(startSpy).toHaveBeenCalledTimes(2)

        appManager.disposeApp(app.$id)
        expect(app.mockDispose).toHaveBeenCalled()
        expect(appManager.childrenRegistry.has(app.$id)).toBe(false)
    })


    test('app self-dispose should be intercepted by manager', () => {
        appManager.register('testApp', MockApp)

        const app = appManager.createApp('testApp')
        const appName = app.$id

        expect(appManager.childrenRegistry.has(appName)).toBe(true)
        expect(appManager.list()).toHaveLength(1)

        app.dispose()

        expect(appManager.childrenRegistry.has(appName)).toBe(false)
        expect(appManager.list()).toHaveLength(0)
    })

})
