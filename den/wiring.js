const entityModules = import.meta.glob(['./entities/*.js', '!./entities/*.test.js'], {eager: true})
const viewModules = import.meta.glob('./views/*_view.js', {eager: true})


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


export function autoRegisterViews (worldView, overrides = {}) {
    for (const [name, Entity] of Object.entries(entities)) {
        const View = getViewFor(Entity)
        if (View) {
            const config = {...View.config, ...overrides[name]}
            worldView.register(Entity, View, config)
        }
    }
}
