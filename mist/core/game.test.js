import {test, expect} from 'vitest'
import Game from './game.js'
import {simplifyReagents} from '../libs/test_utils.js'

const availableReagents = 'ABCDEF'.split('')
const gameActions = [
    'start',
    'dropCluster',
    'rotateCluster'
]


function recordActions (game) {
    const triggered = []
    const {actionSet} = game

    gameActions.forEach(name => {
        actionSet.hook(name, () => triggered.push(name))
    })

    return triggered
}


test('integration', async () => {
    const game = new Game({
        seed: 'hello',
        board: {},
        lab: {
            unlockedCount: 4,
            activeCount:   4,
            clearedCount:  0,
            reagents:      availableReagents
        },
        workshop: {}
    })

    const {lab, workshop, board} = game

    const triggered = recordActions(game)

    expect(lab.unlocked).toEqual(['A', 'B', 'C', 'D'])
    expect(lab.active).toEqual(['A', 'B', 'C', 'D'])


    expect(game.started).toBeFalsy()
    await game.triggerUserAction('start')
    expect(game.started).toBeTruthy()

    expect(triggered).toEqual(['start'])

    await game.triggerUserAction('dropCluster')

    expect(simplifyReagents(board.reagents)).toEqual(['D(2,0)', 'B(3,0)'])
    expect(simplifyReagents(workshop.currentCluster.reagents)).toEqual(['C(2,0)', 'C(3,0)'])

    await game.triggerUserAction('rotateCluster')
    await game.triggerUserAction('dropCluster')

    expect(simplifyReagents(board.reagents)).toEqual(['D(2,0)', 'B(3,0)', 'C(2,1)', 'C(2,2)'])

    expect(triggered).toEqual([
        'start',
        'dropCluster',
        'rotateCluster',
        'dropCluster'
    ])


    await game.triggerUserAction('dropCluster')
    await game.triggerUserAction('rotateCluster')
    await game.triggerUserAction('rotateCluster')
    await game.triggerUserAction('dropCluster')

    await game.triggerUserAction('dropCluster')

    await game.triggerUserAction('moveCluster', 'right')
    await game.triggerUserAction('moveCluster', 'right')

    await game.triggerUserAction('dropCluster')
    await game.triggerUserAction('rotateCluster')
    await game.triggerUserAction('moveCluster', 'right')
    await game.triggerUserAction('moveCluster', 'right')
    await game.triggerUserAction('moveCluster', 'right')
    await game.triggerUserAction('dropCluster')
    await game.triggerUserAction('moveCluster', 'right')
    const flow = await game.triggerUserAction('dropCluster')


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


    expect(game.digest).toEqual({
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
