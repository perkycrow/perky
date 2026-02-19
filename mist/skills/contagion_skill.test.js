import {test, expect} from 'vitest'
import ContagionSkill from './contagion_skill.js'
import Board from '../entities/board.js'


test('static properties', () => {
    expect(ContagionSkill.cost).toEqual(6)
    expect(new ContagionSkill().id).toEqual('contagion')
})


test('trigger', () => {
    const skill = new ContagionSkill()
    const board = new Board()

    board.setReagent({x: 0, y: 0, name: 'A'})
    board.setReagent({x: 1, y: 0, name: 'B'})
    board.setReagent({x: 2, y: 0, name: 'C'})
    board.setReagent({x: 3, y: 0, name: 'D'})

    const queue = []
    const flow = {enqueue: (name, ...args) => queue.push({name, args})}
    const lab = {reagents: ['A', 'B', 'C', 'D']}
    const game = {board, lab}

    expect(skill.trigger(flow, game)).toBeTruthy()
    expect(queue.length).toEqual(2)
    expect(queue[0].name).toEqual('evolveReagents')
    expect(queue[0].args[0].length).toEqual(3)
    expect(queue[0].args[0][0].name).toEqual('A')
    expect(queue[1].name).toEqual('applyRules')
})
