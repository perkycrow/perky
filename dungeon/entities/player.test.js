import {describe, it, expect} from 'vitest'
import Player from './player.js'


describe('Player', () => {

    it('starts at the given position with zero velocity', () => {
        const player = new Player({x: 1, y: 2, z: 3})

        expect(player.position.x).toBe(1)
        expect(player.position.y).toBe(2)
        expect(player.position.z).toBe(3)
        expect(player.velocity.x).toBe(0)
        expect(player.velocity.y).toBe(0)
        expect(player.velocity.z).toBe(0)
        expect(player.onGround).toBe(true)
    })


    it('moves forward in the yaw=0 direction (negative Z)', () => {
        const player = new Player()
        player.setMoveInput(1, 0)
        player.update(1)

        expect(player.position.z).toBeLessThan(0)
        expect(player.position.x).toBeCloseTo(0)
    })


    it('strafes right in the yaw=0 direction (positive X)', () => {
        const player = new Player()
        player.setMoveInput(0, 1)
        player.update(1)

        expect(player.position.x).toBeGreaterThan(0)
        expect(player.position.z).toBeCloseTo(0)
    })


    it('respects yaw when moving forward (yaw=PI/2 moves along +X)', () => {
        const player = new Player()
        player.yaw = Math.PI / 2
        player.setMoveInput(1, 0)
        player.update(1)

        expect(player.position.x).toBeLessThan(0)
        expect(player.position.z).toBeCloseTo(0)
    })


    it('jumps only when on ground, velocity.y becomes positive', () => {
        const player = new Player()

        player.jump()
        expect(player.velocity.y).toBeGreaterThan(0)
        expect(player.onGround).toBe(false)

        const velY = player.velocity.y
        player.jump()
        expect(player.velocity.y).toBe(velY)
    })


    it('falls under gravity and lands on ground', () => {
        const player = new Player({y: 5})
        player.onGround = false

        for (let i = 0; i < 60; i++) {
            player.update(1 / 60)
        }

        expect(player.position.y).toBe(0)
        expect(player.velocity.y).toBe(0)
        expect(player.onGround).toBe(true)
    })

})
