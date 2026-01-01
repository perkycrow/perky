import PerkyModule from '../core/perky_module'


export default class World extends PerkyModule {

    static $category = 'world'


    get entities () {
        return this.childrenByCategory('entity')
    }


    update (deltaTime) {
        if (!this.started) {
            return
        }

        for (const entity of this.entities) {
            if (entity.started) {
                entity.update?.(deltaTime)
            }
        }
    }

}
