import {describe, test, expect} from 'vitest'
import BUFF_DEFINITIONS from './buff_definitions.js'


describe('BuffDefinitions', () => {

    test('exports an object with buff keys', () => {
        expect(typeof BUFF_DEFINITIONS).toBe('object')
        expect(Object.keys(BUFF_DEFINITIONS).length).toBeGreaterThan(0)
    })


    test('each definition has key, duration, and modifiers', () => {
        for (const key in BUFF_DEFINITIONS) {
            const def = BUFF_DEFINITIONS[key]

            expect(def.key).toBe(key)
            expect(typeof def.duration).toBe('number')
            expect(typeof def.modifiers).toBe('object')
        }
    })


    test('contains all expected buffs', () => {
        const expected = [
            'rage', 'grief', 'panic', 'shock', 'terror', 'lastBreath',
            'indignation', 'triumph', 'excitement', 'trophy', 'party',
            'startle', 'disarray', 'promotion', 'rout', 'exaltation',
            'cornered', 'vendetta', 'duelFury', 'berserk', 'detonation',
            'possessive', 'cowardTyrant', 'megalomania', 'nobleMelancholy',
            'snobShock', 'seduction', 'obsession', 'unstable', 'despair',
            'terrorFreeze', 'groupie', 'dependence', 'loveStrike', 'bipolar',
            'wonder', 'apathy'
        ]

        for (const key of expected) {
            expect(BUFF_DEFINITIONS[key]).toBeDefined()
        }

        expect(Object.keys(BUFF_DEFINITIONS).length).toBe(expected.length)
    })


    test('permanent buffs have duration -1', () => {
        expect(BUFF_DEFINITIONS.terror.duration).toBe(-1)
        expect(BUFF_DEFINITIONS.lastBreath.duration).toBe(-1)
        expect(BUFF_DEFINITIONS.rout.duration).toBe(-1)
        expect(BUFF_DEFINITIONS.exaltation.duration).toBe(-1)
    })


    test('timed buffs have positive duration', () => {
        expect(BUFF_DEFINITIONS.rage.duration).toBe(3)
        expect(BUFF_DEFINITIONS.grief.duration).toBe(5)
        expect(BUFF_DEFINITIONS.panic.duration).toBe(2)
        expect(BUFF_DEFINITIONS.shock.duration).toBe(1)
    })

})
