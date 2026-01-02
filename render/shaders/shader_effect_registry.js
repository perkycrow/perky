import {SPRITE_VERTEX} from './builtin/sprite_shader.js'


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
        for (const [name, value] of this.#uniformValues) {
            const location = program.uniforms[name]
            if (location === undefined || location === -1) {
                continue
            }

            const type = this.#uniformTypes.get(name) || DEFAULT_UNIFORM_TYPES[name] || 'float'

            switch (type) {
            case 'float':
                gl.uniform1f(location, value)
                break
            case 'vec2':
                gl.uniform2fv(location, value)
                break
            case 'vec3':
                gl.uniform3fv(location, value)
                break
            case 'vec4':
                gl.uniform4fv(location, value)
                break
            case 'int':
                gl.uniform1i(location, value)
                break
            }
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
                const snippet = this.#wrapSnippet(Effect, paramOffset)
                fragments.push(snippet)

                paramOffset += Effect.shader.params?.length || 0

                const effectUniforms = Effect.shader.uniforms || []
                for (const uniform of effectUniforms) {
                    if (typeof uniform === 'string') {
                        uniforms.set(uniform, this.#uniformTypes.get(uniform) || DEFAULT_UNIFORM_TYPES[uniform] || 'float')
                    } else if (uniform.name && uniform.type) {
                        uniforms.set(uniform.name, uniform.type)
                    }
                }
            }
        }

        const fragmentSource = this.#buildFragment(fragments, uniforms)

        return this.#shaderRegistry.register(`sprite_effect_${cacheKey}`, {
            vertex: SPRITE_VERTEX,
            fragment: fragmentSource,
            uniforms: Array.from(uniforms.keys()),
            attributes: SPRITE_ATTRIBUTES
        })
    }


    #wrapSnippet (EffectClass, paramOffset) {
        const {params = [], fragment} = EffectClass.shader
        const name = EffectClass.name

        const paramDeclarations = params.map((paramName, index) => {
            const globalIndex = paramOffset + index

            if (globalIndex >= 4) {
                console.warn(`[ShaderEffect] ${name}: param "${paramName}" exceeds 4 params limit, ignored`)
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


    #buildFragment (snippets, uniforms) {
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


    dispose () {
        this.#effects.clear()
        this.#shaderCache.clear()
        this.#uniformValues.clear()
        this.#uniformTypes.clear()
        this.#gl = null
        this.#shaderRegistry = null
    }

}
