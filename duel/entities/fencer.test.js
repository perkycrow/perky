import {describe, test, expect} from 'vitest'
import Fencer from './fencer.js'
import Entity from '../../game/entity.js'


describe('Fencer', () => {

    test('extends Entity', () => {
        const fencer = new Fencer()
        expect(fencer).toBeInstanceOf(Entity)
    })


    test('has fencer tag', () => {
        expect(Fencer.$tags).toContain('fencer')
    })


    test('default position at origin', () => {
        const fencer = new Fencer()
        expect(fencer.x).toBe(0)
        expect(fencer.y).toBe(0)
    })


    test('accepts initial position and facing', () => {
        const fencer = new Fencer({x: -3, y: 0, facing: 1})
        expect(fencer.x).toBe(-3)
        expect(fencer.facing).toBe(1)
    })


    test('default facing is 1', () => {
        const fencer = new Fencer()
        expect(fencer.facing).toBe(1)
    })


    test('default sword position is mid', () => {
        const fencer = new Fencer()
        expect(fencer.swordPosition).toBe('mid')
    })


    test('starts grounded and alive', () => {
        const fencer = new Fencer()
        expect(fencer.grounded).toBe(true)
        expect(fencer.alive).toBe(true)
    })


    test('has velocity component', () => {
        const fencer = new Fencer()
        expect(fencer.velocity).toBeDefined()
    })


    test('swordTipX accounts for facing and body radius', () => {
        const fencer = new Fencer({facing: 1})
        expect(fencer.swordTipX).toBe(fencer.bodyRadius + fencer.swordLength)

        const fencer2 = new Fencer({facing: -1})
        expect(fencer2.swordTipX).toBe(-(fencer2.bodyRadius + fencer2.swordLength))
    })


    test('swordTipY changes with sword position', () => {
        const fencer = new Fencer()
        fencer.setSwordPosition('high')
        const highY = fencer.swordTipY
        fencer.setSwordPosition('mid')
        const midY = fencer.swordTipY
        fencer.setSwordPosition('low')
        const lowY = fencer.swordTipY

        expect(highY).toBeGreaterThan(midY)
        expect(midY).toBeGreaterThan(lowY)
    })


    test('swordTipY includes body center offset', () => {
        const fencer = new Fencer()
        fencer.setSwordPosition('mid')
        expect(fencer.swordTipY).toBe(0.3)
    })


    test('move sets moveDirection', () => {
        const fencer = new Fencer()
        fencer.move(1)
        expect(fencer.moveDirection).toBe(1)
        fencer.move(-1)
        expect(fencer.moveDirection).toBe(-1)
    })


    test('jump sets velocity and ungrounds', () => {
        const fencer = new Fencer()
        fencer.jump()
        expect(fencer.velocity.y).toBeGreaterThan(0)
        expect(fencer.grounded).toBe(false)
    })


    test('jump does nothing when not grounded', () => {
        const fencer = new Fencer()
        fencer.grounded = false
        fencer.jump()
        expect(fencer.velocity.y).toBe(0)
    })


    test('jump does nothing when stunned', () => {
        const fencer = new Fencer()
        fencer.stunned = true
        fencer.jump()
        expect(fencer.velocity.y).toBe(0)
    })


    test('setSwordPosition changes position', () => {
        const fencer = new Fencer()
        fencer.setSwordPosition('high')
        expect(fencer.swordPosition).toBe('high')
        fencer.setSwordPosition('low')
        expect(fencer.swordPosition).toBe('low')
    })


    test('setSwordPosition ignores invalid positions', () => {
        const fencer = new Fencer()
        fencer.setSwordPosition('invalid')
        expect(fencer.swordPosition).toBe('mid')
    })


    test('setSwordPosition ignored when stunned', () => {
        const fencer = new Fencer()
        fencer.stunned = true
        fencer.setSwordPosition('high')
        expect(fencer.swordPosition).toBe('mid')
    })


    test('cycleSwordUp moves from mid to high', () => {
        const fencer = new Fencer()
        fencer.cycleSwordUp()
        expect(fencer.swordPosition).toBe('high')
    })


    test('cycleSwordUp does nothing at high', () => {
        const fencer = new Fencer()
        fencer.swordPosition = 'high'
        fencer.cycleSwordUp()
        expect(fencer.swordPosition).toBe('high')
    })


    test('cycleSwordDown moves from mid to low', () => {
        const fencer = new Fencer()
        fencer.cycleSwordDown()
        expect(fencer.swordPosition).toBe('low')
    })


    test('cycleSwordDown does nothing at low', () => {
        const fencer = new Fencer()
        fencer.swordPosition = 'low'
        fencer.cycleSwordDown()
        expect(fencer.swordPosition).toBe('low')
    })


    test('lunge sets lunging state and forward velocity', () => {
        const fencer = new Fencer({facing: 1})
        fencer.lunge()
        expect(fencer.lunging).toBe(true)
        expect(fencer.velocity.x).toBeGreaterThan(0)
    })


    test('lunge does nothing when already lunging', () => {
        const fencer = new Fencer({facing: 1})
        fencer.lunge()
        const vel = fencer.velocity.x
        fencer.velocity.x = 0
        fencer.lunge()
        expect(fencer.velocity.x).toBe(0)
    })


    test('lunge does nothing when stunned', () => {
        const fencer = new Fencer()
        fencer.stunned = true
        fencer.lunge()
        expect(fencer.lunging).toBe(false)
    })


    test('faceOpponent flips facing when opponent crosses', () => {
        const fencer = new Fencer({facing: 1})
        fencer.faceOpponent(-1)
        expect(fencer.facing).toBe(-1)
    })


    test('faceOpponent keeps facing when opponent is ahead', () => {
        const fencer = new Fencer({facing: 1})
        fencer.faceOpponent(5)
        expect(fencer.facing).toBe(1)
    })


    test('faceOpponent does not change facing when at same x', () => {
        const fencer = new Fencer({facing: 1})
        fencer.faceOpponent(0)
        expect(fencer.facing).toBe(1)
    })


    test('stun sets stunned state and knockback', () => {
        const fencer = new Fencer({facing: 1})
        fencer.stun()
        expect(fencer.stunned).toBe(true)
        expect(fencer.velocity.x).toBeLessThan(0)
        expect(fencer.grounded).toBe(false)
    })


    test('stun cancels lunge', () => {
        const fencer = new Fencer()
        fencer.lunge()
        fencer.stun()
        expect(fencer.lunging).toBe(false)
    })


    test('respawn resets state', () => {
        const fencer = new Fencer({facing: 1})
        fencer.stun()
        fencer.swordPosition = 'high'
        fencer.respawn(-3)

        expect(fencer.x).toBe(-3)
        expect(fencer.y).toBe(0)
        expect(fencer.stunned).toBe(false)
        expect(fencer.grounded).toBe(true)
        expect(fencer.swordPosition).toBe('mid')
        expect(fencer.alive).toBe(true)
    })


    test('update applies gravity when not grounded', () => {
        const fencer = new Fencer()
        fencer.grounded = false
        fencer.y = 2
        fencer.update(1 / 60)
        expect(fencer.velocity.y).toBeLessThan(0)
    })


    test('update clamps to ground', () => {
        const fencer = new Fencer()
        fencer.grounded = false
        fencer.y = 0.01
        fencer.velocity.y = -1
        fencer.update(1 / 60)
        expect(fencer.y).toBe(0)
        expect(fencer.grounded).toBe(true)
    })


    test('update applies horizontal movement', () => {
        const fencer = new Fencer()
        fencer.move(1)
        fencer.update(1 / 60)
        expect(fencer.x).toBeGreaterThan(0)
    })


    test('update clamps to arena bounds', () => {
        const fencer = new Fencer({x: 100})
        fencer.update(1 / 60)
        expect(fencer.x).toBeLessThanOrEqual(6.5)
    })


    test('update recovers from stun after duration', () => {
        const fencer = new Fencer()
        fencer.y = 0
        fencer.stun()

        for (let i = 0; i < 120; i++) {
            fencer.update(1 / 60)
        }

        expect(fencer.stunned).toBe(false)
    })


    test('update ends lunge after duration', () => {
        const fencer = new Fencer()
        fencer.lunge()

        for (let i = 0; i < 30; i++) {
            fencer.update(1 / 60)
        }

        expect(fencer.lunging).toBe(false)
    })


    test('movement is blocked while stunned', () => {
        const fencer = new Fencer()
        fencer.stun()
        fencer.move(1)
        const xBefore = fencer.x
        fencer.velocity.x = 0
        fencer.velocity.y = 0
        fencer.y = 0
        fencer.grounded = true
        fencer.update(1 / 60)
        expect(fencer.x).toBe(xBefore)
    })

})
