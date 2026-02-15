import ActionSet from '../libs/action_set.js'


export default class AdventureActionSet extends ActionSet {
    constructor (adventure) {
        super()

        initActions(adventure, this)
    }
}


function initActions (adventure, actionSet) {

    const {arsenal, vault} = adventure
    const {set} = actionSet.getApi()


    set('start', async (flow) => {

        if (!adventure.started && !adventure.completed) {
            adventure.started = true
            flow.enqueue('initStep')
            flow.enqueue('startStep')

            return adventure
        }

        return false
    })


    set('initStep', () => {
        const {currentStepIndex} = adventure

        if (currentStepIndex < adventure.steps.length) {
            const step = adventure.createStep(currentStepIndex)
            adventure.currentStep = step
            initStepHooks(adventure, step)

            return step
        }

        return false
    })


    set('startStep', async () => {
        const {currentStep} = adventure

        if (currentStep && !currentStep.started) {
            await currentStep.triggerAction('start')

            return currentStep
        }

        return false
    })


    set('nextStep', (flow) => {
        const {currentStepIndex} = adventure

        if (currentStepIndex < adventure.steps.length - 1) {
            adventure.currentStepIndex += 1
            adventure.currentStepState  = {}
            flow.enqueue('initStep')
            flow.enqueue('startStep')
            flow.enqueue('stateChange')

            return adventure.currentStep
        }

        flow.enqueue('end')

        return true
    })


    set('saveChoice', (flow, choice) => {
        if (choice.type === 'skill') {
            flow.enqueue('addSkill', choice.id)
        }

        if (choice.type === 'artifact') {
            flow.enqueue('addArtifact', choice.id)
        }

        return true
    })


    set('stateChange', () => {
        return true
    })


    set('addArtifact', (flow, id) => {
        return vault.addArtifact(id)
    })


    set('addSkill', (flow, id) => {
        return arsenal.addSkill(id)
    })


    set('end', () => {
        if (adventure.started && !adventure.completed) {
            adventure.started   = false
            adventure.completed = true

            return true
        }

        return false
    })


    set('restartChapter', async () => {
        const currentStep = adventure.currentStep

        if (currentStep && currentStep.type === 'chapter') {
            await currentStep.triggerAction('restart')
        }

        return true
    })


    return actionSet

}


function initStepHooks (adventure, step) {

    step.actionSet.hook('end', () => {
        adventure.triggerAction('nextStep')
    })

    step.actionSet.hook('stateChange', () => {
        adventure.triggerAction('stateChange')
    })

    if (step.type === 'interlude') {
        initInterludeHooks(adventure, step)
    }

}


function initInterludeHooks (adventure, interlude) {

    interlude.actionSet.hook('choice', async (flow, choice) => {
        await adventure.triggerAction('saveChoice', choice)
    })

}
