import {deepMerge} from '../libs/utils.js'
import Arsenal from './arsenal.js'
import Vault from './vault.js'
import AdventureActionSet from '../action_sets/adventure_action_set.js'


export default class Adventure {

    static steps = []
    static id    = 'adventure'

    constructor (params, {artifactFactory, skillFactory, steps} = {}) {
        this.steps           = steps           || this.constructor.steps
        this.artifactFactory = artifactFactory || this.constructor.artifactFactory
        this.skillFactory    = skillFactory    || this.constructor.skillFactory

        this.restore(params)

        this.actionSet = new AdventureActionSet(this)
    }


    createStep (index) {
        return this.steps[index] && new this.steps[index](this.currentStepState, this)
    }


    triggerAction (name, ...args) {
        return this.actionSet.trigger(name, ...args)
    }


    async triggerUserAction (name, ...args) {
        const {actionSet} = this

        if (!this.busy) {
            this.busy = true
            const flow = await actionSet.trigger(name, ...args)
            this.busy = false

            return flow
        }

        return false
    }


    restore (params) {
        reset(this, params)
    }


    export () {
        return {
            currentStepIndex: this.currentStepIndex,
            currentStepState: this.currentStep && this.currentStep.export(),
            arsenal:          this.arsenal.export(),
            vault:            this.vault.export(),
            id:               this.id
        }
    }


    get currentStepName () {
        return this.constructor.getStepName(this.currentStepIndex)
    }


    get currentStepId () {
        return this.constructor.getStepId(this.currentStepIndex)
    }


    static getStepId (index) {
        const name = this.getStepName(index)
        return name && camelize(name)
    }


    static getStepName (index) {
        return this.steps[index] && this.steps[index].name
    }

}


function reset (adventure, {
    currentStepIndex = 0,
    currentStepState = {},
    arsenal          = {},
    vault            = {},
    id               = adventure.constructor.id
} = {}) {
    adventure.currentStepIndex = currentStepIndex
    adventure.currentStepState = deepMerge({}, currentStepState)
    adventure.arsenal          = new Arsenal(arsenal, adventure.skillFactory)
    adventure.vault            = new Vault(vault, adventure.artifactFactory)
    adventure.id               = id
}


function camelize (string) {
    return string.replace(/[-_\s]+(.)?/g, (_, c) => c ? c.toUpperCase() : '')
}
