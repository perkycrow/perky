import {test, expect, beforeEach} from 'vitest'
import Interlude from './interlude.js'


class Interlude1 extends Interlude {
    static visual  = 'visual1'
    static content = {}
    static choices = ['choice1', 'choice2']
}

let interlude

beforeEach(() => {
    interlude = new Interlude1({visual: 'visual2'})
})


test('export', () => {
    expect(interlude.export()).toEqual({
        currentChoice: null,
        visual:  'visual2',
        content: {},
        choices: ['choice1', 'choice2']
    })
})
