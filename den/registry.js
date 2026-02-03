const entityModules = import.meta.glob(['./entities/*.js', '!./entities/*.test.js'], {eager: true})
const viewModules = import.meta.glob('./views/*_view.js', {eager: true})


// Index entities par nom de classe : { Player: Player, PigEnemy: PigEnemy, ... }
export const entities = {}
for (const module of Object.values(entityModules)) {
    const Class = module.default
    if (Class?.name) {
        entities[Class.name] = Class
    }
}


// Index views par nom de classe : { PlayerView: PlayerView, PigEnemyView: PigEnemyView, ... }
export const views = {}
for (const module of Object.values(viewModules)) {
    const Class = module.default
    if (Class?.name) {
        views[Class.name] = Class
    }
}


// Retourne la View correspondante à une Entity (par convention de nommage)
export function getViewFor (Entity) {
    const viewName = Entity.name + 'View'
    return views[viewName]
}


// Auto-register toutes les paires Entity/View sur un worldView
export function autoRegisterViews (worldView, overrides = {}) {
    for (const [name, Entity] of Object.entries(entities)) {
        const View = getViewFor(Entity)
        if (View) {
            const config = {...View.config, ...overrides[name]}
            worldView.register(Entity, View, config)
        }
    }
}
