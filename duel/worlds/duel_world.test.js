import {describe, test, expect, vi} from 'vitest'
import DuelWorld from './duel_world.js'
import World from '../../game/world.js'
import Fencer from '../entities/fencer.js'


function createWorld () {
    const world = new DuelWorld()
    world.start()
    return world
}


function createWorldWithFencers () {
    const world = createWorld()
    world.spawnFencer1()
    world.spawnFencer2()
    return world
}


describe('DuelWorld', () => {

    test('extends World', () => {
        const world = new DuelWorld()
        expect(world).toBeInstanceOf(World)
    })


    test('starts with round active and no game over', () => {
        const world = createWorld()
        expect(world.roundActive).toBe(true)
        expect(world.gameOver).toBe(false)
    })


    test('spawnFencer1 creates fencer facing right', () => {
        const world = createWorld()
        const fencer = world.spawnFencer1()
        expect(fencer).toBeInstanceOf(Fencer)
        expect(fencer.facing).toBe(1)
        expect(fencer.x).toBe(-3)
        expect(world.fencer1).toBe(fencer)
    })


    test('spawnFencer2 creates fencer facing left', () => {
        const world = createWorld()
        const fencer = world.spawnFencer2()
        expect(fencer).toBeInstanceOf(Fencer)
        expect(fencer.facing).toBe(-1)
        expect(fencer.x).toBe(3)
        expect(world.fencer2).toBe(fencer)
    })


    test('spawnFencer1 accepts custom x', () => {
        const world = createWorld()
        const fencer = world.spawnFencer1({x: -5})
        expect(fencer.x).toBe(-5)
    })


    test('spawnFencer2 accepts custom x', () => {
        const world = createWorld()
        const fencer = world.spawnFencer2({x: 5})
        expect(fencer.x).toBe(5)
    })


    test('preUpdate applies P1 direction to fencer1', () => {
        const world = createWorldWithFencers()
        const context = {getDirection: vi.fn(() => ({x: 1, y: 0}))}

        world.preUpdate(1 / 60, context)

        expect(world.fencer1.moveDirection).toBe(1)
        expect(context.getDirection).toHaveBeenCalledWith('p1Move')
    })


    test('preUpdate applies P2 direction to fencer2', () => {
        const world = createWorldWithFencers()
        const context = {getDirection: vi.fn(() => ({x: -1, y: 0}))}

        world.preUpdate(1 / 60, context)

        expect(world.fencer2.moveDirection).toBe(-1)
        expect(context.getDirection).toHaveBeenCalledWith('p2Move')
    })


    test('postUpdate updates facing when fencers cross', () => {
        const world = createWorldWithFencers()
        world.fencer1.x = 5
        world.fencer2.x = -5
        world.postUpdate(1 / 60)

        expect(world.fencer1.facing).toBe(-1)
        expect(world.fencer2.facing).toBe(1)
    })


    test('lunge hit scores a point', () => {
        const world = createWorldWithFencers()

        world.fencer1.x = 0
        world.fencer2.x = world.fencer1.bodyRadius + world.fencer1.swordLength + world.fencer2.bodyRadius - 0.02
        world.fencer2.swordPosition = 'high'
        world.fencer1.swordPosition = 'mid'
        world.fencer1.lunge()

        const handler = vi.fn()
        world.on('point:scored', handler)

        world.postUpdate(1 / 60)

        expect(handler).toHaveBeenCalled()
        expect(world.fencer1.score).toBe(1)
    })


    test('matching sword position blocks the hit', () => {
        const world = createWorldWithFencers()

        world.fencer1.x = 0
        world.fencer2.x = world.fencer1.bodyRadius + world.fencer1.swordLength + world.fencer2.bodyRadius - 0.02
        world.fencer1.swordPosition = 'mid'
        world.fencer2.swordPosition = 'mid'
        world.fencer1.lunge()

        const handler = vi.fn()
        world.on('point:scored', handler)

        world.postUpdate(1 / 60)

        expect(handler).not.toHaveBeenCalled()
    })


    test('no lunge means no hit', () => {
        const world = createWorldWithFencers()

        world.fencer1.x = 0
        world.fencer2.x = 0.5

        const handler = vi.fn()
        world.on('point:scored', handler)

        world.postUpdate(1 / 60)

        expect(handler).not.toHaveBeenCalled()
    })


    test('respawn after scoring', () => {
        const world = createWorldWithFencers()

        world.fencer1.x = 0
        world.fencer2.x = world.fencer1.bodyRadius + world.fencer1.swordLength + world.fencer2.bodyRadius - 0.02
        world.fencer2.swordPosition = 'high'
        world.fencer1.lunge()
        world.postUpdate(1 / 60)

        expect(world.respawning).toBe(true)
        expect(world.roundActive).toBe(false)

        for (let i = 0; i < 120; i++) {
            world.postUpdate(1 / 60)
        }

        expect(world.respawning).toBe(false)
        expect(world.roundActive).toBe(true)
        expect(world.fencer1.x).toBe(-3)
        expect(world.fencer2.x).toBe(3)
    })


    test('game over after 5 points', () => {
        const world = createWorldWithFencers()
        const gameOverHandler = vi.fn()
        world.on('game:over', gameOverHandler)

        for (let i = 0; i < 5; i++) {
            world.fencer1.x = 0
            world.fencer2.x = world.fencer1.bodyRadius + world.fencer1.swordLength + world.fencer2.bodyRadius - 0.02
            world.fencer2.swordPosition = 'high'
            world.fencer1.swordPosition = 'mid'
            world.fencer1.lunging = false
            world.fencer1.stunned = false
            world.fencer2.stunned = false
            world.roundActive = true
            world.respawning = false
            world.fencer1.lunge()
            world.postUpdate(1 / 60)
        }

        expect(world.fencer1.score).toBe(5)
        expect(world.gameOver).toBe(true)
        expect(gameOverHandler).toHaveBeenCalled()
    })


    test('postUpdate does nothing when game is over', () => {
        const world = createWorldWithFencers()
        world.gameOver = true

        world.fencer1.x = 0
        world.fencer2.x = 0.5
        world.fencer1.lunge()

        const handler = vi.fn()
        world.on('point:scored', handler)

        world.postUpdate(1 / 60)

        expect(handler).not.toHaveBeenCalled()
    })


    test('preUpdate skips local input in network mode', () => {
        const world = createWorldWithFencers()
        world.networkMode = true
        const context = {getDirection: vi.fn(() => ({x: 1, y: 0}))}

        world.preUpdate(1 / 60, context)

        expect(context.getDirection).not.toHaveBeenCalled()
    })


    test('applyNetworkInputs sets movement and triggers actions', () => {
        const world = createWorldWithFencers()
        world.networkMode = true

        const inputs = new Map()
        inputs.set('fencer1', {moveX: 1, actions: ['jump', 'lunge']})
        inputs.set('fencer2', {moveX: -1, actions: ['swordUp']})

        world.applyNetworkInputs(inputs)

        expect(world.fencer1.moveDirection).toBe(1)
        expect(world.fencer1.lunging).toBe(true)
        expect(world.fencer2.moveDirection).toBe(-1)
        expect(world.fencer2.swordPosition).toBe('high')
    })


    test('exportState captures full world state', () => {
        const world = createWorldWithFencers()
        world.fencer1.x = -2
        world.fencer1.score = 3
        world.fencer2.swordPosition = 'high'

        const state = world.exportState()

        expect(state.roundActive).toBe(true)
        expect(state.gameOver).toBe(false)
        expect(state.fencer1.x).toBe(-2)
        expect(state.fencer1.score).toBe(3)
        expect(state.fencer2.swordPosition).toBe('high')
    })


    test('importState restores full world state', () => {
        const world = createWorldWithFencers()

        const state = {
            roundActive: false,
            respawning: true,
            respawnTimer: 0.5,
            gameOver: false,
            fencer1: {
                x: -1, y: 0.5, vx: 2, vy: 1,
                facing: 1, swordPosition: 'low',
                lunging: true, lungeTimer: 0.1,
                stunned: false, stunTimer: 0,
                grounded: false, score: 2, alive: true
            },
            fencer2: {
                x: 1, y: 0, vx: 0, vy: 0,
                facing: -1, swordPosition: 'high',
                lunging: false, lungeTimer: 0,
                stunned: true, stunTimer: 0.3,
                grounded: true, score: 1, alive: true
            }
        }

        world.importState(state)

        expect(world.roundActive).toBe(false)
        expect(world.respawning).toBe(true)
        expect(world.fencer1.x).toBe(-1)
        expect(world.fencer1.y).toBe(0.5)
        expect(world.fencer1.score).toBe(2)
        expect(world.fencer1.lunging).toBe(true)
        expect(world.fencer2.stunned).toBe(true)
        expect(world.fencer2.swordPosition).toBe('high')
    })

})
