import PerkyModule from './perky_module'
import Manifest from './manifest'
import ActionDispatcher from './action_dispatcher'


export default class Engine extends PerkyModule {

    constructor (params = {}) {
        const {manifest = {}} = params

        super({
            name: 'engine',
            ...params
        })

        this.use(Manifest, {
            $bind: 'manifest',
            $lifecycle: false,
            data: manifest.export ? manifest.export() : manifest
        })

        this.use(ActionDispatcher, {
            $bind: 'actionDispatcher'
        })
    }

}
