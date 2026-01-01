import PerkyModule from '../core/perky_module.js'


export default class World extends PerkyModule {

    static $category = 'world'


    get entities () {
        return this.childrenByCategory('entity')
    }


    update (deltaTime, context) {
        if (!this.started) {
            return
        }

        this.preUpdate(deltaTime, context)

        for (const entity of this.entities) {
            if (entity.started) {
                entity.update(deltaTime)
            }
        }

        this.postUpdate(deltaTime, context)
    }


    preUpdate () { // eslint-disable-line class-methods-use-this

    }


    postUpdate () { // eslint-disable-line class-methods-use-this

    }

}
