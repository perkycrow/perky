import {test, expect} from 'vitest'
import {interpolateStroke, smoothPoint} from './paint_engine.js'


test('smoothPoint with zero smoothing returns current point', () => {
    const prev = {x: 0, y: 0, pressure: 0.5}
    const curr = {x: 10, y: 20, pressure: 1}
    const result = smoothPoint(prev, curr, 0)
    expect(result.x).toBeCloseTo(10)
    expect(result.y).toBeCloseTo(20)
    expect(result.pressure).toBeCloseTo(1)
})


test('smoothPoint with full smoothing stays at previous point', () => {
    const prev = {x: 0, y: 0, pressure: 0.5}
    const curr = {x: 10, y: 20, pressure: 1}
    const result = smoothPoint(prev, curr, 1)
    expect(result.x).toBeCloseTo(0)
    expect(result.y).toBeCloseTo(0)
    expect(result.pressure).toBeCloseTo(0.5)
})


test('smoothPoint with 0.5 smoothing averages positions', () => {
    const prev = {x: 0, y: 0, pressure: 0}
    const curr = {x: 10, y: 20, pressure: 1}
    const result = smoothPoint(prev, curr, 0.5)
    expect(result.x).toBeCloseTo(5)
    expect(result.y).toBeCloseTo(10)
    expect(result.pressure).toBeCloseTo(0.5)
})


test('interpolateStroke returns empty for zero distance', () => {
    const point = {x: 10, y: 10, pressure: 1}
    const result = interpolateStroke(point, point, 5)
    expect(result.stamps).toEqual([])
    expect(result.remainder).toBe(0)
})


test('interpolateStroke returns empty for zero step', () => {
    const from = {x: 0, y: 0, pressure: 1}
    const to = {x: 10, y: 0, pressure: 1}
    const result = interpolateStroke(from, to, 0)
    expect(result.stamps).toEqual([])
})


test('interpolateStroke places stamps at regular intervals', () => {
    const from = {x: 0, y: 0, pressure: 1}
    const to = {x: 30, y: 0, pressure: 1}
    const result = interpolateStroke(from, to, 10)
    expect(result.stamps).toHaveLength(3)
    expect(result.stamps[0].x).toBeCloseTo(10)
    expect(result.stamps[1].x).toBeCloseTo(20)
    expect(result.stamps[2].x).toBeCloseTo(30)
})


test('interpolateStroke returns empty when distance less than step', () => {
    const from = {x: 0, y: 0, pressure: 1}
    const to = {x: 3, y: 0, pressure: 1}
    const result = interpolateStroke(from, to, 10)
    expect(result.stamps).toEqual([])
    expect(result.remainder).toBeCloseTo(3)
})


test('interpolateStroke accumulates remainder across short segments', () => {
    const a = {x: 0, y: 0, pressure: 1}
    const b = {x: 3, y: 0, pressure: 1}
    const c = {x: 6, y: 0, pressure: 1}
    const d = {x: 12, y: 0, pressure: 1}

    const r1 = interpolateStroke(a, b, 10)
    expect(r1.stamps).toHaveLength(0)
    expect(r1.remainder).toBeCloseTo(3)

    const r2 = interpolateStroke(b, c, 10, r1.remainder)
    expect(r2.stamps).toHaveLength(0)
    expect(r2.remainder).toBeCloseTo(6)

    const r3 = interpolateStroke(c, d, 10, r2.remainder)
    expect(r3.stamps).toHaveLength(1)
    expect(r3.stamps[0].x).toBeCloseTo(10)
})


test('interpolateStroke uses remainder from previous segment', () => {
    const from = {x: 0, y: 0, pressure: 1}
    const to = {x: 7, y: 0, pressure: 1}
    const result = interpolateStroke(from, to, 10, 5)
    expect(result.stamps).toHaveLength(1)
    expect(result.stamps[0].x).toBeCloseTo(5)
})


test('interpolateStroke interpolates pressure', () => {
    const from = {x: 0, y: 0, pressure: 0}
    const to = {x: 20, y: 0, pressure: 1}
    const result = interpolateStroke(from, to, 10)
    expect(result.stamps[0].pressure).toBeCloseTo(0.5)
    expect(result.stamps[1].pressure).toBeCloseTo(1.0)
})


test('interpolateStroke handles diagonal strokes', () => {
    const from = {x: 0, y: 0, pressure: 1}
    const to = {x: 30, y: 40, pressure: 1}
    const result = interpolateStroke(from, to, 10)
    expect(result.stamps).toHaveLength(5)
})


test('interpolateStroke computes correct remainder', () => {
    const from = {x: 0, y: 0, pressure: 1}
    const to = {x: 25, y: 0, pressure: 1}
    const result = interpolateStroke(from, to, 10)
    expect(result.stamps).toHaveLength(2)
    expect(result.stamps[0].x).toBeCloseTo(10)
    expect(result.stamps[1].x).toBeCloseTo(20)
    expect(result.remainder).toBeCloseTo(5)
})


test('interpolateStroke preserves y coordinates', () => {
    const from = {x: 0, y: 5, pressure: 1}
    const to = {x: 20, y: 5, pressure: 1}
    const result = interpolateStroke(from, to, 10)
    expect(result.stamps[0].y).toBeCloseTo(5)
    expect(result.stamps[1].y).toBeCloseTo(5)
})
