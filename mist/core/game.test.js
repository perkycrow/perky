import {test, expect} from 'vitest'
import Board from '../entities/board.js'
import {simplifyReagents} from '../libs/test_utils.js'

const availableReagents = 'ABCDEF'.split('')
const gameActions = [
    'start',
    'dropCluster',
    'rotateCluster'
]


function recordActions (board) {
    const triggered = []
    const {actionSet} = board

    gameActions.forEach(name => {
        actionSet.hook(name, () => triggered.push(name))
    })

    return triggered
}


test('integration', async () => {
    const board = new Board()
    board.initGame({
        seed: 'hello',
        lab: {
            unlockedCount: 4,
            activeCount:   4,
            clearedCount:  0,
            reagents:      availableReagents
        }
    })

    const {lab, workshop} = board

    const triggered = recordActions(board)

    expect(lab.unlocked).toEqual(['A', 'B', 'C', 'D'])
    expect(lab.active).toEqual(['A', 'B', 'C', 'D'])


    expect(board.playing).toBeFalsy()
    await board.triggerUserAction('start')
    expect(board.playing).toBeTruthy()

    expect(triggered).toEqual(['start'])

    await board.triggerUserAction('dropCluster')

    expect(simplifyReagents(board.reagents)).toEqual(['D(2,0)', 'B(3,0)'])
    expect(simplifyReagents(workshop.currentCluster.reagents)).toEqual(['C(2,0)', 'C(3,0)'])

    await board.triggerUserAction('rotateCluster')
    await board.triggerUserAction('dropCluster')

    expect(simplifyReagents(board.reagents)).toEqual(['D(2,0)', 'B(3,0)', 'C(2,1)', 'C(2,2)'])

    expect(triggered).toEqual([
        'start',
        'dropCluster',
        'rotateCluster',
        'dropCluster'
    ])


    await board.triggerUserAction('dropCluster')
    await board.triggerUserAction('rotateCluster')
    await board.triggerUserAction('rotateCluster')
    await board.triggerUserAction('dropCluster')

    await board.triggerUserAction('dropCluster')

    await board.triggerUserAction('moveCluster', 'right')
    await board.triggerUserAction('moveCluster', 'right')

    await board.triggerUserAction('dropCluster')
    await board.triggerUserAction('rotateCluster')
    await board.triggerUserAction('moveCluster', 'right')
    await board.triggerUserAction('moveCluster', 'right')
    await board.triggerUserAction('moveCluster', 'right')
    await board.triggerUserAction('dropCluster')
    await board.triggerUserAction('moveCluster', 'right')
    const flow = await board.triggerUserAction('dropCluster')


    expect(flow.actionsHistory).toEqual([
        'dropCluster',         'chargeSkill',
        'applyRules',          'applyRulesRecursive',
        'applyGravity',        'applyNextMerge',
        'mergeReagents',       'unlockReagent',
        'evolveReagents',      'clearReagents',
        'chargeSkill',         'applyRulesRecursive',
        'applyGravity',        'applyNextMerge',
        'mergeReagents',       'unlockReagent',
        'evolveReagents',      'clearReagents',
        'chargeSkill',         'chargeSkill',
        'applyRulesRecursive', 'applyGravity',
        'applyNextMerge',      'overflow',
        'addCluster',          'digestAction',
        'checkObjective'
    ])


    expect(flow.digest).toEqual({
        merges: [{name: 'A', length: 3}, {name: 'B', length: 3}],
        mergesCount: 2,
        chainsCount: 1,
        dropCluster: 1,
        action: 'dropCluster'
    })


    expect(board.digest).toEqual({
        mergesCount: 5,
        chainsCount: 2,
        score: 1620,
        start: 1,
        dropCluster: 8,
        rotateCluster: 4,
        moveCluster: 6
    })

    expect(simplifyReagents(board.reagents)).toEqual(['D(2,0)', 'A(2,1)', 'C(5,0)', 'E(3,0)', 'C(4,0)', 'C(3,1)'])

})
