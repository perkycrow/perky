import {test, expect} from 'vitest'
import ActionFlow from './action_flow.js'


test('constructor initializes with empty state', () => {
    const mockActionSet = {get: () => null, getHooks: () => []}
    const flow = new ActionFlow(mockActionSet)

    expect(flow.queue).toEqual([])
    expect(flow.running).toBe(true)
    expect(flow.digest).toEqual({})
    expect(flow.history).toEqual([])
    expect(flow.parent).toBeUndefined()
})


test('fork creates child flow', () => {
    const mockActionSet = {get: () => null, getHooks: () => []}
    const parent = new ActionFlow(mockActionSet)
    const child = parent.fork()

    expect(child.parent).toBe(parent)
    expect(child.actionSet).toBe(mockActionSet)
})


test('set and digest', () => {
    const mockActionSet = {get: () => null, getHooks: () => []}
    const flow = new ActionFlow(mockActionSet)

    flow.set('key', 'value')

    expect(flow.digest.key).toBe('value')
})


test('increment', () => {
    const mockActionSet = {get: () => null, getHooks: () => []}
    const flow = new ActionFlow(mockActionSet)

    flow.increment('count')
    flow.increment('count', 5)

    expect(flow.digest.count).toBe(6)
})


test('enqueue and prepend', () => {
    const mockActionSet = {get: () => null, getHooks: () => []}
    const flow = new ActionFlow(mockActionSet)

    flow.enqueue('actionA', 'arg1')
    flow.prepend('actionB', 'arg2')

    expect(flow.queue).toEqual([
        {actionName: 'actionB', args: ['arg2']},
        {actionName: 'actionA', args: ['arg1']}
    ])
})


test('stop sets running to false', () => {
    const mockActionSet = {get: () => null, getHooks: () => []}
    const flow = new ActionFlow(mockActionSet)

    flow.stop()

    expect(flow.running).toBe(false)
})


test('stopPropagation stops parent chain', () => {
    const mockActionSet = {get: () => null, getHooks: () => []}
    const parent = new ActionFlow(mockActionSet)
    const child = parent.fork()

    child.stopPropagation()

    expect(child.running).toBe(false)
    expect(parent.running).toBe(false)
})


test('active returns combined running state', () => {
    const mockActionSet = {get: () => null, getHooks: () => []}
    const parent = new ActionFlow(mockActionSet)
    const child = parent.fork()

    expect(child.active).toBe(true)

    parent.stop()

    expect(child.active).toBe(false)
})


test('getAction delegates to actionSet.get', () => {
    const mockAction = () => {}
    const mockActionSet = {get: (name) => (name === 'testAction' ? mockAction : null), getHooks: () => []}
    const flow = new ActionFlow(mockActionSet)

    expect(flow.getAction('testAction')).toBe(mockAction)
    expect(flow.getAction('nonexistent')).toBeNull()
})
