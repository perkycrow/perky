
export function createListenerManager () {
    const listeners = []

    return {

        add (target, event, handler) {
            target.on(event, handler)
            listeners.push({target, event, handler})
        },

        clear () {
            for (const {target, event, handler} of listeners) {
                target.off(event, handler)
            }
            listeners.length = 0
        },

        get count () {
            return listeners.length
        }
    }

}
