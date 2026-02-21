export default class Wiring {

    #groups = new Map()

    constructor (moduleGroups = {}) {
        for (const [name, modules] of Object.entries(moduleGroups)) {
            this.#groups.set(name, extractClasses(modules))
        }
    }


    get (group, name) {
        return this.#groups.get(group)?.[name] || null
    }


    getAll (group) {
        return this.#groups.get(group) || {}
    }


    has (group, name) {
        return this.get(group, name) !== null
    }


    get groups () {
        return Array.from(this.#groups.keys())
    }


    registerViews (stage, overrides = {}) {
        const entities = this.getAll('entities')
        const views = this.getAll('views')

        for (const [name, Entity] of Object.entries(entities)) {
            const View = views[name + 'View']

            if (View) {
                const config = {...View.config, ...overrides[name]}
                stage.register(Entity, View, config)
            }
        }
    }


    registerEffects (renderer) {
        const effects = this.getAll('effects')

        for (const Effect of Object.values(effects)) {
            renderer.registerShaderEffect(Effect)
        }
    }

}


function extractClasses (modules) {
    const classes = {}

    if (!modules) {
        return classes
    }

    for (const module of Object.values(modules)) {
        const Class = module.default

        if (Class?.name) {
            classes[Class.name] = Class
        }
    }

    return classes
}
