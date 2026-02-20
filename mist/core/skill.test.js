import {test, expect} from 'vitest'
import Skill from './skill.js'


test('charge', () => {
    {
        const skill = new Skill({
            cost:    3,
            charges: 1
        })

        expect(skill.charge()).toBeTruthy()
        expect(skill.charges).toEqual(2)

        expect(skill.charge()).toBeTruthy()
        expect(skill.charges).toEqual(3)

        expect(skill.charge()).toBeFalsy()
        expect(skill.charges).toEqual(3)
    }
    {
        const skill = new Skill({
            cost:     3,
            charges:  1,
            overload: 1
        })

        expect(skill.charge()).toBeTruthy()
        expect(skill.charges).toEqual(2)

        expect(skill.charge()).toBeTruthy()
        expect(skill.charges).toEqual(3)

        expect(skill.charge()).toBeTruthy()
        expect(skill.charges).toEqual(4)

        expect(skill.charge()).toBeFalsy()
        expect(skill.charges).toEqual(4)
    }
    {
        const skill = new Skill({
            cost:     3,
            charges:  1,
            overload: 1,
            additionalCost: 1
        })

        expect(skill.charge()).toBeTruthy()
        expect(skill.charges).toEqual(2)

        expect(skill.charge()).toBeTruthy()
        expect(skill.charges).toEqual(3)

        expect(skill.charge()).toBeTruthy()
        expect(skill.charges).toEqual(4)

        expect(skill.charge()).toBeTruthy()
        expect(skill.charges).toEqual(5)

        expect(skill.charge()).toBeFalsy()
        expect(skill.charges).toEqual(5)
    }
})


test('ready', () => {
    const skill = new Skill({
        cost:    3,
        charges: 2
    })

    expect(skill.ready).toBeFalsy()
    skill.charge()

    expect(skill.ready).toBeTruthy()
})


test('drain', () => {
    {
        const skill = new Skill({
            cost:     3,
            charges:  2
        })

        skill.drain()
        expect(skill.charges).toEqual(0)
    }
    {
        const skill = new Skill({
            cost:     3,
            charges:  4,
            overload: 2
        })

        skill.drain()
        expect(skill.charges).toEqual(1)
    }
    {
        const skill = new Skill({
            cost:     3,
            charges:  5,
            overload: 1,
            additionalCost: 1
        })

        skill.drain()
        expect(skill.charges).toEqual(1)
    }
})


test('activate', () => {
    const skill = new Skill({
        cost:     3,
        charges:  2
    })

    expect(skill.activate()).toBeFalsy()
    skill.charge()
    expect(skill.activate()).toBeTruthy()
})


test('translate', () => {
    const skill = new Skill()
    expect(skill.translate('title', 'en')).toEqual('Skill')
    expect(skill.translate('title', 'fr')).toEqual('Competence')
    expect(skill.translate('description', 'en')).toEqual('Description')
})


test('trigger', () => {
    const skill = new Skill()
    expect(skill.trigger()).toBeTruthy()
})


test('restore', () => {
    const skill = new Skill({
        cost: 5,
        charges: 3,
        additionalCost: 2,
        overload: 1
    })

    expect(skill.cost).toEqual(5)
    expect(skill.charges).toEqual(3)

    skill.restore({
        cost: 10,
        charges: 0,
        additionalCost: 0,
        overload: 0
    })

    expect(skill.cost).toEqual(10)
    expect(skill.charges).toEqual(0)
    expect(skill.additionalCost).toEqual(0)
    expect(skill.overload).toEqual(0)
})


test('export', () => {
    const skill = new Skill({
        id: 'testSkill',
        cost: 5,
        charges: 3,
        additionalCost: 2,
        overload: 1
    })

    const exported = skill.export()

    expect(exported).toEqual({
        id: 'testSkill',
        cost: 5,
        charges: 3,
        additionalCost: 2,
        overload: 1
    })
})
