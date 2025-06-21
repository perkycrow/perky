import {describe, beforeEach} from 'vitest'
import InputBinder from './input_binder'
import InputBinding from './input_binding'


describe(InputBinder, () => {

    let binder

    beforeEach(() => {
        binder = new InputBinder()
    })


    test('constructor - empty', () => {
        const emptyBinder = new InputBinder()
        expect(emptyBinder.getAllBindings()).toHaveLength(0)
    })


    test('constructor - with bindings', () => {
        const bindings = [
            {
                deviceName: 'keyboard',
                controlName: 'Space',
                actionName: 'jump'
            },
            {
                deviceName: 'keyboard',
                controlName: 'Enter',
                actionName: 'select',
                controllerName: 'menu'
            }
        ]

        const binderWithData = new InputBinder(bindings)
        expect(binderWithData.getAllBindings()).toHaveLength(2)
        
        const jumpBinding = binderWithData.getBinding({actionName: 'jump'})
        expect(jumpBinding.deviceName).toBe('keyboard')
        expect(jumpBinding.controlName).toBe('Space')
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
        
        expect(binding).toBeNull()
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


    test('export', () => {
        binder.bind({
            deviceName: 'keyboard',
            controlName: 'Space',
            actionName: 'jump'
        })
        
        binder.bind({
            deviceName: 'mouse',
            controlName: 'LeftButton',
            actionName: 'fire',
            controllerName: 'game',
            eventType: 'released'
        })
        
        const exported = binder.export()
        
        expect(exported).toHaveProperty('bindings')
        expect(exported.bindings).toHaveLength(2)
        
        const jumpBinding = exported.bindings.find(b => b.actionName === 'jump')
        expect(jumpBinding.deviceName).toBe('keyboard')
        expect(jumpBinding.controlName).toBe('Space')
        expect(jumpBinding.controllerName).toBeNull()
        expect(jumpBinding.eventType).toBe('pressed')
        
        const fireBinding = exported.bindings.find(b => b.actionName === 'fire')
        expect(fireBinding.controllerName).toBe('game')
        expect(fireBinding.eventType).toBe('released')
    })


    test('import - static method', () => {
        const data = {
            bindings: [
                {
                    deviceName: 'keyboard',
                    controlName: 'Space',
                    actionName: 'jump'
                },
                {
                    deviceName: 'mouse',
                    controlName: 'LeftButton',
                    actionName: 'fire',
                    controllerName: 'game',
                    eventType: 'released'
                }
            ]
        }
        
        const binderFromImport = InputBinder.import(data)
        
        expect(binderFromImport.getAllBindings()).toHaveLength(2)
        
        const jumpBinding = binderFromImport.getBinding({actionName: 'jump'})
        expect(jumpBinding.deviceName).toBe('keyboard')
        expect(jumpBinding.controlName).toBe('Space')
        
        const fireBinding = binderFromImport.getBinding({
            actionName: 'fire', 
            controllerName: 'game', 
            eventType: 'released'
        })
        expect(fireBinding.deviceName).toBe('mouse')
        expect(fireBinding.controllerName).toBe('game')
    })


    test('import - instance method', () => {
        const bindings = [
            {
                deviceName: 'keyboard',
                controlName: 'Enter',
                actionName: 'select'
            }
        ]
        
        binder.import(bindings)
        
        expect(binder.getAllBindings()).toHaveLength(1)
        expect(binder.hasBinding({actionName: 'select'})).toBe(true)
    })


    test('import - empty data', () => {
        const binderFromImport = InputBinder.import({})
        expect(binderFromImport.getAllBindings()).toHaveLength(0)
    })

})
