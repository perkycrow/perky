import {test, expect, beforeEach} from 'vitest'
import HookSet from './hook_set.js'


let hookSet

beforeEach(() => {
    hookSet = new HookSet()
})


test('addHook', () => {
    const hook = hookSet.addHook('hookName', () => {})
    expect(hookSet.hooksFor.hookName).toEqual([hook])
})


test('getHooks', () => {
    const hook = hookSet.addHook('hookName', () => {})
    expect(hookSet.getHooks('hookName')).toEqual([hook])
})


test('removeHook', () => {
    const hookA = hookSet.addHook('hookName', () => {})
    const hookB = hookSet.addHook('hookName', () => {})

    expect(hookSet.removeHook('hookName', hookA)).toBeTruthy()
    expect(hookSet.getHooks('hookName')).toEqual([hookB])
})


test('triggerHooks', async () => {
    const history = []
    hookSet.addHook('hookName', () => history.push('triggerA'))
    hookSet.addHook('hookName', () => history.push('triggerB'))

    await hookSet.triggerHooks('hookName')
    expect(history).toEqual(['triggerA', 'triggerB'])
})
