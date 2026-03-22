import {test, expect} from 'vitest'
import ActionSet from './action_set.js'


test('constructor with initialize', async () => {
    const history = []

    const actionSet = new ActionSet(({set, hook}) => {
        set('actionA', () => {
            history.push('actionA')
            return true
        })
        hook('actionA', () => history.push('hookA'))
    })

    await actionSet.trigger('actionA')
    expect(history).toEqual(['actionA', 'hookA'])
})


test('single action', async () => {
    const actionSet = new ActionSet()
    const {set, get, trigger} = actionSet.getApi()
    const history = []

    const actionA = set('actionA', () => {
        history.push('actionA')
        return true
    })

    expect(get('actionA')).toEqual(actionA)
    await trigger('actionA')
    expect(history).toEqual(['actionA'])
})


test('single hook', async () => {
    const actionSet = new ActionSet()
    const {set, hook, getHooks, trigger} = actionSet.getApi()
    const history = []

    set('actionA', () => {
        history.push('actionA')
        return true
    })

    const hookA = hook('actionA', () => history.push('hookA'))
    expect(getHooks('actionA')).toEqual([hookA])
    await trigger('actionA')
    expect(history).toEqual(['actionA', 'hookA'])
})


test('removeHook', async () => {
    const actionSet = new ActionSet()
    const {set, hook, getHooks, removeHook, trigger} = actionSet.getApi()
    const history = []

    set('actionA', () => {
        history.push('actionA')
        return true
    })

    const hookA = hook('actionA', () => history.push('hookA'))
    removeHook('actionA', hookA)
    expect(hookA.removed).toBeTruthy()
    expect(getHooks('actionA')).toEqual([hookA])
    actionSet.cleanHooks()
    expect(getHooks('actionA')).toEqual([])
    await trigger('actionA')
    expect(history).toEqual(['actionA'])
})


test('once', async () => {
    const actionSet = new ActionSet()
    const {set, once, getHooks, trigger} = actionSet.getApi()
    const history = []

    set('actionA', () => {
        history.push('actionA')
        return true
    })

    const onceHook = once('actionA', () => history.push('onceHook'))
    expect(getHooks('actionA')).toEqual([onceHook])
    await trigger('actionA')
    expect(history).toEqual(['actionA', 'onceHook'])
    expect(getHooks('actionA')).toEqual([])
    history.length = 0
    await trigger('actionA')
    expect(history).toEqual(['actionA'])
})


test('steps', async () => {
    const actionSet = new ActionSet()
    const {set, steps, trigger} = actionSet.getApi()
    const history = []

    set('actionA', () => {
        history.push('actionA')
        return true
    })

    steps([{
        name: 'actionA',
        hook: () => history.push('chainA')
    }, {
        name: 'actionA',
        hook: () => history.push('chainB')
    }])

    await trigger('actionA')
    expect(history).toEqual(['actionA', 'chainA'])

    history.length = 0
    await trigger('actionA')
    expect(history).toEqual(['actionA', 'chainB'])

    history.length = 0
    await trigger('actionA')
    expect(history).toEqual(['actionA'])
})


test('nested trigger', async () => {
    const actionSet = new ActionSet()
    const {set, trigger} = actionSet.getApi()
    const history = []

    set('actionA', () => {
        history.push('actionA')
        return true
    })

    set('actionB', async (flow) => {
        history.push('actionB')
        await flow.immediate('actionA')
        return true
    })

    await trigger('actionB')
    expect(history).toEqual(['actionB', 'actionA'])
})


test('enqueue', async () => {
    const actionSet = new ActionSet()
    const {set, trigger} = actionSet.getApi()
    const history = []

    set('actionA', () => {
        history.push('actionA')
        return true
    })

    set('actionC', async (flow) => {
        history.push('actionC')
        flow.enqueue('actionD')
        await flow.immediate('actionA')
        return true
    })

    set('actionD', () => history.push('actionD'))
    await trigger('actionC')
    expect(history).toEqual(['actionC', 'actionA', 'actionD'])
})


