import PerkyModule from './perky_module'
import Manifest from './manifest'
import ActionDispatcher from './action_dispatcher'


export default class Engine extends PerkyModule {

    static $category = 'engine'

    constructor (options = {}) {
        super(options)

        const manifestData = options.manifest || this.constructor.manifest || {}

        this.create(Manifest, {
            $bind: 'manifest',
            $lifecycle: false,
            data: manifestData.export ? manifestData.export() : manifestData
        })

        this.create(ActionDispatcher, {
            $bind: 'actionDispatcher'
        })

        this.configureEngine?.(options)
    }

}
