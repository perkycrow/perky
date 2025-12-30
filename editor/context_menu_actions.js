import GameLoop from '../game/game_loop.js'


const actionProviders = []


export function registerActionProvider (provider) {
    actionProviders.push(provider)
}


export function getActionsForModule (module, callbacks = {}) {
    const actions = []

    addDefaultActions(actions, module, callbacks)

    for (const provider of actionProviders) {
        if (provider.matches(module)) {
            const providerActions = provider.getActions(module, callbacks)
            if (providerActions.length > 0) {
                actions.push({separator: true})
                actions.push(...providerActions)
            }
        }
    }

    return actions
}


function addDefaultActions (actions, module, callbacks) {
    const isStatic = module.$status === 'static'
    const isStarted = module.$status === 'started'
    const isDisposed = module.$status === 'disposed'

    actions.push({
        iconSvg: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="3"></circle></svg>',
        label: 'Focus',
        action: () => callbacks.onFocus?.(module)
    })

    actions.push({separator: true})

    if (isStarted) {
        actions.push({
            icon: '⏹',
            label: 'Stop',
            disabled: isStatic,
            action: () => module.stop()
        })
    } else {
        actions.push({
            icon: '▶',
            label: 'Start',
            disabled: isStatic || isDisposed,
            action: () => module.start()
        })
    }

    actions.push({
        icon: '🗑',
        label: 'Dispose',
        danger: true,
        disabled: isDisposed,
        action: () => module.dispose()
    })
}


registerActionProvider({
    matches: (module) => module instanceof GameLoop,

    getActions: (module) => {
        const isPaused = module.paused
        const isStarted = module.started

        return [
            {
                icon: isPaused ? '▶' : '⏸',
                label: isPaused ? 'Resume' : 'Pause',
                disabled: !isStarted,
                action: () => {
                    if (isPaused) {
                        module.resume()
                    } else {
                        module.pause()
                    }
                }
            }
        ]
    }
})


export default {
    registerActionProvider,
    getActionsForModule
}
