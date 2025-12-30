import PerkyModule from '../core/perky_module'


export default class World extends PerkyModule {

    static $category = 'world'


    get entities () {
        return this.childrenByCategory('entity')
    }

}
