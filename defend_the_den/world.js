import PerkyModule from '../core/perky_module'


export default class World extends PerkyModule {

    constructor (options = {}) {
        super(options)

        this.addTagsIndex(['updatable'])
        this.addTagsIndex(['enemy'])
    }


    get entities () {
        return this.childrenByCategory('entity')
    }


    childrenByCategory (category) {
        return this.childrenRegistry.lookup('$category', category)
    }

}
