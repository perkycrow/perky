import {test, expect} from 'vitest'
import MadnessSkill from './madness_skill.js'


test('static properties', () => {
    expect(MadnessSkill.cost).toEqual(10)
    expect(new MadnessSkill().id).toEqual('madness')
})


test('trigger', () => {
    const skill = new MadnessSkill()
    const queue = []
    const flow = {enqueue: (name) => queue.push(name)}

    expect(skill.trigger(flow)).toBeTruthy()
    expect(queue).toEqual(['addCluster'])
})
