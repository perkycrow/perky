import HookSet from './hook_set.js'
import ActionFlow from './action_flow.js'


export default class ActionSet {

    constructor (initialize = () => {}) {
        this.hookSet = new HookSet()
        this.actions = {}
        this.hooksToRemove = []
        this.stepsToAdd = []

        initialize(this.getApi())
    }


    use (actionSet) {
        const {actions, hooksFor} = actionSet

        for (const actionName in actions) {
            this.set(actionName, actions[actionName])
        }

        for (const actionName in hooksFor) {
            const hooks = hooksFor[actionName]
            for (const hook of hooks) {
                this.hook(actionName, hook)
            }
        }
    }


    set (actionName, action) {
        this.actions[actionName] = action

        return action
    }


    get (actionName) {
        return this.actions[actionName]
    }


    remove (actionName) {
        const {actions} = this
        return actionName in actions && delete actions[actionName]
    }


    hook (actionName, hook) {
        return this.hookSet.addHook(actionName, hook)
    }


    getHooks (actionName) {
        return this.hookSet.getHooks(actionName)
    }


    removeHook (actionName, hook) {
        hook.removed = true
        this.hooksToRemove.push({actionName, hook})
    }


    cleanHooks () {
        this.hooksToRemove.forEach(({actionName, hook}) => {
            this.hookSet.removeHook(actionName, hook)
        })

        this.hooksToRemove.length = 0
    }


    once (actionName, hook) {
        const hookWrapper = async (...args) => {
            await hook(...args)
            this.removeHook(actionName, hookWrapper)
        }

        this.hook(actionName, hookWrapper)

        return hookWrapper
    }


    steps (steps) {
        const next = steps.shift()

        if (next) {
            const {name, hook} = next

            this.once(name, async (...args) => {
                await hook(...args)

                if (steps.length > 0) {
                    this.stepsToAdd.push(steps)
                }
            })
        }

        return steps
    }


    updateSteps () {
        this.stepsToAdd.forEach(steps => this.steps(steps))
        this.stepsToAdd.length = 0
    }


    async trigger (actionName, ...args) {
        const actionFlow = new ActionFlow(this)

        const result = await actionFlow.immediate(actionName, ...args)

        if (result) {
            await actionFlow.immediate('digestAction', {actionName, result})
        }

        actionFlow.stop()
        this.cleanHooks()
        this.updateSteps()

        return actionFlow
    }


    getApi () {
        return bindApi(this, ['use', 'set', 'get', 'remove', 'hook', 'getHooks', 'removeHook', 'once', 'steps', 'trigger'])
    }

}


function bindApi (object, properties) {
    const api = {}

    for (const property of properties) {
        Object.defineProperty(api, property, {
            enumerable: true,
            get () {
                const value = object[property]
                if (typeof value === 'function') {
                    return value.bind(object)
                }
                return value
            }
        })
    }

    return api
}
