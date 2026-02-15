export default class HookSet {

    constructor () {
        this.hooksFor = {}
        this.hooksToRemove = []
        this.stepsToAdd = []
    }


    addHook (name, hook) {
        const {hooksFor} = this

        if (!hooksFor[name]) {
            hooksFor[name] = []
        }

        hooksFor[name].push(hook)

        return hook
    }


    getHooks (name) {
        return this.hooksFor[name]
    }


    removeHook (name, hook) {
        const hooks = this.getHooks(name)

        if (Array.isArray(hooks)) {
            const index = hooks.indexOf(hook)

            if (index !== -1) {
                hooks.splice(index, 1)
                return true
            }
        }

        return false
    }


    async triggerHooks (name, ...args) {
        const hooks = this.getHooks(name) || []

        for (const hook of hooks) {
            if (!hook.removed) {
                await hook(...args)
            }
        }
    }

}
