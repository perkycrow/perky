import {describe, test, expect, beforeEach, vi} from 'vitest'
import WaveSystem from './wave_system.js'
import PerkyModule from '../core/perky_module.js'


function createMockWorld () {
    return {
        spawnPigEnemy: vi.fn(),
        spawnRedEnemy: vi.fn(),
        spawnGrannyEnemy: vi.fn(),
        spawnAmalgamEnemy: vi.fn()
    }
}


describe('WaveSystem', () => {

    let ws
    let world

    beforeEach(() => {
        world = createMockWorld()
        ws = new WaveSystem({world})
    })


    test('extends PerkyModule', () => {
        expect(ws).toBeInstanceOf(PerkyModule)
    })


    test('stores world reference', () => {
        expect(ws.world).toBe(world)
    })


    test('world defaults to null', () => {
        const ws2 = new WaveSystem()
        expect(ws2.world).toBeNull()
    })


    test('initial spawn state', () => {
        expect(ws.spawnTimer).toBe(0)
        expect(ws.nextSpawnTime).toBe(0)
    })


    test('waveSettings has expected defaults', () => {
        expect(WaveSystem.waveSettings.baseEnemySpeed).toBe(0.4)
        expect(WaveSystem.waveSettings.speedGrowthPerDay).toBe(0.05)
        expect(WaveSystem.waveSettings.baseSpawnInterval.min).toBe(1.2)
        expect(WaveSystem.waveSettings.baseSpawnInterval.max).toBe(2.0)
    })


    test('waveSpawnRatios has 4 entries', () => {
        expect(WaveSystem.waveSpawnRatios).toHaveLength(4)
    })


    test('spawns enemy on first update', () => {
        ws.update(0.1)

        const totalSpawns = world.spawnPigEnemy.mock.calls.length +
            world.spawnRedEnemy.mock.calls.length +
            world.spawnGrannyEnemy.mock.calls.length

        expect(totalSpawns).toBe(1)
    })


    test('does not spawn without world', () => {
        const ws2 = new WaveSystem()
        expect(() => ws2.update(0.1)).not.toThrow()
    })


    test('does not spawn when paused', () => {
        ws.paused = true
        ws.update(0.1)

        expect(world.spawnPigEnemy).not.toHaveBeenCalled()
        expect(world.spawnRedEnemy).not.toHaveBeenCalled()
        expect(world.spawnGrannyEnemy).not.toHaveBeenCalled()
    })


    test('does not spawn when waiting for clear', () => {
        ws.waitingForClear = true
        ws.update(0.1)

        expect(world.spawnPigEnemy).not.toHaveBeenCalled()
        expect(world.spawnRedEnemy).not.toHaveBeenCalled()
        expect(world.spawnGrannyEnemy).not.toHaveBeenCalled()
    })


    test('does not respawn immediately after first spawn', () => {
        ws.update(0.1)

        const spawnsBefore = world.spawnPigEnemy.mock.calls.length +
            world.spawnRedEnemy.mock.calls.length +
            world.spawnGrannyEnemy.mock.calls.length

        ws.update(0.01)

        const spawnsAfter = world.spawnPigEnemy.mock.calls.length +
            world.spawnRedEnemy.mock.calls.length +
            world.spawnGrannyEnemy.mock.calls.length

        expect(spawnsBefore).toBe(1)
        expect(spawnsAfter).toBe(1)
    })


    test('spawns again after enough time', () => {
        ws.update(0.1)

        for (let i = 0; i < 200; i++) {
            ws.update(0.016)
        }

        const totalSpawns = world.spawnPigEnemy.mock.calls.length +
            world.spawnRedEnemy.mock.calls.length +
            world.spawnGrannyEnemy.mock.calls.length

        expect(totalSpawns).toBeGreaterThan(1)
    })


    test('spawns with correct x position', () => {
        ws.update(0.1)

        const allCalls = [
            ...world.spawnPigEnemy.mock.calls,
            ...world.spawnRedEnemy.mock.calls,
            ...world.spawnGrannyEnemy.mock.calls
        ]

        expect(allCalls.length).toBe(1)
        expect(allCalls[0][0].x).toBe(3.5)
    })


    test('spawns with y in valid range', () => {
        ws.update(0.1)

        const allCalls = [
            ...world.spawnPigEnemy.mock.calls,
            ...world.spawnRedEnemy.mock.calls,
            ...world.spawnGrannyEnemy.mock.calls
        ]

        expect(allCalls[0][0].y).toBeGreaterThanOrEqual(-1.9)
        expect(allCalls[0][0].y).toBeLessThanOrEqual(0.6)
    })


    test('spawns amalgam on wave 3 start', () => {
        ws.wave = 2
        ws.elapsedTime = 999

        ws.checkClear(1)
        ws.checkClear(0)

        expect(world.spawnAmalgamEnemy).toHaveBeenCalledWith({
            x: 3.5,
            y: 0,
            maxSpeed: 0.4
        })
    })


    test('does not spawn amalgam on other waves', () => {
        ws.wave = 0
        ws.elapsedTime = 999

        ws.checkClear(1)
        ws.checkClear(0)

        expect(world.spawnAmalgamEnemy).not.toHaveBeenCalled()
    })


    test('reset clears spawn state', () => {
        ws.spawnTimer = 5
        ws.nextSpawnTime = 3
        ws.wave = 2
        ws.day = 1

        ws.reset()

        expect(ws.spawnTimer).toBe(0)
        expect(ws.nextSpawnTime).toBe(0)
        expect(ws.wave).toBe(0)
        expect(ws.day).toBe(0)
    })


    test('isSpawning', () => {
        expect(ws.isSpawning).toBe(true)

        ws.elapsedTime = 999
        expect(ws.isSpawning).toBe(false)
    })


    test('progress', () => {
        expect(ws.progress).toBe(0)

        ws.elapsedTime = 12.5
        expect(ws.progress).toBe(0.5)

        ws.elapsedTime = 999
        expect(ws.progress).toBe(1)
    })


    test('emits tick on update', () => {
        const tickSpy = vi.fn()
        ws.on('tick', tickSpy)

        ws.update(0.1)

        expect(tickSpy).toHaveBeenCalledWith(expect.objectContaining({
            wave: 0,
            day: 0
        }))
    })


    test('checkClear emits spawning:end', () => {
        const spawnEndSpy = vi.fn()
        ws.on('spawning:end', spawnEndSpy)
        ws.elapsedTime = 999

        ws.checkClear(1)

        expect(spawnEndSpy).toHaveBeenCalled()
    })


    test('checkClear starts next wave when clear', () => {
        const waveStartSpy = vi.fn()
        ws.on('wave:start', waveStartSpy)
        ws.elapsedTime = 999

        ws.checkClear(1)
        ws.checkClear(0)

        expect(waveStartSpy).toHaveBeenCalledWith({wave: 1, day: 0})
    })

})
