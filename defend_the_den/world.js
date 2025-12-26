import PerkyModule from '../core/perky_module'


export default class World extends PerkyModule {

    static $category = 'world'

    constructor (options = {}) {
        super(options)

        this.addTagsIndex(['updatable'])
        this.addTagsIndex(['enemy'])
        this.addTagsIndex(['projectile'])
    }


    get entities () {
        return this.childrenByCategory('entity')
    }


    childrenByCategory (category) {
        return this.childrenRegistry.lookup('$category', category)
    }

}
