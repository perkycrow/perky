import {test, expect, beforeEach} from 'vitest'
import Arsenal from './arsenal.js'
import Skill from './skill.js'
import Factory from '../libs/factory.js'


class RuinSkill extends Skill {
    static cost = 1
}


class MadnessSkill extends Skill {
    static cost = 2
}


let skillFactory
let arsenal

beforeEach(() => {
    skillFactory = new Factory('Skill', [RuinSkill, MadnessSkill])
    arsenal = new Arsenal({skillFactory})
})


test('provideSkill', () => {
    const emptyArsenal = new Arsenal()
    emptyArsenal.provideSkill(RuinSkill)

    const skill = emptyArsenal.addSkill('ruin')
    expect(skill.id).toBe('ruin')
    expect(skill).toBeInstanceOf(RuinSkill)
})


test('createSkill', () => {
    const skill = arsenal.createSkill({id: 'ruin'})

    expect(skill.id).toBe('ruin')
    expect(skill).toBeInstanceOf(RuinSkill)
})


test('addSkill', () => {
    {
        const skill = arsenal.addSkill('madness')
        expect(skill.id).toEqual('madness')
    }
    {
        arsenal.addSkill({id: 'ruin'})
        const skill = arsenal.skills[1]
        expect(skill.id).toEqual('ruin')
    }
})


test('getSkill', () => {
    arsenal.addSkill('ruin')
    expect(arsenal.getSkill('ruin').id).toEqual('ruin')
})


test('chargeSkill', () => {
    const ruin = arsenal.addSkill('ruin')
    expect(ruin.charges).toEqual(0)

    expect(arsenal.chargeSkill('ruin')).toBeTruthy()
    expect(ruin.charges).toEqual(1)

    expect(ruin.ready).toBeTruthy()
    expect(arsenal.chargeSkill('ruin')).toBeFalsy()
})


test('activateSkill', () => {
    arsenal.addSkill('ruin')

    expect(arsenal.activateSkill('ruin')).toBeFalsy()
    arsenal.chargeSkill('ruin')

    expect(arsenal.activateSkill('ruin')).toBeTruthy()
})


test('export', () => {
    arsenal.addSkill('madness')
    arsenal.addSkill('ruin')

    expect(arsenal.export()).toEqual({
        skills: [{
            id: 'madness',
            cost: 2,
            charges: 0,
            overload: 0,
            additionalCost: 0
        }, {
            id: 'ruin',
            cost: 1,
            charges: 0,
            overload: 0,
            additionalCost: 0
        }]
    })
})


test('restore', () => {
    arsenal.restore({
        skills: [{
            id: 'madness',
            cost: 2,
            charges: 0,
            overload: 0,
            additionalCost: 0
        }, {
            id: 'ruin',
            cost: 2,
            charges: 1,
            overload: 0,
            additionalCost: 0
        }]
    })

    expect(arsenal.export()).toEqual({
        skills: [{
            id: 'madness',
            cost: 2,
            charges: 0,
            overload: 0,
            additionalCost: 0
        }, {
            id: 'ruin',
            cost: 2,
            charges: 1,
            overload: 0,
            additionalCost: 0
        }]
    })
})
