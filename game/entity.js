import PerkyModule from '../core/perky_module'


export default class Entity extends PerkyModule {

    constructor (params = {}) {
        super()

        this.$category = params.$category || 'entity'
        this.$tags = params.$tags || []
    }

}
