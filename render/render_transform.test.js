import {describe, test, expect} from 'vitest'
import RenderTransform from './render_transform.js'


describe(RenderTransform, () => {

    test('constructor defaults enabled to true', () => {
        const transform = new RenderTransform()
        expect(transform.enabled).toBe(true)
    })


    test('constructor accepts enabled option', () => {
        const transform = new RenderTransform({enabled: false})
        expect(transform.enabled).toBe(false)
    })


    test('init', () => {
        const transform = new RenderTransform()
        expect(() => transform.init()).not.toThrow()
    })


    test('apply returns matrices unchanged', () => {
        const transform = new RenderTransform()
        const matrices = {projection: [1, 0, 0], view: [0, 1, 0]}
        const result = transform.apply({}, matrices)
        expect(result).toBe(matrices)
    })


    test('getProgram returns null', () => {
        const transform = new RenderTransform()
        expect(transform.getProgram()).toBeNull()
    })


    test('applyUniforms', () => {
        const transform = new RenderTransform()
        expect(() => transform.applyUniforms()).not.toThrow()
    })


    test('dispose', () => {
        const transform = new RenderTransform()
        expect(() => transform.dispose()).not.toThrow()
    })

})
