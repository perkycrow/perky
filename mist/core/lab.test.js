import {test, expect, beforeEach} from 'vitest'
import Lab from './lab.js'
import Random from '../../math/random.js'


function createLab (params = {}) {
    return new Lab(Object.assign({
        reagents: ['branch', 'match', 'fireBranch', 'fire', 'coal', 'fireCoal', 'waterDrop', 'water', 'waterCauldron', 'root', 'mud', 'wheat', 'lys', 'butterfly', 'flower', 'fern', 'leaf', 'thistle', 'spiderEggs', 'cloud', 'salt', 'mushroom', 'fish', 'bee', 'bottle', 'slime', 'tube', 'flask', 'jar', 'eye', 'bone', 'skull']
    }, params))
}


let game

beforeEach(() => {
    const random = new Random('hello')
    game = {
        random,
        weightedChoice: (choices) => random.weightedChoice(choices)
    }
})


test('unlocked', () => {
    {
        const lab = createLab({unlockedCount: 3})
        expect(lab.unlocked).toEqual(['branch', 'match', 'fireBranch'])
    }
    {
        const lab = createLab({unlockedCount: 5})
        expect(lab.unlocked).toEqual(['branch', 'match', 'fireBranch', 'fire', 'coal'])
    }
})


test('last', () => {
    {
        const lab = createLab({unlockedCount: 3})
        expect(lab.last).toEqual('fireBranch')
    }
    {
        const lab = createLab({unlockedCount: 5})
        expect(lab.last).toEqual('coal')
    }
})


test('lastCleared', () => {
    {
        const lab = createLab({unlockedCount: 3, clearedCount: 1})
        expect(lab.lastCleared).toEqual('branch')
    }
    {
        const lab = createLab({unlockedCount: 5, clearedCount: 3})
        expect(lab.lastCleared).toEqual('fireBranch')
    }
})


test('next', () => {
    {
        const lab = createLab({unlockedCount: 3})
        expect(lab.next).toEqual('fire')
    }
    {
        const lab = createLab({unlockedCount: 5})
        expect(lab.next).toEqual('fireCoal')
    }
})


test('playable', () => {
    {
        const lab = createLab({unlockedCount: 4, activeCount: 2, clearedCount: 1})
        expect(lab.playable).toEqual(['match', 'fireBranch', 'fire'])
    }
    {
        const lab = createLab({unlockedCount: 7, activeCount: 1, clearedCount: 4})
        expect(lab.playable).toEqual(['coal', 'fireCoal', 'waterDrop'])
    }
})


test('active', () => {
    {
        const lab = createLab({unlockedCount: 7, activeCount: 2, clearedCount: 2})
        expect(lab.active).toEqual(['fireCoal', 'waterDrop'])
    }
    {
        const lab = createLab({unlockedCount: 6, activeCount: 1, clearedCount: 3})
        expect(lab.active).toEqual(['fireCoal'])
    }
})


test('cleared', () => {
    {
        const lab = createLab({unlockedCount: 3, activeCount: 2, clearedCount: 1})
        expect(lab.cleared).toEqual(['branch'])
    }
    {
        const lab = createLab({unlockedCount: 5, neglectedCount: 3, clearedCount: 2})
        expect(lab.cleared).toEqual(['branch', 'match'])
    }
})


test('neglected', () => {
    {
        const lab = createLab({unlockedCount: 7, activeCount: 2, clearedCount: 1})
        expect(lab.neglected).toEqual(['match', 'fireBranch', 'fire', 'coal'])
    }

    {
        const lab = createLab({unlockedCount: 5, activeCount: 3, clearedCount: 1})
        expect(lab.neglected).toEqual(['match'])
    }

    {
        const lab = createLab({unlockedCount: 7, activeCount: 3, clearedCount: 4})
        expect(lab.neglected).toEqual([])
    }
})


test('isLast', () => {
    const lab = createLab({unlockedCount: 7, activeCount: 2, clearedCount: 1})
    expect(lab.isLast('waterDrop')).toBeTruthy()
    expect(lab.isLast('branch')).toBeFalsy()
})


test('isNext', () => {
    const lab = createLab({unlockedCount: 7, activeCount: 2, clearedCount: 1})
    expect(lab.isNext('water')).toBeTruthy()
    expect(lab.isNext('waterDrop')).toBeFalsy()
})


test('isUnlocked', () => {
    const lab = createLab({unlockedCount: 7, activeCount: 2, clearedCount: 1})
    expect(lab.isUnlocked('branch')).toBeTruthy()
    expect(lab.isUnlocked('water')).toBeFalsy()
})


test('isActive', () => {
    const lab = createLab({unlockedCount: 7, activeCount: 2, clearedCount: 1})
    expect(lab.isActive('fire')).toBeFalsy()
    expect(lab.isActive('fireCoal')).toBeTruthy()
    expect(lab.isActive('waterDrop')).toBeTruthy()
    expect(lab.isActive('branch')).toBeFalsy()
})


test('isNeglected', () => {
    const lab = createLab({unlockedCount: 7, activeCount: 2, clearedCount: 1})
    expect(lab.isNeglected('match')).toBeTruthy()
    expect(lab.isNeglected('coal')).toBeTruthy()
    expect(lab.isNeglected('waterDrop')).toBeFalsy()
    expect(lab.isNeglected('branch')).toBeFalsy()
})


