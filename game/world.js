import PerkyModule from '../core/perky_module.js'
import Entity from './entity.js'


export default class World extends PerkyModule {

    static $category = 'world'

    get entities () {
        return this.childrenByCategory('entity')
    }


    findByType (EntityClass) {
        return this.entities.find(e => e instanceof EntityClass) || null
    }


    loadLayout (config, wiring) {
        if (!config?.entities) {
            return
        }

        for (const entry of config.entities) {
            if (entry.type && wiring) {
                const EntityClass = wiring.get('entities', entry.type)

                if (EntityClass) {
                    this.create(EntityClass, entry)
                }
            } else if (entry.texture) {
                this.create(Entity, {
                    ...entry,
                    $tags: ['decor']
                })
            }
        }
    }


    update (deltaTime, context) {
        if (!this.started) {
            return
        }

        this.preUpdate?.(deltaTime, context)

        for (const entity of this.entities) {
            if (entity.started) {
                entity.update(deltaTime)
            }
        }

        this.postUpdate?.(deltaTime, context)
    }

}
