import {describe, test, expect, beforeEach, vi} from 'vitest'
import RenderPass from './render_pass.js'
import {createMockGLWithSpies} from '../../test/helpers.js'


class TestPass extends RenderPass {
    static shaderDefinition = {
        vertex: 'void main() {}',
        fragment: 'void main() {}',
        uniforms: ['uTexture', 'uValue'],
        attributes: ['aPosition', 'aTexCoord']
    }

    static defaultUniforms = {
        uValue: 1.0
    }
}


class NoShaderPass extends RenderPass {}


function createMockProgram () {
    return {
        use: vi.fn(),
        setUniform1i: vi.fn(),
        setUniform1f: vi.fn(),
        setUniform2f: vi.fn(),
        setUniform3f: vi.fn(),
        setUniform4f: vi.fn(),
        attributes: {aPosition: 0, aTexCoord: 1}
    }
}


function createMockShaderRegistry (program) {
    return {
        register: vi.fn(() => program)
    }
}


function createMockQuad () {
    return {
        draw: vi.fn()
    }
}


describe(RenderPass, () => {

    test('static shaderDefinition is null by default', () => {
        expect(RenderPass.shaderDefinition).toBeNull()
    })


    test('static defaultUniforms is empty by default', () => {
        expect(RenderPass.defaultUniforms).toEqual({})
    })


    test('static uniformConfig is empty by default', () => {
        expect(RenderPass.uniformConfig).toEqual({})
    })


    test('constructor copies defaultUniforms', () => {
        const pass = new TestPass()
        expect(pass.uniforms.uValue).toBe(1.0)
    })


    test('enabled getter and setter', () => {
        const pass = new TestPass()
        expect(pass.enabled).toBe(true)
        pass.enabled = false
        expect(pass.enabled).toBe(false)
    })


    test('program getter', () => {
        const pass = new TestPass()
        expect(pass.program).toBeNull()
    })


    test('uniforms getter', () => {
        const pass = new TestPass()
        expect(pass.uniforms).toEqual({uValue: 1.0})
    })


    describe('init', () => {

        test('registers shader with registry', () => {
            const pass = new TestPass()
            const program = createMockProgram()
            const registry = createMockShaderRegistry(program)

            pass.init(registry)

            expect(registry.register).toHaveBeenCalled()
            expect(pass.program).toBe(program)
        })


        test('throws if shaderDefinition not defined', () => {
            const pass = new NoShaderPass()
            const registry = createMockShaderRegistry(createMockProgram())

            expect(() => pass.init(registry)).toThrow('NoShaderPass.shaderDefinition must be defined')
        })

    })


    test('setUniform', () => {
        const pass = new TestPass()
        const result = pass.setUniform('uValue', 2.0)

        expect(result).toBe(pass)
        expect(pass.uniforms.uValue).toBe(2.0)
    })


    describe('render', () => {

        let pass
        let program
        let gl
        let quad

        beforeEach(() => {
            pass = new TestPass()
            program = createMockProgram()
            pass.init(createMockShaderRegistry(program))
            gl = createMockGLWithSpies()
            quad = createMockQuad()
        })


        test('uses program and binds texture', () => {
            const texture = {}
            pass.render(gl, texture, quad)

            expect(program.use).toHaveBeenCalled()
            expect(gl.activeTexture).toHaveBeenCalledWith(gl.TEXTURE0)
            expect(gl.bindTexture).toHaveBeenCalledWith(gl.TEXTURE_2D, texture)
            expect(program.setUniform1i).toHaveBeenCalledWith('uTexture', 0)
        })


        test('draws quad', () => {
            pass.render(gl, {}, quad)
            expect(quad.draw).toHaveBeenCalledWith(gl, program)
        })


        test('does nothing when disabled', () => {
            pass.enabled = false
            pass.render(gl, {}, quad)

            expect(program.use).not.toHaveBeenCalled()
            expect(quad.draw).not.toHaveBeenCalled()
        })


        test('does nothing when no program', () => {
            const newPass = new TestPass()
            newPass.render(gl, {}, quad)

            expect(quad.draw).not.toHaveBeenCalled()
        })

    })


    describe('applyUniforms', () => {

        let pass
        let program

        beforeEach(() => {
            pass = new TestPass()
            program = createMockProgram()
            pass.init(createMockShaderRegistry(program))
        })


        test('applies number uniforms', () => {
            pass.setUniform('uValue', 2.5)
            pass.applyUniforms()

            expect(program.setUniform1f).toHaveBeenCalledWith('uValue', 2.5)
        })


        test('applies vec2 uniforms', () => {
            pass.setUniform('uVec2', [1.0, 2.0])
            pass.applyUniforms()

            expect(program.setUniform2f).toHaveBeenCalledWith('uVec2', 1.0, 2.0)
        })


        test('applies vec3 uniforms', () => {
            pass.setUniform('uVec3', [1.0, 2.0, 3.0])
            pass.applyUniforms()

            expect(program.setUniform3f).toHaveBeenCalledWith('uVec3', 1.0, 2.0, 3.0)
        })


        test('applies vec4 uniforms', () => {
            pass.setUniform('uVec4', [1.0, 2.0, 3.0, 4.0])
            pass.applyUniforms()

            expect(program.setUniform4f).toHaveBeenCalledWith('uVec4', [1.0, 2.0, 3.0, 4.0])
        })


        test('ignores non-number non-array values', () => {
            pass.setUniform('uObject', {})
            pass.applyUniforms()

            expect(program.setUniform1f).not.toHaveBeenCalledWith('uObject', expect.anything())
        })

    })


    test('dispose', () => {
        const pass = new TestPass()
        const program = createMockProgram()
        pass.init(createMockShaderRegistry(program))

        pass.dispose()

        expect(pass.program).toBeNull()
        expect(pass.uniforms).toEqual({})
    })

})
