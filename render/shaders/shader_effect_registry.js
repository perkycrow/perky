import {SPRITE_VERTEX} from './builtin/sprite_shader.js'
import logger from '../../core/logger.js'


const SPRITE_ATTRIBUTES = ['aPosition', 'aTexCoord', 'aOpacity', 'aTintColor', 'aEffectParams']

const PARAM_SLOTS = ['x', 'y', 'z', 'w']


const DEFAULT_UNIFORM_TYPES = {
    uTime: 'float'
}


export default class ShaderEffectRegistry {

    #gl = null
    #shaderRegistry = null
    #effects = new Map()
    #shaderCache = new Map()
    #uniformValues = new Map()
    #uniformTypes = new Map()

    constructor (gl, shaderRegistry) {
        this.#gl = gl
        this.#shaderRegistry = shaderRegistry
    }


    setUniform (name, value, type = null) {
        this.#uniformValues.set(name, value)
        if (type) {
            this.#uniformTypes.set(name, type)
        }
        return this
    }


    getUniform (name) {
        return this.#uniformValues.get(name)
    }


    applyUniforms (gl, program) {
        const uniformSetters = {
            float: (loc, val) => gl.uniform1f(loc, val),
            vec2: (loc, val) => gl.uniform2fv(loc, val),
            vec3: (loc, val) => gl.uniform3fv(loc, val),
            vec4: (loc, val) => gl.uniform4fv(loc, val),
            int: (loc, val) => gl.uniform1i(loc, val)
        }

        for (const [name, value] of this.#uniformValues) {
            const location = program.uniforms[name]
            if (location === undefined || location === -1) {
                continue
            }

            const type = this.#uniformTypes.get(name) || DEFAULT_UNIFORM_TYPES[name] || 'float'
            const setter = uniformSetters[type] || uniformSetters.float
            setter(location, value)
        }
    }


    register (EffectClass) {
        const name = EffectClass.name
        this.#effects.set(name, EffectClass)
        return this
    }


    get (name) {
        return this.#effects.get(name) || null
    }


    has (name) {
        return this.#effects.has(name)
    }


    getShaderForEffects (effectTypes) {
        const sortedTypes = [...effectTypes].sort()
        const cacheKey = sortedTypes.join('|') || 'base'

        if (this.#shaderCache.has(cacheKey)) {
            return this.#shaderCache.get(cacheKey)
        }

        const shader = this.#compileShader(sortedTypes, cacheKey)
        this.#shaderCache.set(cacheKey, shader)
        return shader
    }


    #collectUniforms (effectUniforms, uniforms) {
        for (const uniform of effectUniforms) {
            const {name, type} = this.#parseUniform(uniform)
            if (name) {
                uniforms.set(name, type)
            }
        }
    }


    #parseUniform (uniform) {
        if (typeof uniform === 'string') {
            const type = this.#uniformTypes.get(uniform) || DEFAULT_UNIFORM_TYPES[uniform] || 'float'
            return {name: uniform, type}
        }
        if (uniform.name && uniform.type) {
            return {name: uniform.name, type: uniform.type}
        }
        return {name: null, type: null}
    }


    #compileShader (effectTypes, cacheKey) {
        const fragments = []
        const uniforms = new Map([
            ['uTexture', 'sampler2D'],
            ['uTexelSize', 'vec2'],
            ['uProjectionMatrix', 'mat3'],
            ['uViewMatrix', 'mat3'],
            ['uModelMatrix', 'mat3']
        ])

        let paramOffset = 0

        for (const typeName of effectTypes) {
            const Effect = this.#effects.get(typeName)

            if (Effect?.shader?.fragment) {
                const snippet = wrapSnippet(Effect, paramOffset)
                fragments.push(snippet)

                paramOffset += Effect.shader.params?.length || 0

                this.#collectUniforms(Effect.shader.uniforms || [], uniforms)
            }
        }

        const fragmentSource = buildFragment(fragments, uniforms)

        return this.#shaderRegistry.register(`sprite_effect_${cacheKey}`, {
            vertex: SPRITE_VERTEX,
            fragment: fragmentSource,
            uniforms: Array.from(uniforms.keys()),
            attributes: SPRITE_ATTRIBUTES
        })
    }


    dispose () {
        this.#effects.clear()
        this.#shaderCache.clear()
        this.#uniformValues.clear()
        this.#uniformTypes.clear()
        this.#gl = null
        this.#shaderRegistry = null
    }

}


function wrapSnippet (EffectClass, paramOffset) {
    const {params = [], fragment} = EffectClass.shader
    const name = EffectClass.name

    const paramDeclarations = params.map((paramName, index) => {
        const globalIndex = paramOffset + index

        if (globalIndex >= 4) {
            logger.warn(`[ShaderEffect] ${name}: param "${paramName}" exceeds 4 params limit, ignored`)
            return null
        }

        const slot = PARAM_SLOTS[globalIndex]
        return `float ${paramName} = effectParams.${slot};`
    }).filter(Boolean).join('\n        ')

    return `
    // === ${name} ===
    {
        ${paramDeclarations}
        ${fragment}
    }
    // === End ${name} ===`
}


function buildFragment (snippets, uniforms) {
    const uniformDeclarations = Array.from(uniforms.entries())
        .filter(([name]) => name !== 'uTexture' && name !== 'uTexelSize')
        .filter(([name]) => !name.startsWith('uProjection') && !name.startsWith('uView') && !name.startsWith('uModel'))
        .map(([name, type]) => `uniform ${type} ${name};`)
        .join('\n')

    return `#version 300 es
precision mediump float;

uniform sampler2D uTexture;
uniform vec2 uTexelSize;
${uniformDeclarations}

in vec2 vTexCoord;
in float vOpacity;
in vec4 vTintColor;
in vec4 vEffectParams;

out vec4 fragColor;

void main() {
    vec4 color = texture(uTexture, vTexCoord);
    vec2 texCoord = vTexCoord;
    vec2 texelSize = uTexelSize;
    vec4 effectParams = vEffectParams;
${snippets.join('\n')}


    if (vTintColor.a > 0.0) {
        color.rgb = mix(color.rgb, vTintColor.rgb, vTintColor.a);
    }

    fragColor = vec4(color.rgb, color.a * vOpacity);
}
`
}
