import {describe, test, expect, vi} from 'vitest'
import SpriteEffectStack from './sprite_effect_stack.js'
import SpriteEffect from './sprite_effect.js'


class MockEffect extends SpriteEffect {
    static type = 'mock'

    constructor (options = {}) {
        super(options)
        this.hints = options.hints || {value: 1}
    }

    getHints () {
        return this.hints
    }
}


class AnotherEffect extends SpriteEffect {
    static type = 'another'

    getHints () {
        return {other: true}
    }
}


describe('SpriteEffectStack', () => {

    describe('constructor', () => {

        test('creates with empty effects', () => {
            const stack = new SpriteEffectStack()
            expect(stack.count).toBe(0)
            expect(stack.effects).toEqual([])
        })

    })


    describe('add', () => {

        test('adds an effect', () => {
            const stack = new SpriteEffectStack()
            const effect = new MockEffect()

            stack.add(effect)

            expect(stack.count).toBe(1)
            expect(stack.effects[0]).toBe(effect)
        })


        test('returns this for chaining', () => {
            const stack = new SpriteEffectStack()
            const effect = new MockEffect()

            expect(stack.add(effect)).toBe(stack)
        })


        test('prevents duplicate effect types', () => {
            const stack = new SpriteEffectStack()
            const effect1 = new MockEffect({hints: {v: 1}})
            const effect2 = new MockEffect({hints: {v: 2}})

            stack.add(effect1)
            stack.add(effect2)

            expect(stack.count).toBe(1)
            expect(stack.get(MockEffect)).toBe(effect1)
        })


        test('allows different effect types', () => {
            const stack = new SpriteEffectStack()

            stack.add(new MockEffect())
            stack.add(new AnotherEffect())

            expect(stack.count).toBe(2)
        })

    })


    describe('remove', () => {

        test('removes an effect by class', () => {
            const stack = new SpriteEffectStack()
            const effect = new MockEffect()
            effect.dispose = vi.fn()

            stack.add(effect)
            stack.remove(MockEffect)

            expect(stack.count).toBe(0)
            expect(effect.dispose).toHaveBeenCalled()
        })


        test('returns this for chaining', () => {
            const stack = new SpriteEffectStack()
            expect(stack.remove(MockEffect)).toBe(stack)
        })


        test('does nothing if effect not found', () => {
            const stack = new SpriteEffectStack()
            expect(() => stack.remove(MockEffect)).not.toThrow()
        })

    })


    describe('get', () => {

        test('returns effect by class', () => {
            const stack = new SpriteEffectStack()
            const effect = new MockEffect()

            stack.add(effect)

            expect(stack.get(MockEffect)).toBe(effect)
        })


        test('returns null if not found', () => {
            const stack = new SpriteEffectStack()
            expect(stack.get(MockEffect)).toBe(null)
        })

    })


    describe('has', () => {

        test('returns true if effect exists', () => {
            const stack = new SpriteEffectStack()
            stack.add(new MockEffect())

            expect(stack.has(MockEffect)).toBe(true)
        })


        test('returns false if effect does not exist', () => {
            const stack = new SpriteEffectStack()
            expect(stack.has(MockEffect)).toBe(false)
        })

    })


    describe('clear', () => {

        test('removes all effects', () => {
            const stack = new SpriteEffectStack()
            const effect1 = new MockEffect()
            const effect2 = new AnotherEffect()
            effect1.dispose = vi.fn()
            effect2.dispose = vi.fn()

            stack.add(effect1)
            stack.add(effect2)
            stack.clear()

            expect(stack.count).toBe(0)
            expect(effect1.dispose).toHaveBeenCalled()
            expect(effect2.dispose).toHaveBeenCalled()
        })


        test('returns this for chaining', () => {
            const stack = new SpriteEffectStack()
            expect(stack.clear()).toBe(stack)
        })

    })


    describe('getHints', () => {

        test('returns null when no effects', () => {
            const stack = new SpriteEffectStack()
            expect(stack.getHints()).toBe(null)
        })


        test('returns combined hints from all enabled effects', () => {
            const stack = new SpriteEffectStack()
            stack.add(new MockEffect({hints: {intensity: 0.5}}))
            stack.add(new AnotherEffect())

            const hints = stack.getHints()

            expect(hints).toEqual({
                mock: {intensity: 0.5},
                another: {other: true}
            })
        })


        test('skips disabled effects', () => {
            const stack = new SpriteEffectStack()
            const effect = new MockEffect()
            effect.enabled = false
            stack.add(effect)

            expect(stack.getHints()).toBe(null)
        })


        test('returns null if all effects return null hints', () => {
            const stack = new SpriteEffectStack()
            const effect = new SpriteEffect()
            stack.add(effect)

            expect(stack.getHints()).toBe(null)
        })

    })


    describe('update', () => {

        test('calls update on all enabled effects', () => {
            const stack = new SpriteEffectStack()
            const effect1 = new MockEffect()
            const effect2 = new AnotherEffect()
            effect1.update = vi.fn()
            effect2.update = vi.fn()

            stack.add(effect1)
            stack.add(effect2)
            stack.update(16)

            expect(effect1.update).toHaveBeenCalledWith(16)
            expect(effect2.update).toHaveBeenCalledWith(16)
        })


        test('skips disabled effects', () => {
            const stack = new SpriteEffectStack()
            const effect = new MockEffect()
            effect.enabled = false
            effect.update = vi.fn()

            stack.add(effect)
            stack.update(16)

            expect(effect.update).not.toHaveBeenCalled()
        })

    })


    describe('dispose', () => {

        test('clears all effects', () => {
            const stack = new SpriteEffectStack()
            const effect = new MockEffect()
            effect.dispose = vi.fn()

            stack.add(effect)
            stack.dispose()

            expect(stack.count).toBe(0)
            expect(effect.dispose).toHaveBeenCalled()
        })

    })

})
