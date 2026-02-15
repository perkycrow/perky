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
