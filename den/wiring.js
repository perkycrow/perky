const entityModules = import.meta.glob(['./entities/*.js', '!./entities/*.test.js'], {eager: true})
const viewModules = import.meta.glob('./views/*_view.js', {eager: true})
const effectModules = import.meta.glob('./effects/*_effect.js', {eager: true})


export const entities = {}
for (const module of Object.values(entityModules)) {
    const Class = module.default
    if (Class?.name) {
        entities[Class.name] = Class
    }
}


export const views = {}
for (const module of Object.values(viewModules)) {
    const Class = module.default
    if (Class?.name) {
        views[Class.name] = Class
    }
}


export function getViewFor (Entity) {
    const viewName = Entity.name + 'View'
    return views[viewName]
}


export function autoRegisterViews (stage, overrides = {}) {
    for (const [name, Entity] of Object.entries(entities)) {
        const View = getViewFor(Entity)
        if (View) {
            const config = {...View.config, ...overrides[name]}
            stage.register(Entity, View, config)
        }
    }
}


export const effects = {}
for (const module of Object.values(effectModules)) {
    const Class = module.default
    if (Class?.name) {
        effects[Class.name] = Class
    }
}


export function autoRegisterEffects (renderer) {
    for (const Effect of Object.values(effects)) {
        renderer.registerShaderEffect(Effect)
    }
}