test('isCleared', () => {
    const lab = createLab({unlockedCount: 7, activeCount: 2, clearedCount: 1})
    expect(lab.isCleared('branch')).toBeTruthy()
    expect(lab.isCleared('match')).toBeFalsy()
})


test('unlockNext', () => {
    const lab = createLab({unlockedCount: 7, activeCount: 2, clearedCount: 1})
    lab.unlockNext()

    expect(lab.unlocked).toEqual(['branch', 'match', 'fireBranch', 'fire', 'coal', 'fireCoal', 'waterDrop', 'water'])
    expect(lab.cleared).toEqual(['branch'])
    expect(lab.active).toEqual(['waterDrop', 'water'])
    expect(lab.neglected).toEqual(['match', 'fireBranch', 'fire', 'coal', 'fireCoal'])
    expect(lab.playable).toEqual(['match', 'fireBranch', 'fire', 'coal', 'fireCoal', 'waterDrop', 'water'])
})


test('clearNext', () => {
    const lab = createLab({unlockedCount: 7, activeCount: 2, clearedCount: 1})
    lab.clearNext()

    expect(lab.unlocked).toEqual(['branch', 'match', 'fireBranch', 'fire', 'coal', 'fireCoal', 'waterDrop'])
    expect(lab.cleared).toEqual(['branch', 'match'])
    expect(lab.active).toEqual(['fireCoal', 'waterDrop'])
    expect(lab.neglected).toEqual(['fireBranch', 'fire', 'coal'])
    expect(lab.playable).toEqual(['fireBranch', 'fire', 'coal', 'fireCoal', 'waterDrop'])
})


test('unlock', () => {
    const lab = createLab({unlockedCount: 4, activeCount: 2, clearedCount: 1})
    lab.unlock('water')

    expect(lab.unlocked).toEqual(['branch', 'match', 'fireBranch', 'fire', 'coal', 'fireCoal', 'waterDrop', 'water'])
    expect(lab.cleared).toEqual(['branch'])
    expect(lab.active).toEqual(['waterDrop', 'water'])
    expect(lab.neglected).toEqual(['match', 'fireBranch', 'fire', 'coal', 'fireCoal'])
    expect(lab.playable).toEqual(['match', 'fireBranch', 'fire', 'coal', 'fireCoal', 'waterDrop', 'water'])
})


test('clear', () => {
    const lab = createLab({unlockedCount: 7, activeCount: 2, clearedCount: 1})
    lab.clear('fireBranch')

    expect(lab.unlocked).toEqual(['branch', 'match', 'fireBranch', 'fire', 'coal', 'fireCoal', 'waterDrop'])
    expect(lab.cleared).toEqual(['branch', 'match', 'fireBranch'])
    expect(lab.active).toEqual(['fireCoal', 'waterDrop'])
    expect(lab.neglected).toEqual(['fire', 'coal'])
    expect(lab.playable).toEqual(['fire', 'coal', 'fireCoal', 'waterDrop'])
})


test('restore', () => {
    const lab = createLab({unlockedCount: 7, activeCount: 2, clearedCount: 1})
    const state = lab.export()
    lab.clear('fireBranch')
    lab.restore(state)

    expect(lab.unlocked).toEqual(['branch', 'match', 'fireBranch', 'fire', 'coal', 'fireCoal', 'waterDrop'])
    expect(lab.cleared).toEqual(['branch'])
    expect(lab.active).toEqual(['fireCoal', 'waterDrop'])
    expect(lab.neglected).toEqual(['match', 'fireBranch', 'fire', 'coal'])
    expect(lab.playable).toEqual(['match', 'fireBranch', 'fire', 'coal', 'fireCoal', 'waterDrop'])
})


test('buildReagent', () => {
    const lab = createLab({unlockedCount: 4, activeCount: 4})

    const reagentA = lab.buildReagent({}, game)
    expect(reagentA.x).toEqual(0)
    expect(reagentA.y).toEqual(0)
    expect(lab.playable.includes(reagentA.name)).toBeTruthy()

    expect(lab.buildReagent({name: 'water'})).toEqual({x: 0, y: 0, name: 'water'})

    const reagentB = lab.buildReagent({x: 1, y: 1}, game)
    expect(reagentB.x).toEqual(1)
    expect(reagentB.y).toEqual(1)
    expect(lab.playable.includes(reagentB.name)).toBeTruthy()

    expect(lab.buildReagent({x: 1, y: 1, name: 'water'})).toEqual({x: 1, y: 1, name: 'water'})
})


test('buildCluster', () => {
    const lab = createLab({unlockedCount: 4, activeCount: 4})
    {
        const cluster = lab.buildCluster({}, game)
        expect(cluster.reagents.length).toEqual(2)
        expect(cluster.reagents.every(r => lab.playable.includes(r.name))).toBeTruthy()
    }
    {
        const cluster = lab.buildCluster({pairs: true}, game)
        expect(cluster.reagents[0].name).toEqual(cluster.reagents[1].name)
    }
    {
        const cluster = lab.buildCluster({count: 1}, game)
        expect(cluster.reagents.length).toEqual(1)
    }
})
