import {describe, test, expect, vi} from 'vitest'
import BrushSet from './brush_set.js'
import Brush from './brush.js'


describe('BrushSet', () => {

    test('starts empty', () => {
        const set = new BrushSet()
        expect(set.count).toBe(0)
        expect(set.brushes).toEqual([])
        expect(set.result).toBeNull()
    })


    test('add brush', () => {
        const set = new BrushSet()
        const brush = set.add(new Brush())
        expect(set.count).toBe(1)
        expect(set.get(0)).toBe(brush)
    })


    test('add brush at index', () => {
        const set = new BrushSet()
        const a = set.add(new Brush({x: 1}))
        const b = set.add(new Brush({x: 3}))
        const c = set.add(new Brush({x: 2}), 1)
        expect(set.get(0)).toBe(a)
        expect(set.get(1)).toBe(c)
        expect(set.get(2)).toBe(b)
    })


    test('remove brush', () => {
        const set = new BrushSet()
        const brush = set.add(new Brush())
        const removed = set.remove(0)
        expect(removed).toBe(brush)
        expect(set.count).toBe(0)
    })


    test('remove invalid index returns null', () => {
        const set = new BrushSet()
        expect(set.remove(5)).toBeNull()
    })


    test('move brush', () => {
        const set = new BrushSet()
        const a = set.add(new Brush({x: 1}))
        const b = set.add(new Brush({x: 2}))
        const c = set.add(new Brush({x: 3}))
        set.move(0, 2)
        expect(set.get(0)).toBe(b)
        expect(set.get(1)).toBe(c)
        expect(set.get(2)).toBe(a)
    })


    test('move same index does nothing', () => {
        const set = new BrushSet()
        const a = set.add(new Brush({x: 1}))
        const b = set.add(new Brush({x: 2}))
        set.move(0, 0)
        expect(set.get(0)).toBe(a)
        expect(set.get(1)).toBe(b)
    })


    test('replace brush', () => {
        const set = new BrushSet()
        const old = set.add(new Brush({shape: 'box'}))
        const replacement = new Brush({shape: 'sphere'})
        const returned = set.replace(0, replacement)
        expect(returned).toBe(old)
        expect(set.get(0)).toBe(replacement)
    })


    test('replace at undefined index returns null', () => {
        const set = new BrushSet()
        const replacement = new Brush({shape: 'sphere'})
        const returned = set.replace(5, replacement)
        expect(returned).toBeNull()
    })


    test('get out of bounds returns null', () => {
        const set = new BrushSet()
        expect(set.get(0)).toBeNull()
    })


    test('brushes returns copy', () => {
        const set = new BrushSet()
        set.add(new Brush())
        const arr = set.brushes
        arr.push(new Brush())
        expect(set.count).toBe(1)
    })


    test('build single brush', () => {
        const set = new BrushSet()
        set.add(new Brush({shape: 'box'}))
        const geo = set.build()
        expect(geo).not.toBeNull()
        expect(geo.vertexCount).toBeGreaterThan(0)
        expect(geo.indexCount).toBeGreaterThan(0)
        expect(set.result).toBe(geo)
    })


    test('build empty set returns null', () => {
        const set = new BrushSet()
        expect(set.build()).toBeNull()
    })


    test('build subtract', () => {
        const set = new BrushSet()
        set.add(new Brush({shape: 'box', sx: 2, sy: 2, sz: 2}))
        set.add(new Brush({shape: 'box', operation: 'subtract'}))
        const geo = set.build()
        expect(geo.indexCount / 3).toBeGreaterThan(12)
    })


    test('build skips disabled brushes', () => {
        const set = new BrushSet()
        set.add(new Brush({shape: 'box', sx: 2, sy: 2, sz: 2}))
        set.add(new Brush({shape: 'box', operation: 'subtract', enabled: false}))
        const geo = set.build()
        expect(geo.indexCount / 3).toBe(12)
    })


    test('incremental rebuild', () => {
        const set = new BrushSet()
        set.add(new Brush({shape: 'box', sx: 2, sy: 2, sz: 2}))
        set.add(new Brush({shape: 'box', operation: 'subtract'}))
        set.build()

        set.add(new Brush({shape: 'sphere', operation: 'subtract', params: {segments: 8, rings: 6}}))
        const geo = set.rebuild()
        expect(geo.indexCount / 3).toBeGreaterThan(12)
    })


    test('emits change on build', () => {
        const set = new BrushSet()
        set.add(new Brush({shape: 'box'}))
        const listener = vi.fn()
        set.on('change', listener)
        set.build()
        expect(listener).toHaveBeenCalledOnce()
        expect(listener.mock.calls[0][0].geometry).not.toBeNull()
        expect(listener.mock.calls[0][0].brushCount).toBe(1)
    })


    test('toJSON and fromJSON round-trip', () => {
        const set = new BrushSet()
        set.add(new Brush({shape: 'box', x: 1}))
        set.add(new Brush({shape: 'sphere', operation: 'subtract', x: 2}))
        const json = set.toJSON()
        const restored = BrushSet.fromJSON(json)
        expect(restored.count).toBe(2)
        expect(restored.get(0).shape).toBe('box')
        expect(restored.get(0).position.x).toBe(1)
        expect(restored.get(1).shape).toBe('sphere')
        expect(restored.get(1).operation).toBe('subtract')
    })


    test('rebuild after replace reuses snapshots', () => {
        const set = new BrushSet()
        set.add(new Brush({shape: 'box', sx: 2, sy: 2, sz: 2}))
        set.add(new Brush({shape: 'box', operation: 'subtract'}))
        set.add(new Brush({shape: 'sphere', operation: 'subtract', params: {segments: 8, rings: 6}}))
        set.build()

        set.replace(2, new Brush({shape: 'cone', operation: 'subtract'}))
        const geo = set.rebuild()
        expect(geo).not.toBeNull()
        expect(geo.indexCount).toBeGreaterThan(0)
    })

})
