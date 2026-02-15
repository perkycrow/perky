import {test, expect} from 'vitest'
import RuinSkill from './ruin_skill.js'
import Board from '../core/board.js'
import Random from '../../math/random.js'


test('static properties', () => {
    expect(RuinSkill.cost).toEqual(8)
    expect(new RuinSkill().id).toEqual('ruin')
})


test('trigger', () => {
    const skill = new RuinSkill()
    const board = new Board()
    const random = new Random('test')

    board.setReagent({x: 0, y: 0, name: 'A'})
    board.setReagent({x: 1, y: 0, name: 'B'})
    board.setReagent({x: 2, y: 0, name: 'C'})
    board.setReagent({x: 3, y: 0, name: 'D'})

    const queue = []
    const flow = {enqueue: (name, ...args) => queue.push({name, args})}
    const game = {board, random}

    expect(skill.trigger(flow, game)).toBeTruthy()
    expect(queue.length).toEqual(2)
    expect(queue[0].name).toEqual('removeReagents')
    expect(queue[0].args[0].length).toEqual(3)
    expect(queue[1].name).toEqual('applyRules')
})
