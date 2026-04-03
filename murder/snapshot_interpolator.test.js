import {describe, test, expect} from 'vitest'
import SnapshotInterpolator from './snapshot_interpolator.js'


describe('SnapshotInterpolator', () => {

    test('constructor defaults', () => {
        const interp = new SnapshotInterpolator()
        expect(interp.delay).toBe(100)
        expect(interp.maxSnapshots).toBe(5)
        expect(interp.snapshots).toEqual([])
    })


    test('constructor with options', () => {
        const interp = new SnapshotInterpolator({delay: 50, maxSnapshots: 3})
        expect(interp.delay).toBe(50)
        expect(interp.maxSnapshots).toBe(3)
    })


    test('push adds snapshots', () => {
        const interp = new SnapshotInterpolator()
        interp.push({x: 0}, 100)
        interp.push({x: 1}, 200)
        expect(interp.snapshots.length).toBe(2)
    })


    test('push caps at maxSnapshots', () => {
        const interp = new SnapshotInterpolator({maxSnapshots: 2})
        interp.push({x: 0}, 100)
        interp.push({x: 1}, 200)
        interp.push({x: 2}, 300)
        expect(interp.snapshots.length).toBe(2)
        expect(interp.snapshots[0].state.x).toBe(1)
    })


    test('ready is false with less than 2 snapshots', () => {
        const interp = new SnapshotInterpolator()
        expect(interp.ready).toBe(false)
        interp.push({x: 0}, 100)
        expect(interp.ready).toBe(false)
    })


    test('ready is true with 2+ snapshots', () => {
        const interp = new SnapshotInterpolator()
        interp.push({x: 0}, 100)
        interp.push({x: 1}, 200)
        expect(interp.ready).toBe(true)
    })


    test('returns null with no snapshots', () => {
        const interp = new SnapshotInterpolator()
        expect(interp.getInterpolatedState(500)).toBe(null)
    })


    test('returns single snapshot state', () => {
        const interp = new SnapshotInterpolator()
        interp.push({x: 5}, 100)
        expect(interp.getInterpolatedState(500)).toEqual({x: 5})
    })


    test('interpolates numbers at midpoint', () => {
        const interp = new SnapshotInterpolator({delay: 0})
        interp.push({x: 0, y: 10}, 100)
        interp.push({x: 10, y: 20}, 200)

        const state = interp.getInterpolatedState(150)
        expect(state.x).toBeCloseTo(5)
        expect(state.y).toBeCloseTo(15)
    })


    test('interpolates at start', () => {
        const interp = new SnapshotInterpolator({delay: 0})
        interp.push({x: 0}, 100)
        interp.push({x: 10}, 200)

        const state = interp.getInterpolatedState(100)
        expect(state.x).toBeCloseTo(0)
    })


    test('interpolates at end', () => {
        const interp = new SnapshotInterpolator({delay: 0})
        interp.push({x: 0}, 100)
        interp.push({x: 10}, 200)

        const state = interp.getInterpolatedState(200)
        expect(state.x).toBeCloseTo(10)
    })


    test('applies delay offset', () => {
        const interp = new SnapshotInterpolator({delay: 100})
        interp.push({x: 0}, 100)
        interp.push({x: 10}, 200)

        const state = interp.getInterpolatedState(250)
        expect(state.x).toBeCloseTo(5)
    })


    test('returns latest state when past all snapshots', () => {
        const interp = new SnapshotInterpolator({delay: 0})
        interp.push({x: 0}, 100)
        interp.push({x: 10}, 200)

        const state = interp.getInterpolatedState(500)
        expect(state.x).toBe(10)
    })


    test('interpolates nested objects', () => {
        const interp = new SnapshotInterpolator({delay: 0})
        interp.push({player: {x: 0, y: 0}}, 100)
        interp.push({player: {x: 10, y: 20}}, 200)

        const state = interp.getInterpolatedState(150)
        expect(state.player.x).toBeCloseTo(5)
        expect(state.player.y).toBeCloseTo(10)
    })


    test('snaps booleans at midpoint', () => {
        const interp = new SnapshotInterpolator({delay: 0})
        interp.push({alive: true}, 100)
        interp.push({alive: false}, 200)

        expect(interp.getInterpolatedState(140).alive).toBe(true)
        expect(interp.getInterpolatedState(160).alive).toBe(false)
    })


    test('snaps strings at midpoint', () => {
        const interp = new SnapshotInterpolator({delay: 0})
        interp.push({sword: 'high'}, 100)
        interp.push({sword: 'low'}, 200)

        expect(interp.getInterpolatedState(140).sword).toBe('high')
        expect(interp.getInterpolatedState(160).sword).toBe('low')
    })


    test('interpolates with multiple snapshots', () => {
        const interp = new SnapshotInterpolator({delay: 0})
        interp.push({x: 0}, 100)
        interp.push({x: 10}, 200)
        interp.push({x: 30}, 300)

        const state = interp.getInterpolatedState(250)
        expect(state.x).toBeCloseTo(20)
    })


    test('reset clears snapshots', () => {
        const interp = new SnapshotInterpolator()
        interp.push({x: 0}, 100)
        interp.push({x: 1}, 200)
        interp.reset()
        expect(interp.snapshots).toEqual([])
        expect(interp.ready).toBe(false)
    })


    test('handles null values in state', () => {
        const interp = new SnapshotInterpolator({delay: 0})
        interp.push({fencer1: null}, 100)
        interp.push({fencer1: {x: 10}}, 200)

        const state = interp.getInterpolatedState(150)
        expect(state.fencer1).toEqual({x: 10})
    })

})
