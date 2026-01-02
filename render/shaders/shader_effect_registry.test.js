import {describe, test, expect, beforeEach, vi} from 'vitest'
import ShaderEffectRegistry from './shader_effect_registry.js'
import ShaderEffect from './shader_effect.js'


function createMockGL () {
    return {
        VERTEX_SHADER: 0x8B31,
        FRAGMENT_SHADER: 0x8B30,
        COMPILE_STATUS: 0x8B81,
        LINK_STATUS: 0x8B82,

        createShader: vi.fn(() => ({})),
        shaderSource: vi.fn(),
        compileShader: vi.fn(),
        getShaderParameter: vi.fn(() => true),
        getShaderInfoLog: vi.fn(() => ''),
        deleteShader: vi.fn(),
        createProgram: vi.fn(() => ({})),
        attachShader: vi.fn(),
        linkProgram: vi.fn(),
        getProgramParameter: vi.fn(() => true),
        getProgramInfoLog: vi.fn(() => ''),
        deleteProgram: vi.fn(),
        useProgram: vi.fn(),
        getUniformLocation: vi.fn((p, name) => ({name})),
        getAttribLocation: vi.fn(() => 0)
    }
}


function createMockShaderRegistry () {
    return {
        register: vi.fn((id, def) => ({
            id,
            vertex: def.vertex,
            fragment: def.fragment,
            uniforms: def.uniforms,
            attributes: def.attributes
        }))
    }
}


class ChromaticEffect extends ShaderEffect {
    static shader = {
        params: ['intensity'],
        uniforms: [],
        fragment: `
            vec2 offset = texelSize * intensity * 50.0;
            color.r = texture(uTexture, texCoord + vec2(offset.x, 0.0)).r;
        `
    }

    intensity = 0.5
}


class WaveEffect extends ShaderEffect {
    static shader = {
        params: ['amplitude', 'frequency'],
        uniforms: ['uTime'],
        fragment: `
            float wave = sin(texCoord.x * frequency + uTime) * amplitude;
            color.g += wave * 0.1;
        `
    }

    amplitude = 1.0
    frequency = 10.0
}


describe('ShaderEffectRegistry', () => {

    let gl
    let shaderRegistry
    let registry

    beforeEach(() => {
        gl = createMockGL()
        shaderRegistry = createMockShaderRegistry()
        registry = new ShaderEffectRegistry(gl, shaderRegistry)
    })


    describe('register', () => {

        test('registers an effect class', () => {
            registry.register(ChromaticEffect)
            expect(registry.has('ChromaticEffect')).toBe(true)
        })


        test('returns this for chaining', () => {
            const result = registry.register(ChromaticEffect)
            expect(result).toBe(registry)
        })

    })


    describe('get', () => {

        test('returns registered effect class', () => {
            registry.register(ChromaticEffect)
            expect(registry.get('ChromaticEffect')).toBe(ChromaticEffect)
        })


        test('returns null for unregistered effect', () => {
            expect(registry.get('NonExistent')).toBeNull()
        })

    })


    describe('has', () => {

        test('returns true for registered effect', () => {
            registry.register(ChromaticEffect)
            expect(registry.has('ChromaticEffect')).toBe(true)
        })


        test('returns false for unregistered effect', () => {
            expect(registry.has('ChromaticEffect')).toBe(false)
        })

    })


    describe('getShaderForEffects', () => {

        test('compiles shader for single effect', () => {
            registry.register(ChromaticEffect)
            const shader = registry.getShaderForEffects(['ChromaticEffect'])

            expect(shaderRegistry.register).toHaveBeenCalled()
            expect(shader).toBeDefined()
        })


        test('caches compiled shader', () => {
            registry.register(ChromaticEffect)

            registry.getShaderForEffects(['ChromaticEffect'])
            registry.getShaderForEffects(['ChromaticEffect'])

            expect(shaderRegistry.register).toHaveBeenCalledTimes(1)
        })


        test('generates different shaders for different combinations', () => {
            registry.register(ChromaticEffect)
            registry.register(WaveEffect)

            registry.getShaderForEffects(['ChromaticEffect'])
            registry.getShaderForEffects(['WaveEffect'])
            registry.getShaderForEffects(['ChromaticEffect', 'WaveEffect'])

            expect(shaderRegistry.register).toHaveBeenCalledTimes(3)
        })


        test('generates same shader regardless of effect order', () => {
            registry.register(ChromaticEffect)
            registry.register(WaveEffect)

            registry.getShaderForEffects(['ChromaticEffect', 'WaveEffect'])
            registry.getShaderForEffects(['WaveEffect', 'ChromaticEffect'])

            expect(shaderRegistry.register).toHaveBeenCalledTimes(1)
        })


        test('includes effect fragment in generated shader', () => {
            registry.register(ChromaticEffect)
            registry.getShaderForEffects(['ChromaticEffect'])

            const call = shaderRegistry.register.mock.calls[0]
            const fragmentSource = call[1].fragment

            expect(fragmentSource).toContain('ChromaticEffect')
            expect(fragmentSource).toContain('intensity')
        })


        test('includes custom uniforms', () => {
            registry.register(WaveEffect)
            registry.getShaderForEffects(['WaveEffect'])

            const call = shaderRegistry.register.mock.calls[0]
            const uniforms = call[1].uniforms

            expect(uniforms).toContain('uTime')
        })


        test('generates base shader for empty effects', () => {
            const shader = registry.getShaderForEffects([])
            expect(shader).toBeDefined()
        })

    })


    describe('param slot allocation', () => {

        test('assigns correct slots for single effect', () => {
            registry.register(ChromaticEffect)
            registry.getShaderForEffects(['ChromaticEffect'])

            const call = shaderRegistry.register.mock.calls[0]
            const fragmentSource = call[1].fragment

            expect(fragmentSource).toContain('float intensity = effectParams.x;')
        })


        test('assigns sequential slots for multiple effects', () => {
            registry.register(ChromaticEffect)
            registry.register(WaveEffect)
            registry.getShaderForEffects(['ChromaticEffect', 'WaveEffect'])

            const call = shaderRegistry.register.mock.calls[0]
            const fragmentSource = call[1].fragment

            expect(fragmentSource).toContain('float intensity = effectParams.x;')
            expect(fragmentSource).toContain('float amplitude = effectParams.y;')
            expect(fragmentSource).toContain('float frequency = effectParams.z;')
        })


        test('warns when exceeding 4 params limit', () => {
            const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

            class ManyParamsEffect extends ShaderEffect {
                static shader = {
                    params: ['p1', 'p2', 'p3', 'p4', 'p5'],
                    uniforms: [],
                    fragment: 'color.r += p1;'
                }
            }

            registry.register(ManyParamsEffect)
            registry.getShaderForEffects(['ManyParamsEffect'])

            expect(warnSpy).toHaveBeenCalledWith(
                expect.stringContaining('p5')
            )

            warnSpy.mockRestore()
        })

    })


    describe('dispose', () => {

        test('clears all registered effects', () => {
            registry.register(ChromaticEffect)
            registry.register(WaveEffect)

            registry.dispose()

            expect(registry.has('ChromaticEffect')).toBe(false)
            expect(registry.has('WaveEffect')).toBe(false)
        })

    })

})
