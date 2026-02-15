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
