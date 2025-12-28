import {describe, beforeEach} from 'vitest'
import InputBinder from './input_binder'
import InputBinding from './input_binding'
import CompositeBinding from './composite_binding'


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

        const binderWithData = new InputBinder({bindings})
        expect(binderWithData.getAllBindings()).toHaveLength(2)

        const jumpBinding = binderWithData.getBinding({actionName: 'jump'})
        expect(jumpBinding.deviceName).toBe('keyboard')
        expect(jumpBinding.controlName).toBe('Space')
    })


    test('bind - minimal', () => {
        const result = binder.bindInput({
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
        binder.bindInput({
            deviceName: 'keyboard',
            controlName: 'Escape',
            actionName: 'openMenu',
            controllerName: 'game'
        })

        const binding = binder.getAllBindings()[0]
        expect(binding.controllerName).toBe('game')
        expect(binding.key).toBe('keyboard:Escape:pressed:openMenu:game')
    })


    test('bind - specific eventType', () => {
        binder.bindInput({
            deviceName: 'keyboard',
            controlName: 'Space',
            actionName: 'stopJump',
            eventType: 'released'
        })

        const binding = binder.getAllBindings()[0]
        expect(binding.eventType).toBe('released')
        expect(binding.key).toBe('keyboard:Space:released:stopJump')
    })


    test('unbind', () => {
        binder.bindInput({
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
        binder.bindInput({
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
        binder.bindInput({
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


    test('getBindingsForInput - single binding', () => {
        binder.bindInput({
            deviceName: 'keyboard',
            controlName: 'Space',
            actionName: 'jump'
        })

        const bindings = binder.getBindingsForInput({
            deviceName: 'keyboard',
            controlName: 'Space',
            eventType: 'pressed'
        })

        expect(bindings).toHaveLength(1)
        expect(bindings[0].actionName).toBe('jump')
    })


    test('getBindingsForInput - multiple bindings', () => {
        binder.bindInput({
            deviceName: 'keyboard',
            controlName: 'Space',
            actionName: 'jump',
            controllerName: 'game'
        })

        binder.bindInput({
            deviceName: 'keyboard',
            controlName: 'Space',
            actionName: 'select',
            controllerName: 'menu'
        })

        const bindings = binder.getBindingsForInput({
            deviceName: 'keyboard',
            controlName: 'Space',
            eventType: 'pressed'
        })

        expect(bindings).toHaveLength(2)
        expect(bindings.map(b => b.actionName)).toContain('jump')
        expect(bindings.map(b => b.actionName)).toContain('select')
    })


    test('getBindingsForInput - different event types', () => {
        binder.bindInput({
            deviceName: 'keyboard',
            controlName: 'Space',
            actionName: 'jump',
            eventType: 'pressed'
        })

        binder.bindInput({
            deviceName: 'keyboard',
            controlName: 'Space',
            actionName: 'stopJump',
            eventType: 'released'
        })

        const pressedBindings = binder.getBindingsForInput({
            deviceName: 'keyboard',
            controlName: 'Space',
            eventType: 'pressed'
        })

        const releasedBindings = binder.getBindingsForInput({
            deviceName: 'keyboard',
            controlName: 'Space',
            eventType: 'released'
        })

        expect(pressedBindings).toHaveLength(1)
        expect(pressedBindings[0].actionName).toBe('jump')

        expect(releasedBindings).toHaveLength(1)
        expect(releasedBindings[0].actionName).toBe('stopJump')
    })


    test('getBindingsForInput - non-existent', () => {
        const bindings = binder.getBindingsForInput({
            deviceName: 'keyboard',
            controlName: 'NonExistent',
            eventType: 'pressed'
        })

        expect(bindings).toHaveLength(0)
    })

    test('getBindingsForInput - includes CompositeBinding', () => {
        binder.bindCombo(['ControlLeft', 'KeyS'], 'save')

        const bindings = binder.getBindingsForInput({
            deviceName: 'keyboard',
            controlName: 'ControlLeft',
            eventType: 'pressed'
        })

        expect(bindings).toHaveLength(1)
        expect(bindings[0]).toBeInstanceOf(CompositeBinding)
        expect(bindings[0].actionName).toBe('save')
    })

    test('getBindingsForInput - direct bindings come before CompositeBinding', () => {
        binder.bindInput({
            deviceName: 'keyboard',
            controlName: 'ControlLeft',
            actionName: 'ctrl'
        })

        binder.bindCombo(['ControlLeft', 'KeyS'], 'save')

        const bindings = binder.getBindingsForInput({
            deviceName: 'keyboard',
            controlName: 'ControlLeft',
            eventType: 'pressed'
        })

        expect(bindings).toHaveLength(2)
        expect(bindings[0]).toBeInstanceOf(InputBinding)
        expect(bindings[0].actionName).toBe('ctrl')
        expect(bindings[1]).toBeInstanceOf(CompositeBinding)
        expect(bindings[1].actionName).toBe('save')
    })

    test('getBindingsForInput - supports composite input key', () => {
        const binding = binder.bindCombo(['ControlLeft', 'KeyS'], 'save')

        const bindings = binder.getBindingsForInput({
            deviceName: 'composite',
            controlName: binding.controlName,
            eventType: 'pressed'
        })

        expect(bindings).toHaveLength(1)
        expect(bindings[0]).toBe(binding)
    })


    test('getBindingsForAction - single binding', () => {
        binder.bindInput({
            deviceName: 'keyboard',
            controlName: 'Space',
            actionName: 'jump'
        })

        const bindings = binder.getBindingsForAction('jump')

        expect(bindings).toHaveLength(1)
        expect(bindings[0].deviceName).toBe('keyboard')
        expect(bindings[0].controlName).toBe('Space')
    })


    test('getBindingsForAction - multiple bindings for same action', () => {
        binder.bindInput({
            deviceName: 'keyboard',
            controlName: 'Space',
            actionName: 'jump',
            controllerName: 'player1'
        })

        binder.bindInput({
            deviceName: 'keyboard',
            controlName: 'KeyW',
            actionName: 'jump',
            controllerName: 'player2'
        })

        const bindings = binder.getBindingsForAction('jump')

        expect(bindings).toHaveLength(2)
        expect(bindings.map(b => b.controlName)).toContain('Space')
        expect(bindings.map(b => b.controlName)).toContain('KeyW')
    })


    test('getBindingsForAction - filter by controllerName', () => {
        binder.bindInput({
            deviceName: 'keyboard',
            controlName: 'Space',
            actionName: 'jump',
            controllerName: 'player1'
        })

        binder.bindInput({
            deviceName: 'keyboard',
            controlName: 'KeyW',
            actionName: 'jump',
            controllerName: 'player2'
        })

        binder.bindInput({
            deviceName: 'keyboard',
            controlName: 'Enter',
            actionName: 'jump'
        })

        const player1Bindings = binder.getBindingsForAction('jump', 'player1')
        expect(player1Bindings).toHaveLength(1)
        expect(player1Bindings[0].controlName).toBe('Space')

        const player2Bindings = binder.getBindingsForAction('jump', 'player2')
        expect(player2Bindings).toHaveLength(1)
        expect(player2Bindings[0].controlName).toBe('KeyW')

        const allBindings = binder.getBindingsForAction('jump', null)
        expect(allBindings).toHaveLength(3)
    })


    test('getBindingsForAction - filter by eventType', () => {
        binder.bindInput({
            deviceName: 'keyboard',
            controlName: 'Space',
            actionName: 'jump',
            eventType: 'pressed'
        })

        binder.bindInput({
            deviceName: 'keyboard',
            controlName: 'Space',
            actionName: 'jump',
            eventType: 'released'
        })

        const pressedBindings = binder.getBindingsForAction('jump', null, 'pressed')
        expect(pressedBindings).toHaveLength(1)
        expect(pressedBindings[0].eventType).toBe('pressed')

        const releasedBindings = binder.getBindingsForAction('jump', null, 'released')
        expect(releasedBindings).toHaveLength(1)
        expect(releasedBindings[0].eventType).toBe('released')
    })


    test('getBindingsForAction - non-existent action', () => {
        const bindings = binder.getBindingsForAction('nonExistent')
        expect(bindings).toHaveLength(0)
    })


    test('unbind - updates input index', () => {
        binder.bindInput({
            deviceName: 'keyboard',
            controlName: 'Space',
            actionName: 'jump'
        })

        let bindings = binder.getBindingsForInput({
            deviceName: 'keyboard',
            controlName: 'Space',
            eventType: 'pressed'
        })
        expect(bindings).toHaveLength(1)

        binder.unbind({actionName: 'jump'})

        bindings = binder.getBindingsForInput({
            deviceName: 'keyboard',
            controlName: 'Space',
            eventType: 'pressed'
        })
        expect(bindings).toHaveLength(0)
    })

    test('unbind - updates input index for CompositeBinding', () => {
        binder.bindCombo(['ControlLeft', 'KeyS'], 'save')

        expect(binder.getBindingsForInput({
            deviceName: 'keyboard',
            controlName: 'ControlLeft',
            eventType: 'pressed'
        })).toHaveLength(1)

        binder.unbind({actionName: 'save'})

        expect(binder.getBindingsForInput({
            deviceName: 'keyboard',
            controlName: 'ControlLeft',
            eventType: 'pressed'
        })).toHaveLength(0)
    })


    test('clearBindings', () => {
        binder.bindInput({
            deviceName: 'keyboard',
            controlName: 'Space',
            actionName: 'jump'
        })

        binder.bindInput({
            deviceName: 'keyboard',
            controlName: 'Enter',
            actionName: 'select'
        })

        expect(binder.getAllBindings()).toHaveLength(2)

        const spaceBindings = binder.getBindingsForInput({
            deviceName: 'keyboard',
            controlName: 'Space',
            eventType: 'pressed'
        })
        expect(spaceBindings).toHaveLength(1)

        binder.clearBindings()

        expect(binder.getAllBindings()).toHaveLength(0)

        const bindingsAfterClear = binder.getBindingsForInput({
            deviceName: 'keyboard',
            controlName: 'Space',
            eventType: 'pressed'
        })
        expect(bindingsAfterClear).toHaveLength(0)
    })


    test('export', () => {
        binder.bindInput({
            deviceName: 'keyboard',
            controlName: 'Space',
            actionName: 'jump'
        })

        binder.bindInput({
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


    test('export - includes controls for CompositeBinding', () => {
        binder.bindCombo(['ControlLeft', 'KeyS'], 'save')

        const exported = binder.export()

        expect(exported.bindings).toHaveLength(1)
        expect(exported.bindings[0].controls).toBeDefined()
        expect(exported.bindings[0].controls).toHaveLength(2)
        expect(exported.bindings[0].controls[0]).toEqual({deviceName: 'keyboard', controlName: 'ControlLeft'})
        expect(exported.bindings[0].controls[1]).toEqual({deviceName: 'keyboard', controlName: 'KeyS'})
    })


    test('import - restores CompositeBinding from exported data', () => {
        binder.bindCombo(['ControlLeft', 'KeyS'], 'save')

        const exported = binder.export()
        const newBinder = new InputBinder({bindings: exported.bindings})

        const bindings = newBinder.getAllBindings()
        expect(bindings).toHaveLength(1)
        expect(bindings[0]).toBeInstanceOf(CompositeBinding)
        expect(bindings[0].controls).toHaveLength(2)
        expect(bindings[0].actionName).toBe('save')
    })


    test('constructor - with exported data', () => {
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

        const binderFromImport = new InputBinder(data)

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

        const spaceBindings = binderFromImport.getBindingsForInput({
            deviceName: 'keyboard',
            controlName: 'Space',
            eventType: 'pressed'
        })
        expect(spaceBindings).toHaveLength(1)
    })


    test('import - instance method', () => {
        const bindings = [
            {
                deviceName: 'keyboard',
                controlName: 'Enter',
                actionName: 'select'
            }
        ]

        binder.import({bindings})

        expect(binder.getAllBindings()).toHaveLength(1)
        expect(binder.hasBinding({actionName: 'select'})).toBe(true)
    })


    test('constructor - empty data via import pattern', () => {
        const binderFromImport = new InputBinder({})
        expect(binderFromImport.getAllBindings()).toHaveLength(0)
    })


    test('accepts string format with auto-detection', () => {
        const binding = binder.bindCombo(['ControlLeft', 'leftButton'], 'smartCombo')

        expect(binding).toBeInstanceOf(CompositeBinding)
        expect(binding.controls).toHaveLength(2)
        expect(binding.controls[0].deviceName).toBe('keyboard')
        expect(binding.controls[0].controlName).toBe('ControlLeft')
        expect(binding.controls[1].deviceName).toBe('mouse')
        expect(binding.controls[1].controlName).toBe('leftButton')
        expect(binding.actionName).toBe('smartCombo')
    })


    test('accepts object format', () => {
        const binding = binder.bindCombo([
            {deviceName: 'keyboard', controlName: 'ShiftLeft'},
            {deviceName: 'mouse', controlName: 'rightButton'}
        ], 'objectCombo')

        expect(binding).toBeInstanceOf(CompositeBinding)
        expect(binding.controls).toHaveLength(2)
        expect(binding.controls[0].deviceName).toBe('keyboard')
        expect(binding.controls[0].controlName).toBe('ShiftLeft')
        expect(binding.controls[1].deviceName).toBe('mouse')
        expect(binding.controls[1].controlName).toBe('rightButton')
    })


    test('accepts mixed string and object formats', () => {
        const binding = binder.bindCombo([
            'ControlLeft',
            {deviceName: 'mouse', controlName: 'leftButton'},
            'KeyA'
        ], 'mixedCombo')

        expect(binding.controls).toHaveLength(3)
        expect(binding.controls[0].deviceName).toBe('keyboard')
        expect(binding.controls[0].controlName).toBe('ControlLeft')
        expect(binding.controls[1].deviceName).toBe('mouse')
        expect(binding.controls[1].controlName).toBe('leftButton')
        expect(binding.controls[2].deviceName).toBe('keyboard')
        expect(binding.controls[2].controlName).toBe('KeyA')
    })


    test('auto-detects all device types correctly', () => {
        const binding = binder.bindCombo([
            'KeyA',
            'leftButton',
            'button0',
            'unknownControl'
        ], 'deviceTypes')

        expect(binding.controls[0].deviceName).toBe('keyboard')
        expect(binding.controls[1].deviceName).toBe('mouse')
        expect(binding.controls[2].deviceName).toBe('gamepad')
        expect(binding.controls[3].deviceName).toBe('keyboard')
    })


    test('allows explicit device override with objects', () => {
        const binding = binder.bindCombo([
            'leftButton',
            {deviceName: 'keyboard', controlName: 'leftButton'}
        ], 'explicitOverride')

        expect(binding.controls[0].deviceName).toBe('mouse')
        expect(binding.controls[1].deviceName).toBe('keyboard')
        expect(binding.controls[0].controlName).toBe('leftButton')
        expect(binding.controls[1].controlName).toBe('leftButton')
    })


    test('validates controls array', () => {
        expect(() => {
            binder.bindCombo(['single'], 'invalid')
        }).toThrow('Controls must be an array with at least 2 controls')

        expect(() => {
            binder.bindCombo([], 'empty')
        }).toThrow('Controls must be an array with at least 2 controls')

        expect(() => {
            binder.bindCombo('not-array', 'invalid')
        }).toThrow('Controls must be an array with at least 2 controls')
    })


    test('validates control formats', () => {
        expect(() => {
            binder.bindCombo(['KeyA', null], 'invalid')
        }).toThrow('Control at index 1 must be a string or object with deviceName and controlName properties')

        expect(() => {
            binder.bindCombo(['KeyA', {}], 'invalid')
        }).toThrow('Control at index 1 must be a string or object with deviceName and controlName properties')

        expect(() => {
            binder.bindCombo(['KeyA', {deviceName: 'keyboard'}], 'invalid')
        }).toThrow('Control at index 1 must be a string or object with deviceName and controlName properties')
    })


    test('validates actionName', () => {
        expect(() => {
            binder.bindCombo(['KeyA', 'KeyB'], '')
        }).toThrow('actionName is required and must be a string')

        expect(() => {
            binder.bindCombo(['KeyA', 'KeyB'], null)
        }).toThrow('actionName is required and must be a string')
    })


    test('supports controller and eventType', () => {
        const binding = binder.bindCombo(['KeyA', 'leftButton'], 'comboAction', 'player', 'released')

        expect(binding.controllerName).toBe('player')
        expect(binding.eventType).toBe('released')
    })


    test('maintains action index when bindings are added', () => {
        binder.bindInput({
            deviceName: 'keyboard',
            controlName: 'KeyW',
            actionName: 'moveUp',
            controllerName: 'player1'
        })

        const bindings = binder.getBindingsForAction('moveUp', 'player1')
        expect(bindings).toHaveLength(1)
        expect(bindings[0].controlName).toBe('KeyW')
    })


    test('maintains action index when bindings are removed', () => {
        binder.bindInput({
            deviceName: 'keyboard',
            controlName: 'KeyW',
            actionName: 'moveUp',
            controllerName: 'player1'
        })

        binder.bindInput({
            deviceName: 'keyboard',
            controlName: 'ArrowUp',
            actionName: 'moveUp',
            controllerName: 'player1'
        })

        expect(binder.getBindingsForAction('moveUp', 'player1')).toHaveLength(2)

        binder.unbind({
            deviceName: 'keyboard',
            controlName: 'KeyW',
            actionName: 'moveUp',
            controllerName: 'player1'
        })

        const remaining = binder.getBindingsForAction('moveUp', 'player1')
        expect(remaining).toHaveLength(1)
        expect(remaining[0].controlName).toBe('ArrowUp')
    })


    test('clearBindings clears action index', () => {
        binder.bindInput({
            deviceName: 'keyboard',
            controlName: 'Space',
            actionName: 'jump'
        })

        binder.bindInput({
            deviceName: 'keyboard',
            controlName: 'KeyW',
            actionName: 'moveUp'
        })

        expect(binder.getBindingsForAction('jump')).toHaveLength(1)
        expect(binder.getBindingsForAction('moveUp')).toHaveLength(1)

        binder.clearBindings()

        expect(binder.getBindingsForAction('jump')).toHaveLength(0)
        expect(binder.getBindingsForAction('moveUp')).toHaveLength(0)
    })


    test('action index handles multiple controllers', () => {
        binder.bindInput({
            deviceName: 'keyboard',
            controlName: 'Space',
            actionName: 'jump',
            controllerName: 'player1'
        })

        binder.bindInput({
            deviceName: 'keyboard',
            controlName: 'KeyW',
            actionName: 'jump',
            controllerName: 'player2'
        })

        expect(binder.getBindingsForAction('jump', 'player1')).toHaveLength(1)
        expect(binder.getBindingsForAction('jump', 'player2')).toHaveLength(1)
        expect(binder.getBindingsForAction('jump', null)).toHaveLength(2)
    })

})
