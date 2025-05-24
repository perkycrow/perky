import InputMapper from './input_mapper'
import PerkyModule from '../core/perky_module'
import {vi, beforeEach, describe, test, expect, afterEach} from 'vitest'


describe(InputMapper, () => {
    let inputMapper
    let mockInputObserver

    beforeEach(() => {
        mockInputObserver = {
            on: vi.fn(),
            isPressed: vi.fn()
        }
        
        vi.spyOn(PerkyModule.prototype, 'emit')
        
        inputMapper = new InputMapper({inputObserver: mockInputObserver})
    })


    afterEach(() => {
        vi.restoreAllMocks()
    })


    test('initialization', () => {
        expect(inputMapper.inputObserver).toBe(mockInputObserver)
        expect(inputMapper.mappings).toEqual({})
        expect(inputMapper.inputToAction).toEqual({})
        expect(inputMapper.pressedActions).toEqual({})
        expect(mockInputObserver.on).toHaveBeenCalledWith('keydown', expect.any(Function))
        expect(mockInputObserver.on).toHaveBeenCalledWith('keyup', expect.any(Function))
        expect(mockInputObserver.on).toHaveBeenCalledWith('mousedown', expect.any(Function))
        expect(mockInputObserver.on).toHaveBeenCalledWith('mouseup', expect.any(Function))
    })


    test('setInputFor', () => {
        inputMapper.setInputFor('jump', 'Space', 0)
        
        expect(inputMapper.mappings.jump[0]).toBe('Space')
        expect(inputMapper.inputToAction.Space).toBe('jump')
    })


    test('setInputFor with different slots', () => {
        inputMapper.setInputFor('jump', 'Space', 0)
        inputMapper.setInputFor('jump', 'ArrowUp', 1)
        
        expect(inputMapper.mappings.jump[0]).toBe('Space')
        expect(inputMapper.mappings.jump[1]).toBe('ArrowUp')
        expect(inputMapper.inputToAction.Space).toBe('jump')
        expect(inputMapper.inputToAction.ArrowUp).toBe('jump')
    })


    test('setInputsFor', () => {
        inputMapper.setInputsFor('jump', ['Space', 'ArrowUp'])
        
        expect(inputMapper.mappings.jump[0]).toBe('Space')
        expect(inputMapper.mappings.jump[1]).toBe('ArrowUp')
        expect(inputMapper.inputToAction.Space).toBe('jump')
        expect(inputMapper.inputToAction.ArrowUp).toBe('jump')
    })


    test('getInputFor', () => {
        inputMapper.setInputFor('jump', 'Space', 0)
        inputMapper.setInputFor('jump', 'ArrowUp', 1)
        
        expect(inputMapper.getInputFor('jump', 0)).toBe('Space')
        expect(inputMapper.getInputFor('jump', 1)).toBe('ArrowUp')
        expect(inputMapper.getInputFor('nonexistent')).toBeUndefined()
    })


    test('getInputsFor', () => {
        inputMapper.setInputFor('jump', 'Space', 0)
        inputMapper.setInputFor('jump', 'ArrowUp', 1)
        
        const inputs = inputMapper.getInputsFor('jump')
        expect(inputs).toContain('Space')
        expect(inputs).toContain('ArrowUp')
        expect(inputs.length).toBe(2)
        
        expect(inputMapper.getInputsFor('nonexistent')).toEqual([])
    })


    test('removeInputFor', () => {
        inputMapper.setInputFor('jump', 'Space', 0)
        inputMapper.setInputFor('jump', 'ArrowUp', 1)
        
        inputMapper.removeInputFor('jump', 'Space', 0)
        
        expect(inputMapper.getInputFor('jump', 0)).toBeUndefined()
        expect(inputMapper.getInputFor('jump', 1)).toBe('ArrowUp')
        expect(inputMapper.inputToAction.Space).toBeUndefined()
        expect(inputMapper.inputToAction.ArrowUp).toBe('jump')
    })


    test('getActionFor', () => {
        inputMapper.setInputFor('jump', 'Space')
        inputMapper.setInputFor('moveLeft', 'ArrowLeft')
        
        expect(inputMapper.getActionFor('Space')).toBe('jump')
        expect(inputMapper.getActionFor('ArrowLeft')).toBe('moveLeft')
        expect(inputMapper.getActionFor('nonexistent')).toBeUndefined()
    })


    test('isActionPressed with pressedActions cache', () => {
        inputMapper.pressedActions.jump = true
        
        expect(inputMapper.isActionPressed('jump')).toBe(true)
        expect(mockInputObserver.isPressed).not.toHaveBeenCalled()
    })


    test('isActionPressed checks inputs from observer', () => {
        inputMapper.setInputFor('jump', 'Space')
        mockInputObserver.isPressed.mockReturnValue(true)
        
        expect(inputMapper.isActionPressed('jump')).toBe(true)
        expect(mockInputObserver.isPressed).toHaveBeenCalledWith('Space')
    })


    test('isActionPressed with multiple inputs', () => {
        inputMapper.setInputsFor('jump', ['Space', 'ArrowUp'])
        
        mockInputObserver.isPressed.mockImplementation(input => {
            return input === 'ArrowUp'
        })
        
        expect(inputMapper.isActionPressed('jump')).toBe(true)
    })


    test('isInputPressed', () => {
        mockInputObserver.isPressed.mockReturnValue(true)
        
        expect(inputMapper.isInputPressed('Space')).toBe(true)
        expect(mockInputObserver.isPressed).toHaveBeenCalledWith('Space')
    })


    test('event handling - keydown', () => {
        inputMapper.setInputFor('jump', 'Space')

        const keydownHandler = mockInputObserver.on.mock.calls.find(
            call => call[0] === 'keydown'
        )[1]

        keydownHandler({code: 'Space'})

        expect(inputMapper.pressedActions.jump).toBe(true)
        expect(inputMapper.emit).toHaveBeenCalledWith('action', 'jump')
    })


    test('event handling - keyup', () => {
        inputMapper.setInputFor('jump', 'Space')
        inputMapper.pressedActions.jump = true

        const keyupHandler = mockInputObserver.on.mock.calls.find(
            call => call[0] === 'keyup'
        )[1]

        keyupHandler({code: 'Space'})

        expect(inputMapper.pressedActions.jump).toBeUndefined()
    })


    test('event handling - mousedown', () => {
        inputMapper.setInputFor('shoot', 'Mouse0')

        const mousedownHandler = mockInputObserver.on.mock.calls.find(
            call => call[0] === 'mousedown'
        )[1]

        mousedownHandler({button: 0})

        expect(inputMapper.pressedActions.shoot).toBe(true)
        expect(inputMapper.emit).toHaveBeenCalledWith('action', 'shoot')
    })


    test('event handling - mouseup', () => {
        inputMapper.setInputFor('shoot', 'Mouse0')
        inputMapper.pressedActions.shoot = true

        const mouseupHandler = mockInputObserver.on.mock.calls.find(
            call => call[0] === 'mouseup'
        )[1]

        mouseupHandler({button: 0})

        expect(inputMapper.pressedActions.shoot).toBeUndefined()
    })

})