test('history and result', async () => {
    const actionSet = new ActionSet()
    const {set, hook, trigger} = actionSet.getApi()

    set('actionA', () => {
        return true
    })

    set('actionE', () => 'red')
    hook('actionE', (flow) => {
        flow.enqueue('actionA')
    })

    const f = await trigger('actionE')

    expect(f.result).toEqual('red')
    expect(f.history).toEqual([{
        actionName: 'actionE',
        args: [],
        result: 'red'
    }, {
        actionName: 'actionA',
        args: [],
        result: true
    }, {
        actionName: 'digestAction',
        args: [{actionName: 'actionE', result: 'red'}],
        result: undefined
    }])
})


test('auto stop on falsy result', async () => {
    const actionSet = new ActionSet()
    const {set, trigger} = actionSet.getApi()
    const history = []

    set('actionF', (flow) => {
        history.push('actionF')
        flow.enqueue('actionG')
        return false
    })

    set('actionG', () => {
        history.push('actionG')
        return true
    })

    await trigger('actionF')
    expect(history).toEqual(['actionF'])
})


test('manual stop', async () => {
    const actionSet = new ActionSet()
    const {set, trigger} = actionSet.getApi()
    const history = []

    set('actionA', () => {
        history.push('actionA')
        return true
    })

    set('actionB', async (flow) => {
        history.push('actionB')
        await flow.immediate('actionA')
        return true
    })

    set('actionH', async (flow, stopMe) => {
        history.push('actionH')
        if (stopMe) {
            flow.stop()
        }
        await flow.immediate('actionB')
    })

    await trigger('actionH', true)
    expect(history).toEqual(['actionH'])

    history.length = 0
    await trigger('actionH', false)
    expect(history).toEqual(['actionH', 'actionB', 'actionA'])
})


test('use', async () => {
    const actionSet = new ActionSet()
    const {set} = actionSet.getApi()
    const history = []

    set('actionA', () => {
        history.push('actionA')
        return true
    })

    const otherSet = new ActionSet()
    otherSet.hook('actionA', () => {
        history.push('outsideHook')
    })
    otherSet.use(actionSet)
    await otherSet.trigger('actionA')
    expect(history).toEqual(['actionA', 'outsideHook'])
})


test('stopPropagation', async () => {
    const actionSet = new ActionSet()
    const {set, hook, trigger} = actionSet.getApi()
    const history = []

    set('actionI', async (flow) => {
        history.push('actionI')
        flow.enqueue('actionJ')
        flow.enqueue('actionK')
        return true
    })

    hook('actionI', () => {
        history.push('hookI')
    })

    set('actionJ', async (flow) => {
        history.push('actionJ')
        flow.stopPropagation()
        return true
    })

    hook('actionJ', () => {
        history.push('hookJ')
    })

    set('actionK', async () => {
        history.push('actionK')
        return true
    })

    hook('actionK', () => {
        history.push('hookK')
    })

    await trigger('actionI')
    expect(history).toEqual(['actionI', 'hookI', 'actionJ'])
})


test('digestAction', async () => {
    const actionSet = new ActionSet()
    const {set, trigger} = actionSet.getApi()
    const digest = {}

    set('actionA', () => true)

    set('digestAction', (flow, {actionName, result}) => {
        digest.actionName = actionName
        digest.result = result
        return true
    })

    await trigger('actionA')
    expect(digest).toEqual({actionName: 'actionA', result: true})
})


test('remove', () => {
    const actionSet = new ActionSet()
    const {set, get, remove} = actionSet.getApi()

    set('actionA', () => true)
    expect(get('actionA')).toBeDefined()

    const removed = remove('actionA')
    expect(removed).toBe(true)
    expect(get('actionA')).toBeUndefined()

    const removedAgain = remove('actionA')
    expect(removedAgain).toBe(false)
})


test('updateSteps', async () => {
    const actionSet = new ActionSet()
    const {set, steps, trigger} = actionSet.getApi()
    const history = []

    set('actionA', () => {
        history.push('actionA')
        return true
    })

    set('actionB', () => {
        history.push('actionB')
        return true
    })

    steps([{
        name: 'actionA',
        hook: () => {
            history.push('stepA')
            steps([{
                name: 'actionB',
                hook: () => history.push('stepB')
            }])
        }
    }])

    await trigger('actionA')
    expect(history).toEqual(['actionA', 'stepA'])

    history.length = 0
    await trigger('actionB')
    expect(history).toEqual(['actionB', 'stepB'])
})
