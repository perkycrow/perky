import ApplicationManager from './application_manager'
import Application from './application'
import PerkyModule from '../core/perky_module'
import Registry from '../core/registry'
import ModuleRegistry from '../core/module_registry'
import {vi} from 'vitest'


class MockApplication extends Application {
    constructor (params = {}) {
        super(params)
        this.name = params.name || 'MockApp'
        this.mockStart = vi.fn()
        this.mockStop = vi.fn()
        this.mockDispatchAction = vi.fn()
        this.mockDispose = vi.fn()
        this.mockDismount = vi.fn()
    }

    start () {
        this.mockStart()
        return super.start()
    }

    stop () {
        this.mockStop()
        return super.stop()
    }

    dispatchAction (...args) {
        this.mockDispatchAction(...args)
        return super.dispatchAction(...args)
    }

    dispose () {
        this.mockDispose()
        if (this.perkyView && this.perkyView.mounted) {
            this.mockDismount()
        }
        return super.dispose()
    }
}


describe(ApplicationManager, () => {
    let appManager
    let MockApp

    beforeEach(() => {
        global.ResizeObserver = vi.fn().mockImplementation(() => ({
            observe: vi.fn(),
            unobserve: vi.fn(),
            disconnect: vi.fn()
        }))

        appManager = new ApplicationManager()
        MockApp = MockApplication
    })

    afterEach(() => {
        vi.restoreAllMocks()
    })


    test('constructor', () => {
        expect(appManager).toBeInstanceOf(PerkyModule)
        expect(appManager.constructors).toBeInstanceOf(Registry)
        expect(appManager.instances).toBeInstanceOf(ModuleRegistry)
        expect(appManager.lastAppId).toBe(0)
    })


    test('constructor initializes ModuleRegistry with correct options', () => {
        const config = appManager.instances.getConfig()
        
        expect(config.parentModule).toBe(appManager)
        expect(config.parentModuleName).toBe('appManager')
        expect(config.registryName).toBe('applications')
        expect(config.bind).toBe(false)
        expect(config.autoStart).toBe(false)
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


    test('create', () => {
        appManager.register('testApp', MockApp)
        
        const app = appManager.create('testApp', {name: 'TestInstance'})
        
        expect(app).toBeInstanceOf(MockApp)
        expect(app.id).toBe(1)
        expect(app.name).toBe('TestInstance')
        expect(appManager.lastAppId).toBe(1)
        expect(appManager.instances.has(1)).toBe(true)
        expect(appManager.instances.get(1)).toBe(app)
    })


    test('create with default params', () => {
        appManager.register('testApp', MockApp)
        
        const app = appManager.create('testApp')
        
        expect(app).toBeInstanceOf(MockApp)
        expect(app.id).toBe(1)
        expect(app.name).toBe('MockApp')
    })


    test('create increments lastAppId', () => {
        appManager.register('testApp', MockApp)
        
        const app1 = appManager.create('testApp')
        const app2 = appManager.create('testApp')
        const app3 = appManager.create('testApp')
        
        expect(app1.id).toBe(1)
        expect(app2.id).toBe(2)
        expect(app3.id).toBe(3)
        expect(appManager.lastAppId).toBe(3)
    })


    test('create unregistered app throws error', () => {
        expect(() => {
            appManager.create('nonExistent')
        }).toThrow('Application "nonExistent" is not registered.')
    })


    test('spawn', async () => {
        appManager.register('testApp', MockApp)
        
        const app = await appManager.spawn('testApp', {name: 'SpawnedApp'})
        
        expect(app).toBeInstanceOf(MockApp)
        expect(app.id).toBe(1)
        expect(app.name).toBe('SpawnedApp')
        expect(app.mockStart).toHaveBeenCalled()
        expect(appManager.instances.has(1)).toBe(true)
    })


    test('start', () => {
        appManager.register('testApp', MockApp)
        const app = appManager.create('testApp')
        
        appManager.start(app.id)
        
        expect(app.mockStart).toHaveBeenCalled()
    })


    test('start non-existent app', () => {
        expect(() => {
            appManager.start(999)
        }).not.toThrow()
    })


    test('stop', async () => {
        appManager.register('testApp', MockApp)
        const app = await appManager.spawn('testApp')
        
        appManager.stop(app.id)
        
        expect(app.mockStop).toHaveBeenCalled()
    })


    test('stop non-existent app', () => {
        expect(() => {
            appManager.stop(999)
        }).not.toThrow()
    })


    test('execute', () => {
        appManager.register('testApp', MockApp)
        const app = appManager.create('testApp')
        
        appManager.execute(app.id, 'testAction', 'arg1', 'arg2')
        
        expect(app.mockDispatchAction).toHaveBeenCalledWith('testAction', 'arg1', 'arg2')
    })


    test('execute non-existent app', () => {
        expect(() => {
            appManager.execute(999, 'testAction')
        }).not.toThrow()
    })


    test('dispose', async () => {
        appManager.register('testApp', MockApp)
        const app = await appManager.spawn('testApp')
        const appId = app.id
        
        appManager.dispose(appId)
        
        expect(app.mockDispose).toHaveBeenCalled()
        expect(appManager.instances.has(appId)).toBe(false)
    })


    test('dispose non-existent app', () => {
        expect(() => {
            appManager.dispose(999)
        }).not.toThrow()
    })


    test('dispose calls app.dispose() which triggers dismount', async () => {
        appManager.register('testApp', MockApp)
        const container = document.createElement('div')
        const app = await appManager.spawn('testApp', {container})
        const appId = app.id
        
        expect(app.perkyView.mounted).toBe(true)
        
        appManager.dispose(appId)
        
        expect(app.mockDispose).toHaveBeenCalled()
        expect(app.mockDismount).toHaveBeenCalledTimes(1)
        expect(appManager.instances.has(appId)).toBe(false)
    })


    test('dispose vs stop - dispose should call app.dispose(), not just stop()', async () => {
        appManager.register('testApp', MockApp)
        const container = document.createElement('div')
        const app = await appManager.spawn('testApp', {container})
        const appId = app.id
        
        appManager.stop(appId)
        expect(app.mockStop).toHaveBeenCalledTimes(1)
        expect(app.mockDispose).not.toHaveBeenCalled()
        expect(app.mockDismount).not.toHaveBeenCalled()
        expect(appManager.instances.has(appId)).toBe(true)
        
        appManager.dispose(appId)
        expect(app.mockDispose).toHaveBeenCalled()
        expect(app.mockDismount).toHaveBeenCalledTimes(1)
        expect(appManager.instances.has(appId)).toBe(false)
    })


    test('list all apps', () => {
        appManager.register('testApp', MockApp)
        
        const app1 = appManager.create('testApp', {name: 'App1'})
        const app2 = appManager.create('testApp', {name: 'App2'})
        const app3 = appManager.create('testApp', {name: 'Different'})
        
        const allApps = appManager.list()
        
        expect(allApps).toHaveLength(3)
        expect(allApps).toContain(app1)
        expect(allApps).toContain(app2)
        expect(allApps).toContain(app3)
    })


    test('list with grep filter', () => {
        appManager.register('testApp', MockApp)
        
        const app1 = appManager.create('testApp', {name: 'GameApp'})
        const app2 = appManager.create('testApp', {name: 'MenuApp'})
        const app3 = appManager.create('testApp', {name: 'SettingsApp'})
        
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
        appManager.create('testApp', {name: 'TestApp'})
        
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
                super({...params, name: 'Preload'})
            }
        }
        
        class TitleApp extends MockApp {
            constructor (params) {
                super({...params, name: 'TitleScreen'})
            }
        }
        
        class GameApp extends MockApp {
            constructor (params) {
                super({...params, name: 'Game'})
            }
        }
        
        appManager.register('preload', PreloadApp)
        appManager.register('title', TitleApp)
        appManager.register('game', GameApp)
        
        const preload = await appManager.spawn('preload')
        expect(preload.mockStart).toHaveBeenCalled()
        
        appManager.stop(preload.id)
        expect(preload.mockStop).toHaveBeenCalled()
        
        const title = await appManager.spawn('title')
        expect(title.mockStart).toHaveBeenCalled()
        
        appManager.stop(title.id)
        await appManager.spawn('game')
        
        expect(appManager.list()).toHaveLength(3)
        expect(appManager.list('Game')).toHaveLength(1)
        expect(appManager.list('Title')).toHaveLength(1)
    })


    test('integration scenario - settings overlay', async () => {
        class GameApp extends MockApp {
            constructor (params) {
                super({...params, name: 'Game'})
            }
        }
        
        class SettingsApp extends MockApp {
            constructor (params) {
                super({...params, name: 'Settings'})
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
        
        appManager.dispose(settings.id)
        expect(settings.mockDispose).toHaveBeenCalled()
        expect(appManager.instances.has(settings.id)).toBe(false)
        expect(appManager.instances.has(game.id)).toBe(true)
    })


    test('multiple instances of same app type', () => {
        appManager.register('dialog', MockApp)
        
        const dialog1 = appManager.create('dialog', {name: 'ConfirmDialog'})
        const dialog2 = appManager.create('dialog', {name: 'AlertDialog'})
        const dialog3 = appManager.create('dialog', {name: 'InputDialog'})
        
        expect(dialog1.id).toBe(1)
        expect(dialog2.id).toBe(2)
        expect(dialog3.id).toBe(3)
        
        expect(appManager.list()).toHaveLength(3)
        expect(appManager.list('Dialog')).toHaveLength(3)
        
        appManager.dispose(dialog2.id)
        expect(appManager.list()).toHaveLength(2)
        expect(appManager.instances.has(dialog1.id)).toBe(true)
        expect(appManager.instances.has(dialog2.id)).toBe(false)
        expect(appManager.instances.has(dialog3.id)).toBe(true)
    })


    test('app lifecycle management', () => {
        appManager.register('testApp', MockApp)
        
        const app = appManager.create('testApp')
        expect(app.mockStart).not.toHaveBeenCalled()
        expect(app.mockStop).not.toHaveBeenCalled()
        
        appManager.start(app.id)
        expect(app.mockStart).toHaveBeenCalledTimes(1)
        
        appManager.stop(app.id)
        expect(app.mockStop).toHaveBeenCalledTimes(1)
        
        appManager.start(app.id)
        expect(app.mockStart).toHaveBeenCalledTimes(2)
        
        appManager.dispose(app.id)
        expect(app.mockDispose).toHaveBeenCalled()
        expect(appManager.instances.has(app.id)).toBe(false)
    })


    test('app self-dispose should be intercepted by manager', () => {
        appManager.register('testApp', MockApp)
        
        const app = appManager.create('testApp')
        const appId = app.id
        
        expect(appManager.instances.has(appId)).toBe(true)
        expect(appManager.list()).toHaveLength(1)
        
        app.dispose()
        
        expect(appManager.instances.has(appId)).toBe(false)
        expect(appManager.list()).toHaveLength(0)
    })

})
