import {describe, test, expect, beforeEach, vi} from 'vitest'
import RedEnemy from './red_enemy.js'
import Enemy from './enemy.js'


describe('RedEnemy', () => {

    let enemy

    beforeEach(() => {
        enemy = new RedEnemy({x: 1, y: 0})
    })


    test('extends Enemy', () => {
        expect(enemy).toBeInstanceOf(Enemy)
    })


    test('tags', () => {
        expect(RedEnemy.$tags).toContain('enemy')
        expect(RedEnemy.$tags).toContain('red')
    })


    test('defaults', () => {
        expect(enemy.maxSpeed).toBe(0.5)
        expect(enemy.hp).toBe(2)
        expect(enemy.state).toBe('moving')
        expect(enemy.stateTimer).toBe(0)
        expect(enemy.stopDuration).toBe(0.8)
        expect(enemy.throwDelay).toBe(0.3)
        expect(enemy.hasThrown).toBe(false)
    })


    test('moveDuration is randomized between 1.5 and 2.5', () => {
        const durations = Array.from({length: 20}, () => new RedEnemy().moveDuration)
        expect(durations.every(d => d >= 1.5 && d < 2.5)).toBe(true)
    })


    test('hitbox', () => {
        expect(enemy.hitbox).toBeDefined()
        expect(enemy.hitbox.radius).toBe(0.2)
    })


    test('applyMovement does nothing when stunned', () => {
        enemy.isStunned = true
        const startX = enemy.position.x
        enemy.applyMovement(0.1)
        expect(enemy.position.x).toBe(startX)
        expect(enemy.stateTimer).toBe(0)
    })


    test('moving advances position', () => {
        const startX = enemy.position.x
        enemy.applyMovement(0.1)
        expect(enemy.position.x).toBeLessThan(startX)
    })


    test('moving transitions to stopping after moveDuration', () => {
        enemy.moveDuration = 0.5
        enemy.applyMovement(0.5)
        expect(enemy.state).toBe('stopping')
        expect(enemy.stateTimer).toBe(0)
        expect(enemy.hasThrown).toBe(false)
    })


    test('stopping emits throw:pie after throwDelay', () => {
        enemy.state = 'stopping'
        const handler = vi.fn()
        enemy.on('throw:pie', handler)

        enemy.applyMovement(0.2)
        expect(handler).not.toHaveBeenCalled()

        enemy.applyMovement(0.15)
        expect(handler).toHaveBeenCalledTimes(1)
        expect(handler.mock.calls[0][0]).toHaveProperty('sprite')
    })


    test('stopping only throws once', () => {
        enemy.state = 'stopping'
        const handler = vi.fn()
        enemy.on('throw:pie', handler)

        enemy.applyMovement(0.35)
        enemy.applyMovement(0.1)
        expect(handler).toHaveBeenCalledTimes(1)
    })


    test('stopping transitions to moving after stopDuration', () => {
        enemy.state = 'stopping'
        enemy.applyMovement(0.8)
        expect(enemy.state).toBe('moving')
        expect(enemy.stateTimer).toBe(0)
    })


    test('throwPie emits throw:pie with position and sprite', () => {
        const handler = vi.fn()
        enemy.on('throw:pie', handler)
        enemy.throwPie()

        const data = handler.mock.calls[0][0]
        expect(data.x).toBe(enemy.position.x)
        expect(data.y).toBe(enemy.position.y + 0.25)
        expect(['pie', 'cake']).toContain(data.sprite)
    })


    test('hit while stopping resets to moving', () => {
        enemy.state = 'stopping'
        enemy.stateTimer = 0.5
        enemy.hit({x: 1, y: 0})
        expect(enemy.state).toBe('moving')
        expect(enemy.stateTimer).toBe(0)
    })


    test('hit while moving keeps moving state', () => {
        enemy.state = 'moving'
        enemy.hit({x: 1, y: 0})
        expect(enemy.state).toBe('moving')
    })


    test('hit returns true when enemy dies', () => {
        enemy.hp = 1
        const isDead = enemy.hit({x: 1, y: 0})
        expect(isDead).toBe(true)
        expect(enemy.alive).toBe(false)
    })

})
