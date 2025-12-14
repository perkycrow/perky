import PerkyModule from '../core/perky_module'


export default class Entity extends PerkyModule {

    static category = 'entity'

    constructor (options = {}) {
        super(options)
        this.$tags = options.$tags || []
    }

}
