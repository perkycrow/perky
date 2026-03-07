export default class ActionFlow {

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
