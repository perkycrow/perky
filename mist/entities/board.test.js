import {test, expect, beforeEach} from 'vitest'
import Board from './board.js'


function createReagent (x = 0, y = 0, name = 'flask') {
    return {x, y, name}
}


function debugImport (board, lines) {
    lines.reverse().forEach((line, y) => {
        line.forEach((name, x) => {
            if (name) {
                board.setReagent({x, y, name})
            }
        })
    })
}


let board
let reagent

beforeEach(() => {
    board = new Board({width: 6, height: 9})
    reagent = createReagent(0, 0)
})


test('restore', () => {
    board.restore({reagents: [reagent]})
    expect(board.export().reagents).toEqual([reagent])
})


test('restore - order', () => {
    const reagents = [
        {x: 0, y: 0, order: 4, name: 'flask'},
        {x: 1, y: 0, order: 5, name: 'flask'},
        {x: 2, y: 0, order: 6, name: 'flask'},
        {x: 3, y: 0, order: 7, name: 'flask'},
        {x: 4, y: 0, order: 8, name: 'flask'}
    ]

    board.restore({reagents})
    expect(board.export().reagents).toEqual(reagents)
    expect(board.order).toEqual(9)
})


test('setReagent', () => {
    board.setReagent(reagent)
    expect(board.export().reagents).toEqual([reagent])
})


test('getReagent', () => {
    board.setReagent(reagent)
    expect(board.getReagent({x: 0, y: 0})).toEqual(reagent)
})


test('removeReagent', () => {
    board.setReagent(reagent)
    expect(board.removeReagent(reagent)).toBeTruthy()
    expect(board.removeReagent(reagent)).toBeFalsy()
    expect(board.getReagent({x: 0, y: 0})).toBeUndefined()
})


test('clearCell', () => {
    board.setReagent(reagent)
    board.clearCell(reagent)
    expect(board.getReagent({x: 0, y: 0})).toBeUndefined()
})


test('clear', () => {
    board.clear(reagent)
    expect(board.getReagent({x: 0, y: 0})).toBeUndefined()
})


test('syncReagents', () => {
    board.setReagent(reagent)
    reagent.x = 1
    board.syncReagents()
    expect(reagent.x).toEqual(0)
})


test('array', () => {
    const reagents = [
        createReagent(0, 0, 'flask'),
        createReagent(1, 0, 'flask'),
        createReagent(2, 0, 'water'),
        createReagent(3, 0, 'water'),
        createReagent(4, 0, 'water')
    ]

    board.restore({reagents})

    expect(board.map(el => el.name)).toEqual(['flask', 'flask', 'water', 'water', 'water'])
    expect(board.sort((a, b) => b.x - a.x)).toEqual(Array.from(reagents).reverse())
    expect(board.filter(el => el.name === 'flask')).toEqual(reagents.slice(0, 2))
    expect(board.find(el => el.name === 'water')).toEqual(reagents[2])
})


test('neighbourOf', () => {
    const reagents = [
        createReagent(0, 0, 'flask'),
        createReagent(1, 0, 'flask'),
        createReagent(2, 0, 'water')
    ]

    board.restore({reagents})

    expect(board.neighbourOf(reagents[1], {x: 1, y: 0})).toEqual(reagents[2])
})


test('isInside', () => {
    expect(board.isInside({x: 10, y: 0})).toBeFalsy()
    expect(board.isInside({x: 2, y: 0})).toBeTruthy()
})


test('moveReagent', () => {
    board.setReagent(reagent)
    expect(board.moveReagent(reagent, {x: -1, y: 0})).toBeFalsy()
    expect(board.getReagent({x: 0, y: 0})).toEqual(reagent)

    expect(board.moveReagent(reagent, {x: 1, y: 0})).toBeTruthy()
    expect(board.getReagent({x: 0, y: 0})).toBeUndefined()
    expect(board.getReagent({x: 1, y: 0})).toEqual(reagent)
})


test('applyGravity', () => {
    const reagents = [
        createReagent(0, 3, 'flask'),
        createReagent(0, 0, 'flask'),
        createReagent(1, 0, 'flask'),
        createReagent(2, 3, 'water')
    ]

    board.restore({reagents})
    board.applyGravity()

    expect(board.getReagent({x: 0, y: 1})).toEqual(reagents[0])
    expect(board.getReagent({x: 0, y: 0})).toEqual(reagents[1])
    expect(board.getReagent({x: 1, y: 0})).toEqual(reagents[2])
    expect(board.getReagent({x: 2, y: 0})).toEqual(reagents[3])
})


