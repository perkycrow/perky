import {describe, test, expect, vi} from 'vitest'
import {emitChange, handleAttributeChange} from './base_input.js'


describe('base_input', () => {

    describe('emitChange', () => {

        test('dispatches CustomEvent with detail', () => {
            const element = document.createElement('div')
            const handler = vi.fn()
            element.addEventListener('change', handler)

            emitChange(element, {value: 42})

            expect(handler).toHaveBeenCalled()
            expect(handler.mock.calls[0][0].detail).toEqual({value: 42})
        })


        test('bubbles', () => {
            const parent = document.createElement('div')
            const child = document.createElement('div')
            parent.appendChild(child)
            const handler = vi.fn()
            parent.addEventListener('change', handler)

            emitChange(child, {value: 10})

            expect(handler).toHaveBeenCalled()
        })

    })


    describe('handleAttributeChange', () => {

        test('returns false if old and new values are the same', () => {
            const component = {}
            const result = handleAttributeChange(component, 'value', '10', '10')
            expect(result).toBe(false)
        })


        test('calls setValue for value attribute', () => {
            const component = {setValue: vi.fn()}
            const result = handleAttributeChange(component, 'value', null, '42')
            expect(result).toBe(true)
            expect(component.setValue).toHaveBeenCalledWith(42)
        })


        test('calls setMin for min attribute', () => {
            const component = {setMin: vi.fn()}
            const result = handleAttributeChange(component, 'min', null, '5')
            expect(result).toBe(true)
            expect(component.setMin).toHaveBeenCalledWith(5)
        })


        test('calls setMax for max attribute', () => {
            const component = {setMax: vi.fn()}
            const result = handleAttributeChange(component, 'max', null, '100')
            expect(result).toBe(true)
            expect(component.setMax).toHaveBeenCalledWith(100)
        })


        test('calls setStep for step attribute', () => {
            const component = {setStep: vi.fn()}
            const result = handleAttributeChange(component, 'step', null, '0.5')
            expect(result).toBe(true)
            expect(component.setStep).toHaveBeenCalledWith(0.5)
        })


        test('calls setLabel for label attribute', () => {
            const component = {setLabel: vi.fn()}
            const result = handleAttributeChange(component, 'label', null, 'x')
            expect(result).toBe(true)
            expect(component.setLabel).toHaveBeenCalledWith('x')
        })


        test('calls setPrecision for precision attribute', () => {
            const component = {setPrecision: vi.fn()}
            const result = handleAttributeChange(component, 'precision', null, '3')
            expect(result).toBe(true)
            expect(component.setPrecision).toHaveBeenCalledWith(3)
        })


        test('calls setChecked for checked attribute', () => {
            const component = {setChecked: vi.fn()}
            const result = handleAttributeChange(component, 'checked', null, '')
            expect(result).toBe(true)
            expect(component.setChecked).toHaveBeenCalledWith(true)
        })


        test('calls setChecked with false when checked is removed', () => {
            const component = {setChecked: vi.fn()}
            const result = handleAttributeChange(component, 'checked', '', null)
            expect(result).toBe(true)
            expect(component.setChecked).toHaveBeenCalledWith(false)
        })


        test('returns false for unknown attributes', () => {
            const component = {}
            const result = handleAttributeChange(component, 'unknown', null, 'value')
            expect(result).toBe(false)
        })


        test('uses default value 0 for invalid number in value', () => {
            const component = {setValue: vi.fn()}
            handleAttributeChange(component, 'value', null, 'invalid')
            expect(component.setValue).toHaveBeenCalledWith(0)
        })


        test('uses default value 100 for invalid max', () => {
            const component = {setMax: vi.fn()}
            handleAttributeChange(component, 'max', null, 'invalid')
            expect(component.setMax).toHaveBeenCalledWith(100)
        })


        test('uses empty string for null label', () => {
            const component = {setLabel: vi.fn()}
            handleAttributeChange(component, 'label', 'old', null)
            expect(component.setLabel).toHaveBeenCalledWith('')
        })

    })

})
