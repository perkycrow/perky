import {describe, test, expect, beforeEach} from 'vitest'
import ShaderRegistry from './shader_registry.js'
import {createMockGLWithSpies} from '../test_helpers.js'


const VERTEX_SOURCE = `#version 300 es
in vec2 aPosition;
void main() {
    gl_Position = vec4(aPosition, 0.0, 1.0);
}`

const FRAGMENT_SOURCE = `#version 300 es
precision mediump float;
out vec4 fragColor;
void main() {
    fragColor = vec4(1.0);
}`


describe(ShaderRegistry, () => {

    let gl
    let registry

    beforeEach(() => {
        gl = createMockGLWithSpies()
        registry = new ShaderRegistry(gl)
    })


    test('register', () => {
        const program = registry.register('test', {
            vertex: VERTEX_SOURCE,
            fragment: FRAGMENT_SOURCE
        })
        expect(program).toBeDefined()
        expect(program.program).toBeDefined()
    })


    test('register with uniforms', () => {
        const program = registry.register('test', {
            vertex: VERTEX_SOURCE,
            fragment: FRAGMENT_SOURCE,
            uniforms: ['uMatrix']
        })
        expect(program.uniforms.uMatrix).toBeDefined()
    })


    test('register with attributes', () => {
        const program = registry.register('test', {
            vertex: VERTEX_SOURCE,
            fragment: FRAGMENT_SOURCE,
            attributes: ['aPosition']
        })
        expect(program.attributes.aPosition).toBeDefined()
    })


    test('get returns registered program', () => {
        const registered = registry.register('test', {
            vertex: VERTEX_SOURCE,
            fragment: FRAGMENT_SOURCE
        })
        const retrieved = registry.get('test')
        expect(retrieved).toBe(registered)
    })


    test('get returns null for unregistered id', () => {
        expect(registry.get('nonexistent')).toBeNull()
    })


    test('has returns true for registered id', () => {
        registry.register('test', {
            vertex: VERTEX_SOURCE,
            fragment: FRAGMENT_SOURCE
        })
        expect(registry.has('test')).toBe(true)
    })


    test('has returns false for unregistered id', () => {
        expect(registry.has('nonexistent')).toBe(false)
    })


    test('setDefault', () => {
        registry.register('test', {
            vertex: VERTEX_SOURCE,
            fragment: FRAGMENT_SOURCE
        })
        const result = registry.setDefault('sprite', 'test')
        expect(result).toBe(registry)
    })


    test('getDefault returns program for registered default', () => {
        const program = registry.register('test', {
            vertex: VERTEX_SOURCE,
            fragment: FRAGMENT_SOURCE
        })
        registry.setDefault('sprite', 'test')
        expect(registry.getDefault('sprite')).toBe(program)
    })


    test('getDefault returns null for unregistered default', () => {
        expect(registry.getDefault('sprite')).toBeNull()
    })


    test('unregister disposes and removes program', () => {
        registry.register('test', {
            vertex: VERTEX_SOURCE,
            fragment: FRAGMENT_SOURCE
        })
        registry.unregister('test')
        expect(registry.get('test')).toBeNull()
        expect(gl.deleteProgram).toHaveBeenCalled()
    })


    test('unregister removes associated defaults', () => {
        registry.register('test', {
            vertex: VERTEX_SOURCE,
            fragment: FRAGMENT_SOURCE
        })
        registry.setDefault('sprite', 'test')
        registry.unregister('test')
        expect(registry.getDefault('sprite')).toBeNull()
    })


    test('unregister returns this', () => {
        const result = registry.unregister('nonexistent')
        expect(result).toBe(registry)
    })


    test('dispose clears all programs', () => {
        registry.register('test1', {
            vertex: VERTEX_SOURCE,
            fragment: FRAGMENT_SOURCE
        })
        registry.register('test2', {
            vertex: VERTEX_SOURCE,
            fragment: FRAGMENT_SOURCE
        })
        registry.setDefault('sprite', 'test1')

        registry.dispose()

        expect(registry.get('test1')).toBeNull()
        expect(registry.get('test2')).toBeNull()
        expect(registry.getDefault('sprite')).toBeNull()
        expect(gl.deleteProgram).toHaveBeenCalledTimes(2)
    })

})