test('getDirectMatchesFor', () => {
    debugImport(board, [
        ['x', 'x', 'x', null, 'x', 'x'],
        ['x', 'x', 'x', null, 'x', 'x'],
        ['x', 'x', 'x', null, 'x', 'x']
    ])

    expect(board.getDirectMatchesFor({x: 0, y: 0}, {x: 1, y: 0})).toEqual([
        board.getReagent({x: 0, y: 0}),
        board.getReagent({x: 1, y: 0}),
        board.getReagent({x: 2, y: 0})
    ])

    expect(board.getDirectMatchesFor({x: 0, y: 0}, {x: 0, y: 1})).toEqual([
        board.getReagent({x: 0, y: 0}),
        board.getReagent({x: 0, y: 1}),
        board.getReagent({x: 0, y: 2})
    ])
})


test('getAllDirectMatchesFor', () => {
    debugImport(board, [
        ['x', 'x', 'x', null, 'x', 'x'],
        ['x', 'x', 'x', null, 'x', 'x'],
        ['x', 'x', 'x', null, 'x', 'x']
    ])

    expect(board.getAllDirectMatchesFor({x: 1, y: 1})).toEqual([
        board.getReagent({x: 1, y: 1}),
        board.getReagent({x: 1, y: 2}),
        board.getReagent({x: 2, y: 1}),
        board.getReagent({x: 1, y: 0}),
        board.getReagent({x: 0, y: 1})
    ])
})


test('getMatchesFor', () => {
    debugImport(board, [
        ['x', null, 'x', 'x', 'x', 'x'],
        ['x', null, 'x', null, null, 'x'],
        ['x', 'x', 'x', null, null, 'x'],
        ['x', 'x', 'z', null, 'x', 'x']
    ])

    expect(board.getMatchesFor({x: 1, y: 1})).toEqual([
        board.getReagent({x: 1, y: 1}),
        board.getReagent({x: 2, y: 1}),
        board.getReagent({x: 2, y: 2}),
        board.getReagent({x: 2, y: 3}),
        board.getReagent({x: 3, y: 3}),
        board.getReagent({x: 4, y: 3}),
        board.getReagent({x: 5, y: 3}),
        board.getReagent({x: 5, y: 2}),
        board.getReagent({x: 5, y: 1}),
        board.getReagent({x: 5, y: 0}),
        board.getReagent({x: 4, y: 0}),
        board.getReagent({x: 0, y: 1}),
        board.getReagent({x: 0, y: 2}),
        board.getReagent({x: 0, y: 3}),
        board.getReagent({x: 0, y: 0}),
        board.getReagent({x: 1, y: 0})
    ])
})


test('getMergeFor', () => {
    debugImport(board, [
        [null, null, null, null, null, null],
        [null, null, null, null, null, null],
        [null, null, null, null, null, null],
        [null, 'z', 'z', 'x', 'x', 'x']
    ])

    expect(board.getMergeFor({x: 0, y: 0})).toBeNull()

    expect(board.getMergeFor({x: 3, y: 0})).toEqual([
        {x: 3, y: 0, name: 'x', order: 2},
        {x: 4, y: 0, name: 'x', order: 3},
        {x: 5, y: 0, name: 'x', order: 4}
    ])

    expect(board.getMergeFor({x: 1, y: 0})).toBeNull()

    expect(board.getMergeFor({x: 1, y: 0}, 2)).toEqual([
        {x: 1, y: 0, name: 'z', order: 0},
        {x: 2, y: 0, name: 'z', order: 1}
    ])
})


test('getNextMerge', () => {
    debugImport(board, [
        [null, null, null, null, null, null],
        [null, null, null, null, null, null],
        [null, null, null, null, null, null],
        [null, 'z', 'z', 'x', 'x', 'x']
    ])

    const lab = {reagents: ['x', 'y', 'z']}

    expect(board.getNextMerge(3, lab)).toEqual([
        {x: 5, y: 0, name: 'x', order: 4},
        {x: 4, y: 0, name: 'x', order: 3},
        {x: 3, y: 0, name: 'x', order: 2}
    ])

    expect(board.getNextMerge(2, lab)).toEqual([
        {x: 5, y: 0, name: 'x', order: 4},
        {x: 4, y: 0, name: 'x', order: 3},
        {x: 3, y: 0, name: 'x', order: 2}
    ])
})


