import {describe, test, expect} from 'vitest'
import HollowWorld from './hollow_world.js'
import World from '../../game/world.js'


describe('HollowWorld', () => {

    test('extends World', () => {
        const world = new HollowWorld()
        expect(world).toBeInstanceOf(World)
    })


    test('starts authoritative', () => {
        const world = new HollowWorld()
        expect(world.authoritative).toBe(true)
    })


    test('localSurvivorId starts null', () => {
        const world = new HollowWorld()
        expect(world.localSurvivorId).toBe(null)
    })


    test('spawnSurvivor creates survivor', () => {
        const world = new HollowWorld()
        world.start()

        const survivor = world.spawnSurvivor({$id: 's1', x: 2, y: 3})

        expect(survivor).toBeDefined()
        expect(survivor.x).toBe(2)
        expect(survivor.y).toBe(3)
    })


    test('exportState exports all survivors', () => {
        const world = new HollowWorld()
        world.start()

        world.spawnSurvivor({$id: 's1', x: 1})
        world.spawnSurvivor({$id: 's2', x: -1})

        const state = world.exportState()

        expect(state.s1).toBeDefined()
        expect(state.s1.x).toBe(1)
        expect(state.s2).toBeDefined()
        expect(state.s2.x).toBe(-1)
    })


    test('importState updates survivors', () => {
        const world = new HollowWorld()
        world.start()

        world.spawnSurvivor({$id: 's1'})

        world.importState({
            s1: {x: 5, y: 3, vx: 1, vy: 0, alive: true, moveDirection: {x: 0, y: 0}}
        })

        expect(world.getChild('s1').x).toBe(5)
        expect(world.getChild('s1').y).toBe(3)
    })


    test('importRemoteSurvivors skips local survivor', () => {
        const world = new HollowWorld()
        world.start()

        world.spawnSurvivor({$id: 's1'})
        world.spawnSurvivor({$id: 's2'})
        world.localSurvivorId = 's1'

        world.getChild('s1').x = 10

        world.importRemoteSurvivors({
            s1: {x: 0, y: 0, vx: 0, vy: 0, alive: true, moveDirection: {x: 0, y: 0}},
            s2: {x: 5, y: 5, vx: 0, vy: 0, alive: true, moveDirection: {x: 0, y: 0}}
        })

        expect(world.getChild('s1').x).toBe(10)
        expect(world.getChild('s2').x).toBe(5)
    })


    test('correctLocalSurvivor updates local alive state', () => {
        const world = new HollowWorld()
        world.start()

        world.spawnSurvivor({$id: 's1', $bind: 's1'})
        world.localSurvivorId = 's1'

        world.correctLocalSurvivor({
            s1: {alive: false}
        })

        expect(world.s1.alive).toBe(false)
    })

})
