import {test, expect, beforeEach} from 'vitest'
import Adventure from './adventure.js'
import Chapter from './chapter.js'


class Chapter1 extends Chapter {}

class Chapter2 extends Chapter {}

class Story extends Adventure {
    static steps = [Chapter1, Chapter2]
}


let adventure

beforeEach(() => {
    adventure = new Story()
})


test('createStep', () => {
    const step = adventure.createStep(0)

    expect(step).toBeInstanceOf(Chapter1)
})


test('export', () => {
    adventure.currentStepIndex = 1

    expect(adventure.export()).toEqual({
        currentStepIndex: 1,
        currentStepState: undefined,
        id: 'adventure',
        vault: {
            artifacts: []
        },
        arsenal: {
            skills: []
        }
    })
})


test('triggerAction', async () => {
    const flow = await adventure.triggerAction('start')

    expect(flow.history[0].actionName).toBe('start')
    expect(adventure.started).toBe(true)
})


test('restore', () => {
    adventure.currentStepIndex = 1
    adventure.id = 'custom-id'

    adventure.restore({
        currentStepIndex: 0,
        currentStepState: {foo: 'bar'},
        id: 'restored-id'
    })

    expect(adventure.currentStepIndex).toBe(0)
    expect(adventure.currentStepState).toEqual({foo: 'bar'})
    expect(adventure.id).toBe('restored-id')
})
