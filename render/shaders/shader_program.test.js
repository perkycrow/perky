import {describe, test, expect, beforeEach, vi} from 'vitest'
import ShaderProgram from './shader_program.js'


const VERTEX_SOURCE = `#version 300 es
in vec2 aPosition;
uniform mat3 uMatrix;
void main() {
    gl_Position = vec4(aPosition, 0.0, 1.0);
}`

const FRAGMENT_SOURCE = `#version 300 es
precision mediump float;
out vec4 fragColor;
void main() {
    fragColor = vec4(1.0);
}`


function createMockGL () {
    const shaders = []
    const programs = []

    return {
        VERTEX_SHADER: 0x8B31,
        FRAGMENT_SHADER: 0x8B30,
        COMPILE_STATUS: 0x8B81,
        LINK_STATUS: 0x8B82,

        createShader: vi.fn((type) => {
            const shader = {id: shaders.length, type}
            shaders.push(shader)
            return shader
        }),

        shaderSource: vi.fn(),

        compileShader: vi.fn(),

        getShaderParameter: vi.fn(() => true),

        getShaderInfoLog: vi.fn(() => ''),

        deleteShader: vi.fn(),

        createProgram: vi.fn(() => {
            const program = {id: programs.length}
            programs.push(program)
            return program
        }),

        attachShader: vi.fn(),

        linkProgram: vi.fn(),

        getProgramParameter: vi.fn(() => true),

        getProgramInfoLog: vi.fn(() => ''),

        deleteProgram: vi.fn(),

        useProgram: vi.fn(),

        getUniformLocation: vi.fn((program, name) => ({program, name})),

        getAttribLocation: vi.fn((program, name) => shaders.length + programs.length),

        uniform1f: vi.fn(),

        uniform2f: vi.fn(),

        uniform3f: vi.fn(),

        uniform4f: vi.fn(),

        uniform1i: vi.fn(),

        uniformMatrix3fv: vi.fn(),

        uniformMatrix4fv: vi.fn()
    }
}


describe(ShaderProgram, () => {

    let gl
    let program

    beforeEach(() => {
        gl = createMockGL()
        program = new ShaderProgram(gl, VERTEX_SOURCE, FRAGMENT_SOURCE)
    })


    test('constructor creates program', () => {
        expect(gl.createProgram).toHaveBeenCalled()
        expect(gl.createShader).toHaveBeenCalledTimes(2)
        expect(gl.linkProgram).toHaveBeenCalled()
    })


    test('program getter', () => {
        expect(program.program).toBeDefined()
        expect(program.program).not.toBeNull()
    })


    test('uniforms getter', () => {
        expect(program.uniforms).toEqual({})
    })


    test('attributes getter', () => {
        expect(program.attributes).toEqual({})
    })


    test('registerUniform', () => {
        program.registerUniform('uMatrix')
        expect(gl.getUniformLocation).toHaveBeenCalled()
        expect(program.uniforms.uMatrix).toBeDefined()
    })


    test('registerUniform returns this', () => {
        const result = program.registerUniform('uMatrix')
        expect(result).toBe(program)
    })


    test('registerAttribute', () => {
        program.registerAttribute('aPosition')
        expect(gl.getAttribLocation).toHaveBeenCalled()
        expect(program.attributes.aPosition).toBeDefined()
    })


    test('registerAttribute returns this', () => {
        const result = program.registerAttribute('aPosition')
        expect(result).toBe(program)
    })


    test('use', () => {
        program.use()
        expect(gl.useProgram).toHaveBeenCalled()
    })


    test('use returns this', () => {
        const result = program.use()
        expect(result).toBe(program)
    })


    test('setUniform1f', () => {
        program.registerUniform('uValue')
        program.setUniform1f('uValue', 1.5)
        expect(gl.uniform1f).toHaveBeenCalledWith(program.uniforms.uValue, 1.5)
    })


    test('setUniform2f', () => {
        program.registerUniform('uVec')
        program.setUniform2f('uVec', 1.0, 2.0)
        expect(gl.uniform2f).toHaveBeenCalledWith(program.uniforms.uVec, 1.0, 2.0)
    })


    test('setUniform3f', () => {
        program.registerUniform('uVec')
        program.setUniform3f('uVec', 1.0, 2.0, 3.0)
        expect(gl.uniform3f).toHaveBeenCalledWith(program.uniforms.uVec, 1.0, 2.0, 3.0)
    })


    test('setUniform4f', () => {
        program.registerUniform('uColor')
        program.setUniform4f('uColor', [1.0, 0.5, 0.25, 1.0])
        expect(gl.uniform4f).toHaveBeenCalledWith(program.uniforms.uColor, 1.0, 0.5, 0.25, 1.0)
    })


    test('setUniform1i', () => {
        program.registerUniform('uTexture')
        program.setUniform1i('uTexture', 0)
        expect(gl.uniform1i).toHaveBeenCalledWith(program.uniforms.uTexture, 0)
    })


    test('setUniformMatrix3fv', () => {
        program.registerUniform('uMatrix')
        const matrix = new Float32Array(9)
        program.setUniformMatrix3fv('uMatrix', false, matrix)
        expect(gl.uniformMatrix3fv).toHaveBeenCalledWith(program.uniforms.uMatrix, false, matrix)
    })


    test('setUniformMatrix4fv', () => {
        program.registerUniform('uMatrix')
        const matrix = new Float32Array(16)
        program.setUniformMatrix4fv('uMatrix', false, matrix)
        expect(gl.uniformMatrix4fv).toHaveBeenCalledWith(program.uniforms.uMatrix, false, matrix)
    })


    test('dispose', () => {
        program.dispose()
        expect(gl.deleteProgram).toHaveBeenCalled()
        expect(program.program).toBeNull()
        expect(program.uniforms).toEqual({})
        expect(program.attributes).toEqual({})
    })

})


describe('ShaderProgram compilation errors', () => {

    test('throws on shader compilation failure', () => {
        const gl = createMockGL()
        gl.getShaderParameter = vi.fn(() => false)
        gl.getShaderInfoLog = vi.fn(() => 'Syntax error')

        expect(() => new ShaderProgram(gl, VERTEX_SOURCE, FRAGMENT_SOURCE))
            .toThrow('Shader compilation failed: Syntax error')
    })


    test('throws on program link failure', () => {
        const gl = createMockGL()
        gl.getProgramParameter = vi.fn(() => false)
        gl.getProgramInfoLog = vi.fn(() => 'Link error')

        expect(() => new ShaderProgram(gl, VERTEX_SOURCE, FRAGMENT_SOURCE))
            .toThrow('Program linking failed: Link error')
    })

})