test('getDistribution', () => {
    debugImport(board, [
        ['x', null, 'c', 'x', 'c', 'x'],
        ['x', null, 'x', null, null, 'x'],
        ['x', 'x', 'x', null, null, 'x'],
        ['x', 'z', 'z', null, 'x', 's']
    ])

    expect(board.getDistribution()).toEqual({x: 12, z: 2, s: 1, c: 2})
})


test('getReagents', () => {
    debugImport(board, [
        ['x', null, 'c', 'x', 'c', 'x'],
        ['x', null, 'x', null, null, 'x'],
        ['x', 'x', 'x', null, null, 'x'],
        ['x', 'z', 'z', null, 'x', 's']
    ])

    expect(board.getReagents()).toEqual([
        {x: 0, y: 0, name: 'x', order: 0},
        {x: 1, y: 0, name: 'z', order: 1},
        {x: 2, y: 0, name: 'z', order: 2},
        {x: 4, y: 0, name: 'x', order: 3},
        {x: 5, y: 0, name: 's', order: 4},
        {x: 0, y: 1, name: 'x', order: 5},
        {x: 1, y: 1, name: 'x', order: 6},
        {x: 2, y: 1, name: 'x', order: 7},
        {x: 5, y: 1, name: 'x', order: 8},
        {x: 0, y: 2, name: 'x', order: 9},
        {x: 2, y: 2, name: 'x', order: 10},
        {x: 5, y: 2, name: 'x', order: 11},
        {x: 0, y: 3, name: 'x', order: 12},
        {x: 2, y: 3, name: 'c', order: 13},
        {x: 3, y: 3, name: 'x', order: 14},
        {x: 4, y: 3, name: 'c', order: 15},
        {x: 5, y: 3, name: 'x', order: 16}
    ])

    expect(board.getReagents({count: 5})).toEqual([
        {x: 0, y: 0, name: 'x', order: 0},
        {x: 1, y: 0, name: 'z', order: 1},
        {x: 2, y: 0, name: 'z', order: 2},
        {x: 4, y: 0, name: 'x', order: 3},
        {x: 5, y: 0, name: 's', order: 4}
    ])

    expect(board.getReagents({sortBy: 'x', count: 5})).toEqual([
        {x: 0, y: 0, name: 'x', order: 0},
        {x: 0, y: 1, name: 'x', order: 5},
        {x: 0, y: 2, name: 'x', order: 9},
        {x: 0, y: 3, name: 'x', order: 12},
        {x: 1, y: 0, name: 'z', order: 1}
    ])

    expect(board.getReagents({sortBy: 'x', reverse: true, count: 5})).toEqual([
        {x: 5, y: 3, name: 'x', order: 16},
        {x: 5, y: 2, name: 'x', order: 11},
        {x: 5, y: 1, name: 'x', order: 8},
        {x: 5, y: 0, name: 's', order: 4},
        {x: 4, y: 3, name: 'c', order: 15}
    ])
})


test('has', () => {
    debugImport(board, [
        ['x', null, 'c', 'x', 'c', 'x'],
        ['x', null, 'x', null, null, 'x'],
        ['x', 'x', 'x', null, null, 'x'],
        ['x', 'z', 'z', null, 'x', 's']
    ])

    expect(board.has('x')).toBeTruthy()
    expect(board.has('z')).toBeTruthy()
    expect(board.has('a')).toBeFalsy()
})


test('fourNeighboursOf', () => {
    debugImport(board, [
        [null, 'a', null],
        ['b', 'x', 'c'],
        [null, 'd', null]
    ])

    const neighbours = board.fourNeighboursOf({x: 1, y: 1})

    expect(neighbours.length).toEqual(4)
    expect(neighbours).toContainEqual(board.getReagent({x: 1, y: 2}))
    expect(neighbours).toContainEqual(board.getReagent({x: 2, y: 1}))
    expect(neighbours).toContainEqual(board.getReagent({x: 1, y: 0}))
    expect(neighbours).toContainEqual(board.getReagent({x: 0, y: 1}))
})


