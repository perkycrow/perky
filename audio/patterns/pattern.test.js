import Pattern, {parsePattern} from './pattern.js'
import {vi} from 'vitest'


describe(Pattern, () => {

    let pattern

    beforeEach(() => {
        pattern = new Pattern({
            steps: ['a', 'b', null, 'c'],
            bpm: 140,
            loop: true,
            swing: 0.2
        })
    })


    describe('constructor', () => {
        test('sets static category', () => {
            expect(Pattern.$category).toBe('pattern')
        })

        test('sets static lifecycle to false', () => {
            expect(Pattern.$lifecycle).toBe(false)
        })

        test('accepts steps option', () => {
            expect(pattern.steps).toEqual(['a', 'b', null, 'c'])
        })

        test('accepts bpm option', () => {
            expect(pattern.bpm).toBe(140)
        })

        test('accepts loop option', () => {
            expect(pattern.loop).toBe(true)
        })

        test('accepts swing option', () => {
            expect(pattern.swing).toBe(0.2)
        })

        test('parses pattern string', () => {
            const p = new Pattern({pattern: 'a b c'})
            expect(p.steps).toEqual(['a', 'b', 'c'])
        })

        test('defaults bpm to 120', () => {
            const p = new Pattern({})
            expect(p.bpm).toBe(120)
        })

        test('defaults loop to true', () => {
            const p = new Pattern({})
            expect(p.loop).toBe(true)
        })

        test('defaults swing to 0', () => {
            const p = new Pattern({})
            expect(p.swing).toBe(0)
        })

        test('defaults steps to empty array', () => {
            const p = new Pattern({})
            expect(p.steps).toEqual([])
        })
    })


    test('steps returns the steps array', () => {
        expect(pattern.steps).toEqual(['a', 'b', null, 'c'])
    })


    describe('stepCount', () => {
        test('returns number of steps', () => {
            expect(pattern.stepCount).toBe(4)
        })

        test('returns 0 for empty pattern', () => {
            const p = new Pattern({})
            expect(p.stepCount).toBe(0)
        })
    })


    describe('bpm', () => {
        test('get returns current bpm', () => {
            expect(pattern.bpm).toBe(140)
        })

        test('set updates bpm', () => {
            pattern.bpm = 180
            expect(pattern.bpm).toBe(180)
        })

        test('clamps to minimum 1', () => {
            pattern.bpm = 0
            expect(pattern.bpm).toBe(1)
        })

        test('clamps to maximum 999', () => {
            pattern.bpm = 1500
            expect(pattern.bpm).toBe(999)
        })
    })


    describe('playing', () => {
        test('returns false initially', () => {
            expect(pattern.playing).toBe(false)
        })

        test('returns true after play', () => {
            pattern.play()
            expect(pattern.playing).toBe(true)
        })

        test('returns false after stop', () => {
            pattern.play()
            pattern.stop()
            expect(pattern.playing).toBe(false)
        })
    })


    test('currentStep returns 0 initially', () => {
        expect(pattern.currentStep).toBe(0)
    })


    describe('loop', () => {
        test('get returns current loop state', () => {
            expect(pattern.loop).toBe(true)
        })

        test('set updates loop state', () => {
            pattern.loop = false
            expect(pattern.loop).toBe(false)
        })

        test('coerces to boolean', () => {
            pattern.loop = 0
            expect(pattern.loop).toBe(false)
            pattern.loop = 1
            expect(pattern.loop).toBe(true)
        })
    })


    describe('swing', () => {
        test('get returns current swing', () => {
            expect(pattern.swing).toBe(0.2)
        })

        test('set updates swing', () => {
            pattern.swing = 0.5
            expect(pattern.swing).toBe(0.5)
        })

        test('clamps to minimum 0', () => {
            pattern.swing = -0.5
            expect(pattern.swing).toBe(0)
        })

        test('clamps to maximum 1', () => {
            pattern.swing = 1.5
            expect(pattern.swing).toBe(1)
        })
    })


    describe('progress', () => {
        test('returns 0 initially', () => {
            expect(pattern.progress).toBe(0)
        })

        test('returns 0 for empty pattern', () => {
            const p = new Pattern({})
            expect(p.progress).toBe(0)
        })
    })


    describe('setPattern', () => {
        test('sets steps from string', () => {
            pattern.setPattern('x . y')
            expect(pattern.steps).toEqual(['x', null, 'y'])
        })

        test('sets steps from array', () => {
            pattern.setPattern(['x', 'y', 'z'])
            expect(pattern.steps).toEqual(['x', 'y', 'z'])
        })

        test('resets pattern state', () => {
            pattern.play()
            pattern.update(1)
            pattern.setPattern('a b')
            expect(pattern.currentStep).toBe(0)
        })

        test('returns self for chaining', () => {
            expect(pattern.setPattern('a')).toBe(pattern)
        })
    })


    describe('setSteps', () => {
        test('sets steps array', () => {
            pattern.setSteps(['x', 'y'])
            expect(pattern.steps).toEqual(['x', 'y'])
        })

        test('resets pattern state', () => {
            pattern.play()
            pattern.update(1)
            pattern.setSteps(['a'])
            expect(pattern.currentStep).toBe(0)
        })

        test('returns self for chaining', () => {
            expect(pattern.setSteps(['a'])).toBe(pattern)
        })
    })


    describe('setBpm', () => {
        test('sets bpm', () => {
            pattern.setBpm(200)
            expect(pattern.bpm).toBe(200)
        })

        test('returns self for chaining', () => {
            expect(pattern.setBpm(120)).toBe(pattern)
        })
    })


    describe('setSwing', () => {
        test('sets swing', () => {
            pattern.setSwing(0.8)
            expect(pattern.swing).toBe(0.8)
        })

        test('returns self for chaining', () => {
            expect(pattern.setSwing(0.5)).toBe(pattern)
        })
    })


    describe('play', () => {
        test('sets playing to true', () => {
            pattern.play()
            expect(pattern.playing).toBe(true)
        })

        test('emits play event', () => {
            const listener = vi.fn()
            pattern.on('play', listener)
            pattern.play()
            expect(listener).toHaveBeenCalled()
        })

        test('returns self for chaining', () => {
            expect(pattern.play()).toBe(pattern)
        })

        test('does not emit when already playing', () => {
            pattern.play()
            const listener = vi.fn()
            pattern.on('play', listener)
            pattern.play()
            expect(listener).not.toHaveBeenCalled()
        })
    })


    describe('stop', () => {
        test('sets playing to false', () => {
            pattern.play()
            pattern.stop()
            expect(pattern.playing).toBe(false)
        })

        test('emits stop event', () => {
            pattern.play()
            const listener = vi.fn()
            pattern.on('stop', listener)
            pattern.stop()
            expect(listener).toHaveBeenCalled()
        })

        test('returns self for chaining', () => {
            expect(pattern.stop()).toBe(pattern)
        })

        test('does not emit when already stopped', () => {
            const listener = vi.fn()
            pattern.on('stop', listener)
            pattern.stop()
            expect(listener).not.toHaveBeenCalled()
        })
    })


    describe('reset', () => {
        test('resets currentStep to 0', () => {
            pattern.play()
            pattern.update(1)
            pattern.reset()
            expect(pattern.currentStep).toBe(0)
        })

        test('emits reset event', () => {
            const listener = vi.fn()
            pattern.on('reset', listener)
            pattern.reset()
            expect(listener).toHaveBeenCalled()
        })

        test('returns self for chaining', () => {
            expect(pattern.reset()).toBe(pattern)
        })
    })


    describe('update', () => {
        test('does nothing when not playing', () => {
            const listener = vi.fn()
            pattern.on('step', listener)
            pattern.update(1)
            expect(listener).not.toHaveBeenCalled()
        })

        test('does nothing with empty steps', () => {
            const p = new Pattern({})
            p.play()
            const listener = vi.fn()
            p.on('step', listener)
            p.update(1)
            expect(listener).not.toHaveBeenCalled()
        })

        test('triggers step event for active steps', () => {
            const listener = vi.fn()
            pattern.on('step', listener)
            pattern.play()
            pattern.update(0.2)
            expect(listener).toHaveBeenCalledWith('a', 0)
        })

        test('does not trigger for null steps', () => {
            const p = new Pattern({steps: [null, 'a'], bpm: 120})
            const listener = vi.fn()
            p.on('step', listener)
            p.play()
            p.update(0.3)
            expect(listener).toHaveBeenCalledTimes(1)
            expect(listener).toHaveBeenCalledWith('a', 1)
        })

        test('does not trigger for underscore steps', () => {
            const p = new Pattern({steps: ['_', 'a'], bpm: 120})
            const listener = vi.fn()
            p.on('step', listener)
            p.play()
            p.update(0.3)
            expect(listener).toHaveBeenCalledTimes(1)
        })

        test('does not trigger for dot steps', () => {
            const p = new Pattern({steps: ['.', 'a'], bpm: 120})
            const listener = vi.fn()
            p.on('step', listener)
            p.play()
            p.update(0.3)
            expect(listener).toHaveBeenCalledTimes(1)
        })

        test('emits step:name event', () => {
            const listener = vi.fn()
            pattern.on('step:a', listener)
            pattern.play()
            pattern.update(0.2)
            expect(listener).toHaveBeenCalledWith(0)
        })

        test('loops when reaching end with loop enabled', () => {
            const loopListener = vi.fn()
            pattern.on('loop', loopListener)
            pattern.play()
            pattern.update(2)
            expect(loopListener).toHaveBeenCalled()
        })

        test('stops and emits complete when reaching end with loop disabled', () => {
            pattern.loop = false
            const completeListener = vi.fn()
            pattern.on('complete', completeListener)
            pattern.play()
            pattern.update(2)
            expect(completeListener).toHaveBeenCalled()
            expect(pattern.playing).toBe(false)
        })

        test('handles array steps by triggering each substep', () => {
            const p = new Pattern({steps: [['a', 'b']], bpm: 120})
            const listener = vi.fn()
            p.on('step', listener)
            p.play()
            p.update(0.2)
            expect(listener).toHaveBeenCalledTimes(2)
            expect(listener).toHaveBeenCalledWith('a', 0)
            expect(listener).toHaveBeenCalledWith('b', 0)
        })

        test('applies swing to odd-indexed steps', () => {
            const p = new Pattern({
                steps: ['a', 'b'],
                bpm: 120,
                swing: 0.5
            })
            p.play()
            const stepDuration = 60 / 120 / 4
            p.update(stepDuration + 0.001)
            expect(p.currentStep).toBe(1)
        })
    })


    describe('onStep', () => {
        test('registers step callback', () => {
            const callback = vi.fn()
            pattern.onStep(callback)
            pattern.play()
            pattern.update(0.2)
            expect(callback).toHaveBeenCalled()
        })

        test('returns self for chaining', () => {
            expect(pattern.onStep(() => {})).toBe(pattern)
        })
    })


    describe('map', () => {
        test('returns new pattern with mapped steps', () => {
            const mapped = pattern.map(step => (step ? step.toUpperCase() : step))
            expect(mapped.steps).toEqual(['A', 'B', null, 'C'])
        })

        test('preserves bpm', () => {
            const mapped = pattern.map(s => s)
            expect(mapped.bpm).toBe(140)
        })

        test('preserves loop', () => {
            const mapped = pattern.map(s => s)
            expect(mapped.loop).toBe(true)
        })

        test('preserves swing', () => {
            const mapped = pattern.map(s => s)
            expect(mapped.swing).toBe(0.2)
        })

        test('does not modify original', () => {
            pattern.map(step => (step ? step.toUpperCase() : step))
            expect(pattern.steps).toEqual(['a', 'b', null, 'c'])
        })
    })


    describe('reverse', () => {
        test('returns new pattern with reversed steps', () => {
            const reversed = pattern.reverse()
            expect(reversed.steps).toEqual(['c', null, 'b', 'a'])
        })

        test('preserves bpm', () => {
            const reversed = pattern.reverse()
            expect(reversed.bpm).toBe(140)
        })

        test('preserves loop', () => {
            const reversed = pattern.reverse()
            expect(reversed.loop).toBe(true)
        })

        test('preserves swing', () => {
            const reversed = pattern.reverse()
            expect(reversed.swing).toBe(0.2)
        })

        test('does not modify original', () => {
            pattern.reverse()
            expect(pattern.steps).toEqual(['a', 'b', null, 'c'])
        })
    })


    describe('fast', () => {
        test('returns new pattern with multiplied bpm', () => {
            const faster = pattern.fast(2)
            expect(faster.bpm).toBe(280)
        })

        test('preserves steps', () => {
            const faster = pattern.fast(2)
            expect(faster.steps).toEqual(['a', 'b', null, 'c'])
        })

        test('preserves loop', () => {
            const faster = pattern.fast(2)
            expect(faster.loop).toBe(true)
        })

        test('preserves swing', () => {
            const faster = pattern.fast(2)
            expect(faster.swing).toBe(0.2)
        })

        test('does not modify original', () => {
            pattern.fast(2)
            expect(pattern.bpm).toBe(140)
        })
    })


    describe('slow', () => {
        test('returns new pattern with divided bpm', () => {
            const slower = pattern.slow(2)
            expect(slower.bpm).toBe(70)
        })

        test('does not modify original', () => {
            pattern.slow(2)
            expect(pattern.bpm).toBe(140)
        })
    })


    describe('every', () => {
        test('returns new pattern', () => {
            const result = pattern.every(2, () => {})
            expect(result).toBeInstanceOf(Pattern)
            expect(result).not.toBe(pattern)
        })

        test('executes callback every n loops', () => {
            const callback = vi.fn()
            const p = new Pattern({steps: ['a'], bpm: 120})
            const result = p.every(2, callback)
            result.play()
            const stepDuration = 60 / 120 / 4
            result.update(stepDuration + 0.001)
            expect(callback).not.toHaveBeenCalled()
            result.update(stepDuration + 0.001)
            expect(callback).toHaveBeenCalledTimes(1)
        })

        test('preserves bpm', () => {
            const result = pattern.every(2, () => {})
            expect(result.bpm).toBe(140)
        })

        test('preserves loop', () => {
            const result = pattern.every(2, () => {})
            expect(result.loop).toBe(true)
        })

        test('preserves swing', () => {
            const result = pattern.every(2, () => {})
            expect(result.swing).toBe(0.2)
        })
    })

})


