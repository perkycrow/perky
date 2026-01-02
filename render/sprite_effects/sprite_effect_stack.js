import ShaderEffect from '../shaders/shader_effect.js'


export default class SpriteEffectStack {

    #effects = []

    constructor () {
        this.#effects = []
    }


    get effects () {
        return this.#effects
    }


    get count () {
        return this.#effects.length
    }


    add (effect) {
        if (this.has(effect.constructor)) {
            return this
        }

        this.#effects.push(effect)
        return this
    }


    remove (EffectClass) {
        const index = this.#effects.findIndex(e => e.constructor === EffectClass)

        if (index !== -1) {
            const effect = this.#effects[index]
            effect.dispose()
            this.#effects.splice(index, 1)
        }

        return this
    }


    get (EffectClass) {
        return this.#effects.find(e => e.constructor === EffectClass) || null
    }


    has (EffectClass) {
        return this.#effects.some(e => e.constructor === EffectClass)
    }


    clear () {
        for (const effect of this.#effects) {
            effect.dispose()
        }
        this.#effects = []
        return this
    }


    getHints () {
        const hints = {}

        for (const effect of this.#effects) {
            if (!effect.enabled) {
                continue
            }

            const effectHints = effect.getHints()

            if (effectHints) {
                hints[effect.type] = effectHints
            }
        }

        return Object.keys(hints).length > 0 ? hints : null
    }


    update (deltaTime) {
        for (const effect of this.#effects) {
            if (effect.enabled) {
                effect.update(deltaTime)
            }
        }
    }


    dispose () {
        this.clear()
    }


    getShaderEffectTypes () {
        const types = []

        for (const effect of this.#effects) {
            if (effect.enabled && effect instanceof ShaderEffect) {
                types.push(effect.type)
            }
        }

        return types
    }


    getShaderEffectParams () {
        const params = [0, 0, 0, 0]
        let offset = 0

        for (const effect of this.#effects) {
            if (!effect.enabled || !(effect instanceof ShaderEffect)) {
                continue
            }

            const effectParams = effect.getParams()

            for (let i = 0; i < effectParams.length && offset + i < 4; i++) {
                params[offset + i] = effectParams[i]
            }

            offset += effectParams.length
        }

        return params
    }

}
