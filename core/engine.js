import PerkyModule from './perky_module'
import Manifest from './manifest'
import ActionDispatcher from './action_dispatcher'


export default class Engine extends PerkyModule {

    constructor (params = {}) {
        super({
            name: 'engine',
            ...params
        })

        const manifestData = params.manifest || this.constructor.manifest || {}

        this.create(Manifest, {
            $bind: 'manifest',
            $lifecycle: false,
            data: manifestData.export ? manifestData.export() : manifestData
        })

        this.create(ActionDispatcher, {
            $bind: 'actionDispatcher'
        })
    }

}
