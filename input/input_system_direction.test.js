import {describe, beforeEach} from 'vitest'
import InputSystem from './input_system'
import ButtonControl from './input_controls/button_control'
import PerkyModule from '../core/perky_module'
import Vec2 from '../math/vec2'


describe('InputSystem.direction', () => {

    let inputSystem

    beforeEach(() => {
        const mockHost = new PerkyModule({name: 'mockHost'})
        inputSystem = new InputSystem()
        inputSystem.install(mockHost)

        // Setup WASD bindings
        inputSystem.bindKey('KeyW', 'moveUp')
        inputSystem.bindKey('KeyA', 'moveLeft')
        inputSystem.bindKey('KeyS', 'moveDown')
        inputSystem.bindKey('KeyD', 'moveRight')
    })


    test('returns zero vector when no keys pressed', () => {
        const dir = inputSystem.direction()

        expect(dir).toBeInstanceOf(Vec2)
        expect(dir.x).toBe(0)
        expect(dir.y).toBe(0)
    })


    test('returns up vector when W pressed', () => {
        const wControl = inputSystem.keyboard.findOrCreateControl(ButtonControl, {name: 'KeyW'})
        wControl.press()

        const dir = inputSystem.direction()

        expect(dir.x).toBe(0)
        expect(dir.y).toBe(1)
    })


    test('returns normalized diagonal when W+D pressed', () => {
        const wControl = inputSystem.keyboard.findOrCreateControl(ButtonControl, {name: 'KeyW'})
        const dControl = inputSystem.keyboard.findOrCreateControl(ButtonControl, {name: 'KeyD'})
        wControl.press()
        dControl.press()

        const dir = inputSystem.direction()

        // Diagonal should be normalized (≈0.707, 0.707)
        expect(dir.x).toBeCloseTo(Math.SQRT1_2, 5)
        expect(dir.y).toBeCloseTo(Math.SQRT1_2, 5)
        expect(dir.length()).toBeCloseTo(1, 5)
    })


    test('returns left vector when A pressed', () => {
        const aControl = inputSystem.keyboard.findOrCreateControl(ButtonControl, {name: 'KeyA'})
        aControl.press()

        const dir = inputSystem.direction()

        expect(dir.x).toBe(-1)
        expect(dir.y).toBe(0)
    })


    test('cancels opposite directions', () => {
        const wControl = inputSystem.keyboard.findOrCreateControl(ButtonControl, {name: 'KeyW'})
        const sControl = inputSystem.keyboard.findOrCreateControl(ButtonControl, {name: 'KeyS'})
        wControl.press()
        sControl.press()

        const dir = inputSystem.direction()

        expect(dir.x).toBe(0)
        expect(dir.y).toBe(0)
    })


    test('works with custom direction name', () => {
        inputSystem.bindKey('ArrowUp', 'aimUp')
        inputSystem.bindKey('ArrowDown', 'aimDown')
        inputSystem.bindKey('ArrowLeft', 'aimLeft')
        inputSystem.bindKey('ArrowRight', 'aimRight')

        const upControl = inputSystem.keyboard.findOrCreateControl(ButtonControl, {name: 'ArrowUp'})
        upControl.press()

        const dir = inputSystem.direction('aim')

        expect(dir.x).toBe(0)
        expect(dir.y).toBe(1)
    })


    test('returns correct vector for all 8 directions', () => {
        const testDirections = [
            {keys: ['KeyW'], expected: {x: 0, y: 1}},
            {keys: ['KeyD'], expected: {x: 1, y: 0}},
            {keys: ['KeyS'], expected: {x: 0, y: -1}},
            {keys: ['KeyA'], expected: {x: -1, y: 0}},
            {keys: ['KeyW', 'KeyD'], expected: {x: Math.SQRT1_2, y: Math.SQRT1_2}},
            {keys: ['KeyS', 'KeyD'], expected: {x: Math.SQRT1_2, y: -Math.SQRT1_2}},
            {keys: ['KeyS', 'KeyA'], expected: {x: -Math.SQRT1_2, y: -Math.SQRT1_2}},
            {keys: ['KeyW', 'KeyA'], expected: {x: -Math.SQRT1_2, y: Math.SQRT1_2}}
        ]

        testDirections.forEach(({keys, expected}) => {
            ['KeyW', 'KeyA', 'KeyS', 'KeyD'].forEach(key => { // eslint-disable-line max-nested-callbacks
                const control = inputSystem.keyboard.getControl(key)
                if (control) {
                    control.release()
                }
            })

            keys.forEach(key => { // eslint-disable-line max-nested-callbacks
                const control = inputSystem.keyboard.findOrCreateControl(ButtonControl, {name: key})
                control.press()
            })

            const dir = inputSystem.direction()
            expect(dir.x).toBeCloseTo(expected.x, 5)
            expect(dir.y).toBeCloseTo(expected.y, 5)
        })
    })

})
