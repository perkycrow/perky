import ActionSet from '../libs/action_set.js'


export default class CutSceneActionSet extends ActionSet {
    constructor (cutScene) {
        super()

        initActions(cutScene, this)
    }
}


function initActions (cutScene, actionSet) {

    const {set} = actionSet.getApi()

    set('start', (flow) => {
        if (!cutScene.started) {
            cutScene.started = true

            return cutScene
        }

        return false
    })


    set('end', async () => {
        if (cutScene.started) {
            return true
        }

        return false
    })


    return actionSet

}
