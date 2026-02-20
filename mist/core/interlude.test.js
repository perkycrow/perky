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


test('contentFor', () => {
    const interludeWithContent = new Interlude1({
        content: {
            en: {title: 'Hello'},
            fr: {title: 'Bonjour'}
        }
    })

    expect(interludeWithContent.contentFor('en')).toEqual({title: 'Hello'})
    expect(interludeWithContent.contentFor('fr')).toEqual({title: 'Bonjour'})
    expect(interludeWithContent.contentFor('de')).toBeUndefined()
})


test('restore', () => {
    interlude.restore({
        visual: 'newVisual',
        content: {en: {text: 'new content'}},
        choices: ['newChoice'],
        currentChoice: 'newChoice'
    })

    expect(interlude.visual).toBe('newVisual')
    expect(interlude.content).toEqual({en: {text: 'new content'}})
    expect(interlude.choices).toEqual(['newChoice'])
    expect(interlude.currentChoice).toBe('newChoice')
})


test('restore with defaults', () => {
    interlude.restore({
        visual: 'changedVisual',
        currentChoice: 'choice1'
    })

    interlude.restore()

    expect(interlude.visual).toBe('visual1')
    expect(interlude.choices).toEqual(['choice1', 'choice2'])
    expect(interlude.currentChoice).toBeNull()
})
