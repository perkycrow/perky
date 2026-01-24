
import {describe, test, expect, vi} from 'vitest'
import {getActionsForModule, registerActionProvider} from './context_menu_actions.js'
import PerkyModule from '../core/perky_module.js'
import GameLoop from '../game/game_loop.js'


describe('getActionsForModule default actions', () => {

    test('includes Focus action', () => {
        const module = new PerkyModule({$id: 'test'})
        const actions = getActionsForModule(module, {})

        const focusAction = actions.find(a => a.label === 'Focus')
        expect(focusAction).toBeDefined()
        expect(focusAction.iconSvg).toContain('svg')
    })


    test('Focus action calls onFocus callback', () => {
        const module = new PerkyModule({$id: 'test'})
        const onFocus = vi.fn()
        const actions = getActionsForModule(module, {onFocus})

        const focusAction = actions.find(a => a.label === 'Focus')
        focusAction.action(module)

        expect(onFocus).toHaveBeenCalledWith(module)
    })


    test('includes Stop action when module is started', () => {
        const module = new PerkyModule({$id: 'test'})
        module.start()
        const actions = getActionsForModule(module, {})

        const stopAction = actions.find(a => a.label === 'Stop')
        expect(stopAction).toBeDefined()
        expect(stopAction.icon).toBe('⏹')
    })


    test('includes Start action when module is stopped', () => {
        const module = new PerkyModule({$id: 'test'})
        const actions = getActionsForModule(module, {})

        const startAction = actions.find(a => a.label === 'Start')
        expect(startAction).toBeDefined()
        expect(startAction.icon).toBe('▶')
    })


    test('disables Start/Stop for static modules', () => {
        const module = new PerkyModule({$id: 'test', $lifecycle: false})
        const actions = getActionsForModule(module, {})

        const startAction = actions.find(a => a.label === 'Start')
        expect(startAction.disabled).toBe(true)
    })


    test('includes Dispose action', () => {
        const module = new PerkyModule({$id: 'test'})
        const actions = getActionsForModule(module, {})

        const disposeAction = actions.find(a => a.label === 'Dispose')
        expect(disposeAction).toBeDefined()
        expect(disposeAction.icon).toBe('🗑')
        expect(disposeAction.danger).toBe(true)
    })


    test('disables Dispose for already disposed modules', () => {
        const module = new PerkyModule({$id: 'test'})
        module.dispose()
        const actions = getActionsForModule(module, {})

        const disposeAction = actions.find(a => a.label === 'Dispose')
        expect(disposeAction.disabled).toBe(true)
    })


    test('Stop action calls module.stop()', () => {
        const module = new PerkyModule({$id: 'test'})
        module.start()
        const stopSpy = vi.spyOn(module, 'stop')
        const actions = getActionsForModule(module, {})

        const stopAction = actions.find(a => a.label === 'Stop')
        stopAction.action(module)

        expect(stopSpy).toHaveBeenCalled()
    })


    test('Start action calls module.start()', () => {
        const module = new PerkyModule({$id: 'test'})
        const startSpy = vi.spyOn(module, 'start')
        const actions = getActionsForModule(module, {})

        const startAction = actions.find(a => a.label === 'Start')
        startAction.action(module)

        expect(startSpy).toHaveBeenCalled()
    })


    test('Dispose action calls module.dispose()', () => {
        const module = new PerkyModule({$id: 'test'})
        const disposeSpy = vi.spyOn(module, 'dispose')
        const actions = getActionsForModule(module, {})

        const disposeAction = actions.find(a => a.label === 'Dispose')
        disposeAction.action(module)

        expect(disposeSpy).toHaveBeenCalled()
    })

})


describe('getActionsForModule GameLoop actions', () => {

    test('includes Pause action for running GameLoop', () => {
        const gameLoop = new GameLoop()
        gameLoop.start()
        const actions = getActionsForModule(gameLoop, {})

        const pauseAction = actions.find(a => a.label === 'Pause')
        expect(pauseAction).toBeDefined()
        expect(pauseAction.icon).toBe('⏸')
    })


    test('includes Resume action for paused GameLoop', () => {
        const gameLoop = new GameLoop()
        gameLoop.start()
        gameLoop.pause()
        const actions = getActionsForModule(gameLoop, {})

        const resumeAction = actions.find(a => a.label === 'Resume')
        expect(resumeAction).toBeDefined()
        expect(resumeAction.icon).toBe('▶')
    })


    test('disables Pause/Resume when GameLoop is not started', () => {
        const gameLoop = new GameLoop()
        const actions = getActionsForModule(gameLoop, {})

        const pauseAction = actions.find(a => a.label === 'Pause')
        expect(pauseAction.disabled).toBe(true)
    })


    test('Pause action calls gameLoop.pause()', () => {
        const gameLoop = new GameLoop()
        gameLoop.start()
        const pauseSpy = vi.spyOn(gameLoop, 'pause')
        const actions = getActionsForModule(gameLoop, {})

        const pauseAction = actions.find(a => a.label === 'Pause')
        pauseAction.action(gameLoop)

        expect(pauseSpy).toHaveBeenCalled()
    })


    test('Resume action calls gameLoop.resume()', () => {
        const gameLoop = new GameLoop()
        gameLoop.start()
        gameLoop.pause()
        const resumeSpy = vi.spyOn(gameLoop, 'resume')
        const actions = getActionsForModule(gameLoop, {})

        const resumeAction = actions.find(a => a.label === 'Resume')
        resumeAction.action(gameLoop)

        expect(resumeSpy).toHaveBeenCalled()
    })

})


test('registerActionProvider allows registering custom action providers', () => {
    class CustomModule extends PerkyModule {
        customMethod () {}
    }

    registerActionProvider({
        matches: (module) => module instanceof CustomModule,
        getActions: () => [
            {label: 'Custom Action', icon: '⭐', action: vi.fn()}
        ]
    })

    const customModule = new CustomModule({$id: 'custom'})
    const actions = getActionsForModule(customModule, {})

    const customAction = actions.find(a => a.label === 'Custom Action')
    expect(customAction).toBeDefined()
})
