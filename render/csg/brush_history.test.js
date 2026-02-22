import {describe, test, expect} from 'vitest'
import BrushHistory from './brush_history.js'
import BrushSet from './brush_set.js'
import Brush from './brush.js'


describe('BrushHistory', () => {

    function setup () {
        const set = new BrushSet()
        const history = new BrushHistory(set)
        return {set, history}
    }


    test('starts empty', () => {
        const {history} = setup()
        expect(history.canUndo).toBe(false)
        expect(history.canRedo).toBe(false)
        expect(history.stateCount).toBe(0)
    })


    test('save captures state', () => {
        const {set, history} = setup()
        set.add(new Brush({shape: 'box'}))
        history.save()
        expect(history.stateCount).toBe(1)
    })


    test('undo restores previous state', () => {
        const {set, history} = setup()
        set.add(new Brush({shape: 'box'}))
        history.save()
        set.add(new Brush({shape: 'sphere'}))
        history.save()
        expect(set.count).toBe(2)
        history.undo()
        expect(set.count).toBe(1)
        expect(set.get(0).shape).toBe('box')
    })


    test('redo restores next state', () => {
        const {set, history} = setup()
        set.add(new Brush({shape: 'box'}))
        history.save()
        set.add(new Brush({shape: 'sphere'}))
        history.save()
        history.undo()
        expect(set.count).toBe(1)
        history.redo()
        expect(set.count).toBe(2)
        expect(set.get(1).shape).toBe('sphere')
    })


    test('undo returns false when nothing to undo', () => {
        const {history} = setup()
        expect(history.undo()).toBe(false)
    })


    test('redo returns false when nothing to redo', () => {
        const {set, history} = setup()
        set.add(new Brush())
        history.save()
        expect(history.redo()).toBe(false)
    })


    test('save after undo truncates redo stack', () => {
        const {set, history} = setup()
        set.add(new Brush({shape: 'box'}))
        history.save()
        set.add(new Brush({shape: 'sphere'}))
        history.save()
        set.add(new Brush({shape: 'cylinder'}))
        history.save()

        history.undo()
        history.undo()

        set.add(new Brush({shape: 'cone'}))
        history.save()

        expect(history.canRedo).toBe(false)
        expect(history.stateCount).toBe(2)
    })


    test('respects maxStates', () => {
        const {set, history} = setup()
        const small = new BrushHistory(set, {maxStates: 3})
        for (let i = 0; i < 5; i++) {
            set.add(new Brush({x: i}))
            small.save()
        }
        expect(small.stateCount).toBe(3)
    })


    test('clear resets history', () => {
        const {set, history} = setup()
        set.add(new Brush())
        history.save()
        history.clear()
        expect(history.stateCount).toBe(0)
        expect(history.canUndo).toBe(false)
        expect(history.canRedo).toBe(false)
    })

})
