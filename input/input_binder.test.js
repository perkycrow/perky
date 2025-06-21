import {describe, beforeEach} from 'vitest'
import InputBinder from './input_binder'
import InputBinding from './input_binding'
import InputManager from './input_manager'
import ActionDispatcher from '../core/action_dispatcher'
import ActionController from '../core/action_controller'



describe(InputBinder, () => {

    let binder
    let inputManager
    let actionDispatcher
    let gameController

    beforeEach(() => {
        inputManager = new InputManager()
        actionDispatcher = new ActionDispatcher()
        gameController = new ActionController()
        binder = new InputBinder()
    })


    test('constructor', () => {
        const customBinder = new InputBinder({inputManager, actionDispatcher})

        expect(customBinder.inputManager).toBe(inputManager)
        expect(customBinder.actionDispatcher).toBe(actionDispatcher)
    })


    test('bind - minimal', () => {
        const result = binder.bind({
            deviceName: 'keyboard',
            controlName: 'Space',
            actionName: 'jump'
        })
        
        expect(result).toBeInstanceOf(InputBinding)
        expect(binder.getAllBindings()).toHaveLength(1)
        
        const binding = binder.getAllBindings()[0]
        expect(binding.deviceName).toBe('keyboard')
        expect(binding.controlName).toBe('Space')
        expect(binding.actionName).toBe('jump')
        expect(binding.controllerName).toBeNull()
        expect(binding.eventType).toBe('pressed')
    })


    test('bind - specific controller', () => {
        binder.bind({
            deviceName: 'keyboard',
            controlName: 'Escape',
            actionName: 'openMenu',
            controllerName: 'game'
        })
        
        const binding = binder.getAllBindings()[0]
        expect(binding.controllerName).toBe('game')
        expect(binding.key).toBe('pressed:openMenu:game')
    })


    test('bind - specific eventType', () => {
        binder.bind({
            deviceName: 'keyboard',
            controlName: 'Space',
            actionName: 'stopJump',
            eventType: 'released'
        })
        
        const binding = binder.getAllBindings()[0]
        expect(binding.eventType).toBe('released')
        expect(binding.key).toBe('released:stopJump')
    })


    test('unbind', () => {
        binder.bind({
            deviceName: 'keyboard',
            controlName: 'Space',
            actionName: 'jump'
        })
        
        const result = binder.unbind({
            actionName: 'jump'
        })

        expect(result).toBe(true)
        expect(binder.getAllBindings()).toHaveLength(0)
    })


    test('unbind - invalid', () => {
        const result = binder.unbind({
            actionName: 'nonexistent'
        })
        
        expect(result).toBe(false)
    })


    test('getBinding', () => {
        binder.bind({
            deviceName: 'keyboard',
            controlName: 'Space',
            actionName: 'jump',
            controllerName: 'game'
        })
        
        const binding = binder.getBinding({
            actionName: 'jump',
            controllerName: 'game'
        })
        
        expect(binding).toBeDefined()
        expect(binding.actionName).toBe('jump')
        expect(binding.controllerName).toBe('game')
    })


    test('getBinding - non-existent', () => {
        const binding = binder.getBinding({
            actionName: 'nonexistent'
        })
        
        expect(binding).toBeUndefined()
    })


    test('hasBinding', () => {
        binder.bind({
            deviceName: 'keyboard',
            controlName: 'Space',
            actionName: 'jump'
        })
        
        const hasBinding = binder.hasBinding({
            actionName: 'jump'
        })
        
        expect(hasBinding).toBe(true)
    })


    test('hasBinding - non-existent', () => {
        const hasBinding = binder.hasBinding({
            actionName: 'nonexistent'
        })
        
        expect(hasBinding).toBe(false)
    })


    test('findBindingByInput', () => {
        binder.bind({
            deviceName: 'keyboard',
            controlName: 'Space',
            actionName: 'jump'
        })
        
        const binding = binder.findBindingByInput({
            deviceName: 'keyboard',
            controlName: 'Space'
        })
        
        expect(binding).toBeDefined()
        expect(binding.actionName).toBe('jump')
    })


    test('findBindingByInput - non-existent', () => {
        const binding = binder.findBindingByInput({
            deviceName: 'mouse',
            controlName: 'LeftButton'
        })
        
        expect(binding).toBeNull()
    })


    test('rebindAction', () => {
        binder.bind({
            deviceName: 'keyboard',
            controlName: 'Space',
            actionName: 'jump'
        })
        
        const result = binder.rebindAction({
            actionName: 'jump',
            deviceName: 'mouse',
            controlName: 'LeftButton'
        })
        
        expect(result).toBe(true)
        
        const binding = binder.getBinding({actionName: 'jump'})
        expect(binding.deviceName).toBe('mouse')
        expect(binding.controlName).toBe('LeftButton')
    })


    test('rebindAction - non-existent', () => {
        const result = binder.rebindAction({
            actionName: 'nonexistent',
            deviceName: 'mouse',
            controlName: 'LeftButton'
        })
        
        expect(result).toBe(false)
    })


    test('clearBindings', () => {
        binder.bind({
            deviceName: 'keyboard',
            controlName: 'Space',
            actionName: 'jump'
        })
        
        binder.bind({
            deviceName: 'keyboard',
            controlName: 'Enter',
            actionName: 'select'
        })
        
        expect(binder.getAllBindings()).toHaveLength(2)
        
        binder.clearBindings()
        
        expect(binder.getAllBindings()).toHaveLength(0)
    })


    test('getActiveControllerName', () => {
        actionDispatcher.register('game', gameController)
        actionDispatcher.setActive('game')
        
        const binderWithDispatcher = new InputBinder({actionDispatcher})
        
        expect(binderWithDispatcher.getActiveControllerName()).toBe('game')
    })


    test('getActiveControllerName - non-existent', () => {
        expect(binder.getActiveControllerName()).toBeNull()
    })

})