test('fourNeighboursOf - corner', () => {
    debugImport(board, [
        ['x', 'a', null],
        ['b', null, null]
    ])

    const neighbours = board.fourNeighboursOf({x: 0, y: 0})

    expect(neighbours.length).toEqual(1)
    expect(neighbours).toContainEqual(board.getReagent({x: 0, y: 1}))
})


test('evolveReagent', () => {
    board.setReagent(reagent)
    const originalOrder = reagent.order

    expect(board.evolveReagent(reagent, 'water')).toBe(true)
    expect(reagent.name).toEqual('water')
    expect(reagent.order).toBeGreaterThan(originalOrder)

    expect(board.evolveReagent(reagent, null)).toBe(false)
    expect(reagent.name).toEqual('water')
})


test('swapReagents', () => {
    const reagentA = createReagent(0, 0, 'A')
    const reagentB = createReagent(2, 1, 'B')

    board.setReagent(reagentA)
    board.setReagent(reagentB)

    board.swapReagents(reagentA, reagentB)

    expect(reagentA.x).toEqual(2)
    expect(reagentA.y).toEqual(1)
    expect(reagentB.x).toEqual(0)
    expect(reagentB.y).toEqual(0)
    expect(board.getReagent({x: 0, y: 0})).toEqual(reagentB)
    expect(board.getReagent({x: 2, y: 1})).toEqual(reagentA)
})


test('moveEverythingRight', () => {
    debugImport(board, [
        ['a', 'b', null, null, null, 'c']
    ])

    board.moveEverythingRight()

    expect(board.getReagent({x: 0, y: 0}).name).toEqual('c')
    expect(board.getReagent({x: 1, y: 0}).name).toEqual('a')
    expect(board.getReagent({x: 2, y: 0}).name).toEqual('b')
})


test('toArray', () => {
    const reagentA = createReagent(0, 0, 'A')
    const reagentB = createReagent(1, 0, 'B')

    board.setReagent(reagentB)
    board.setReagent(reagentA)

    const array = board.toArray()

    expect(array.length).toEqual(2)
    expect(array[0]).toEqual(reagentB)
    expect(array[1]).toEqual(reagentA)
})


test('getRow', () => {
    debugImport(board, [
        ['a', null, 'b'],
        ['c', 'd', 'e']
    ])

    const row0 = board.getRow(0)
    const row1 = board.getRow(1)

    expect(row0.length).toEqual(3)
    expect(row0.map(r => r.name)).toEqual(['c', 'd', 'e'])
    expect(row1.length).toEqual(2)
    expect(row1.map(r => r.name)).toEqual(['a', 'b'])
})


test('getCol', () => {
    debugImport(board, [
        ['a', null, 'b'],
        ['c', 'd', 'e']
    ])

    const col0 = board.getCol(0)
    const col2 = board.getCol(2)

    expect(col0.length).toEqual(2)
    expect(col0.map(r => r.name)).toEqual(['c', 'a'])
    expect(col2.length).toEqual(2)
    expect(col2.map(r => r.name)).toEqual(['e', 'b'])
})


test('initGame', () => {
    board.initGame({seed: 'test-seed'})

    expect(board.gameId).toBeDefined()
    expect(board.seed).toEqual('test-seed')
    expect(board.random).toBeDefined()
    expect(board.workshop).toBeDefined()
    expect(board.lab).toBeDefined()
    expect(board.arsenal).toBeDefined()
    expect(board.vault).toBeDefined()
    expect(board.ended).toBe(false)
    expect(board.playing).toBe(false)
})


test('weightedChoice', () => {
    board.initGame({seed: 'fixed-seed'})

    const choices = [
        {value: 'a', weight: 100},
        {value: 'b', weight: 0}
    ]

    const result = board.weightedChoice(choices)
    expect(result).toEqual('a')
})


test('exportGame', () => {
    board.initGame({seed: 'export-test'})

    const exported = board.exportGame()

    expect(exported.id).toBeDefined()
    expect(exported.seed).toEqual('export-test')
    expect(exported.randomState).toBeDefined()
    expect(exported.board).toBeDefined()
    expect(exported.lab).toBeDefined()
    expect(exported.workshop).toBeDefined()
    expect(exported.arsenal).toBeDefined()
    expect(exported.vault).toBeDefined()
    expect(exported.ended).toBe(false)
    expect(exported.digest).toEqual({})
})
