import {describe, test, expect} from 'vitest'
import Timer from './timer.js'


describe('Timer', () => {

    test('starts inactive', () => {
        const timer = new Timer(1)

        expect(timer.active).toBe(false)
        expect(timer.value).toBe(0)
    })


    test('stores duration', () => {
        const timer = new Timer(2.5)

        expect(timer.duration).toBe(2.5)
    })


    test('defaults duration to 0', () => {
        const timer = new Timer()

        expect(timer.duration).toBe(0)
    })


    describe('reset', () => {

        test('activates the timer', () => {
            const timer = new Timer(1)

            timer.reset()

            expect(timer.active).toBe(true)
            expect(timer.value).toBe(1)
        })


        test('overrides duration', () => {
            const timer = new Timer(1)

            timer.reset(2)

            expect(timer.duration).toBe(2)
            expect(timer.value).toBe(2)
        })


        test('returns the timer', () => {
            const timer = new Timer(1)

            expect(timer.reset()).toBe(timer)
        })

    })


    describe('clear', () => {

        test('deactivates the timer', () => {
            const timer = new Timer(1)
            timer.reset()

            timer.clear()

            expect(timer.active).toBe(false)
            expect(timer.value).toBe(0)
        })


        test('returns the timer', () => {
            const timer = new Timer(1)

            expect(timer.clear()).toBe(timer)
        })

    })


    describe('update', () => {

        test('decrements value', () => {
            const timer = new Timer(1)
            timer.reset()

            timer.update(0.3)

            expect(timer.value).toBeCloseTo(0.7)
        })


        test('returns false while active', () => {
            const timer = new Timer(1)
            timer.reset()

            expect(timer.update(0.3)).toBe(false)
        })


        test('returns true when timer completes', () => {
            const timer = new Timer(1)
            timer.reset()

            timer.update(0.5)
            const result = timer.update(0.5)

            expect(result).toBe(true)
            expect(timer.active).toBe(false)
        })


        test('clamps value to 0', () => {
            const timer = new Timer(0.5)
            timer.reset()

            timer.update(1)

            expect(timer.value).toBe(0)
        })


        test('returns false when already inactive', () => {
            const timer = new Timer(1)

            expect(timer.update(0.5)).toBe(false)
        })


        test('returns false after already completed', () => {
            const timer = new Timer(0.5)
            timer.reset()

            timer.update(1)

            expect(timer.update(0.5)).toBe(false)
        })

    })


    describe('progress', () => {

        test('is 0 at start', () => {
            const timer = new Timer(1)
            timer.reset()

            expect(timer.progress).toBeCloseTo(0)
        })


        test('is 0.5 at midpoint', () => {
            const timer = new Timer(1)
            timer.reset()

            timer.update(0.5)

            expect(timer.progress).toBeCloseTo(0.5)
        })


        test('is 1 after completion', () => {
            const timer = new Timer(1)
            timer.reset()

            timer.update(1)

            expect(timer.progress).toBeCloseTo(1)
        })


        test('is 0 with zero duration', () => {
            const timer = new Timer(0)

            expect(timer.progress).toBe(0)
        })

    })


    describe('remaining', () => {

        test('is 1 at start', () => {
            const timer = new Timer(1)
            timer.reset()

            expect(timer.remaining).toBeCloseTo(1)
        })


        test('is 0.5 at midpoint', () => {
            const timer = new Timer(1)
            timer.reset()

            timer.update(0.5)

            expect(timer.remaining).toBeCloseTo(0.5)
        })


        test('is 0 after completion', () => {
            const timer = new Timer(1)
            timer.reset()

            timer.update(1)

            expect(timer.remaining).toBeCloseTo(0)
        })


        test('is 0 with zero duration', () => {
            const timer = new Timer(0)

            expect(timer.remaining).toBe(0)
        })

    })

})
