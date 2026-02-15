import HookSet from './hook_set.js'


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


class ActionFlow {

    constructor (actionSet, parent) {
        this.parent = parent
        this.actionSet = actionSet
        this.queue = []
        this.running = parent ? parent.running : true
        this.digest = parent ? parent.digest : {}
        this.history = parent ? parent.history : []
    }


    get hookSet () {
        return this.actionSet && this.actionSet.hookSet
    }


    get active () {
        return this.running && this.parentRunning
    }


    get parentRunning () {
        return this.parent ? this.parent.running : this.running
    }


    get actionsHistory () {
        return this.history.map(({actionName}) => actionName)
    }


    get actionName () {
        return this.history[0] && this.history[0].actionName
    }


    get args () {
        return this.history[0] && this.history[0].args
    }


    get result () {
        return this.history[0] && this.history[0].result
    }


    fork () {
        return new ActionFlow(this.actionSet, this)
    }


    set (key, value) {
        this.digest[key] = value
    }


    increment (key, amount = 1) {
        this.digest[key] = this.digest[key] || 0
        this.digest[key] += amount
    }


    getAction (actionName) {
        return this.actionSet.get(actionName)
    }


    getHooks (actionName) {
        return this.actionSet.getHooks(actionName)
    }


    async immediate (actionName, ...args) {
        const fork = this.fork()
        const action = fork.getAction(actionName)
        const result = await triggerAction(fork, action, ...args)

        fork.history.push({actionName, args, result})

        if (result) {
            await fork.triggerHooks(actionName, result)

            await triggerQueue(fork)
        }

        return result
    }


    async triggerHooks (hookName, ...args) {
        const hooks = this.getHooks(hookName) || []

        for (const hook of hooks) {
            if (!hook.removed) {
                await triggerAction(this, hook, ...args)
            }
        }
    }


    enqueue (actionName, ...args) {
        this.queue.push({actionName, args})
    }


    prepend (actionName, ...args) {
        this.queue.unshift({actionName, args})
    }


    stop () {
        this.running = false
    }


    stopPropagation () {
        this.stop()

        if (this.parent) {
            this.parent.stopPropagation()
        }
    }

}


async function triggerAction (flow, action, ...args) {
    return flow.active && action && await action(flow, ...args)
}


async function triggerQueue (flow) {
    const {queue} = flow

    if (queue.length) {
        const next = queue.shift()

        if (next && flow.active) {
            await flow.immediate(next.actionName, ...next.args)
            await triggerQueue(flow)
        }
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
