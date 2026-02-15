import ActionSet from '../libs/action_set.js'


export default class InterludeActionSet extends ActionSet {
    constructor (interlude) {
        super()

        initActions(interlude, this)
    }
}


function initActions (interlude, actionSet) {

    const {set} = actionSet.getApi()

    set('start', () => {
        if (!interlude.started) {
            interlude.started = true
            return interlude
        }

        return false
    })


    set('choice', (flow, choice) => {
        interlude.currentChoice = choice
        flow.enqueue('end')

        return interlude.currentChoice
    })


    set('end', async () => {
        if (interlude.started) {
            return true
        }

        return false
    })


    return actionSet

}