describe('parsePattern', () => {

    test('parses simple tokens', () => {
        expect(parsePattern('a b c')).toEqual(['a', 'b', 'c'])
    })

    test('parses dots as null', () => {
        expect(parsePattern('a . b')).toEqual(['a', null, 'b'])
    })

    test('parses underscores as null', () => {
        expect(parsePattern('a _ b')).toEqual(['a', null, 'b'])
    })

    test('parses tildes as null', () => {
        expect(parsePattern('a ~ b')).toEqual(['a', null, 'b'])
    })

    test('parses groups', () => {
        expect(parsePattern('[a b] c')).toEqual([['a', 'b'], 'c'])
    })

    test('parses nested groups', () => {
        expect(parsePattern('[a [b c]] d')).toEqual([['a', ['b', 'c']], 'd'])
    })

    test('handles empty string', () => {
        expect(parsePattern('')).toEqual([])
    })

    test('handles null input', () => {
        expect(parsePattern(null)).toEqual([])
    })

    test('handles undefined input', () => {
        expect(parsePattern(undefined)).toEqual([])
    })

    test('handles non-string input', () => {
        expect(parsePattern(123)).toEqual([])
    })

    test('handles multiple spaces', () => {
        expect(parsePattern('a    b')).toEqual(['a', 'b'])
    })

    test('handles groups with null steps', () => {
        expect(parsePattern('[a . b]')).toEqual([['a', null, 'b']])
    })

    test('parses multi-character tokens', () => {
        expect(parsePattern('kick snare hihat')).toEqual(['kick', 'snare', 'hihat'])
    })

    test('handles leading spaces', () => {
        expect(parsePattern('  a b')).toEqual(['a', 'b'])
    })

    test('handles trailing spaces', () => {
        expect(parsePattern('a b  ')).toEqual(['a', 'b'])
    })

})
