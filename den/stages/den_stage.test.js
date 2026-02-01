import {describe, test, expect, vi} from 'vitest'
import DenStage from './den_stage.js'
import Stage from '../../game/stage.js'
import DenWorld from '../den_world.js'
import WorldView from '../../game/world_view.js'


describe('DenStage', () => {

    test('extends Stage', () => {
        const stage = new DenStage({game: {}})

        expect(stage).toBeInstanceOf(Stage)
    })


    test('uses DenWorld', () => {
        expect(DenStage.World).toBe(DenWorld)
    })


    test('creates world as DenWorld', () => {
        const stage = new DenStage({game: {}})

        expect(stage.world).toBeInstanceOf(DenWorld)
    })


    test('creates worldView', () => {
        const stage = new DenStage({game: {}})

        expect(stage.worldView).toBeInstanceOf(WorldView)
    })


    test('dayNightPass getter delegates to game renderer', () => {
        const mockPass = {setProgress: vi.fn()}
        const game = {
            getRenderer: vi.fn(() => ({
                getPass: vi.fn(() => mockPass)
            }))
        }

        const stage = new DenStage({game})

        expect(stage.dayNightPass).toBe(mockPass)
    })


    test('dayNightPass returns undefined when no renderer', () => {
        const game = {
            getRenderer: vi.fn(() => null)
        }

        const stage = new DenStage({game})

        expect(stage.dayNightPass).toBeUndefined()
    })


    test('updateShadows does nothing without shadowTransform', () => {
        const stage = new DenStage({game: {}})

        expect(() => stage.updateShadows(0.5)).not.toThrow()
    })


    test('updateShadows modifies shadowTransform', () => {
        const stage = new DenStage({game: {}})
        stage.shadowTransform = {skewX: 0, scaleY: 0, offsetY: 0, color: [0, 0, 0, 0]}

        stage.updateShadows(0.5)

        expect(stage.shadowTransform.skewX).toBeDefined()
        expect(stage.shadowTransform.color).toBeDefined()
    })


    test('setHitboxDebug delegates to hitboxDebug', () => {
        const stage = new DenStage({game: {}})
        stage.hitboxDebug = {setEnabled: vi.fn()}

        stage.setHitboxDebug(true)

        expect(stage.hitboxDebug.setEnabled).toHaveBeenCalledWith(true)
    })


    test('toggleHitboxDebug delegates to hitboxDebug', () => {
        const stage = new DenStage({game: {}})
        stage.hitboxDebug = {toggle: vi.fn(() => true)}

        const result = stage.toggleHitboxDebug()

        expect(stage.hitboxDebug.toggle).toHaveBeenCalled()
        expect(result).toBe(true)
    })


    test('update calls world.update with game as context', () => {
        const game = {name: 'testGame'}
        const stage = new DenStage({game})
        stage.world.update = vi.fn()
        stage.impactParticles = {update: vi.fn()}

        stage.update(0.016)

        expect(stage.world.update).toHaveBeenCalledWith(0.016, game)
    })


    test('update calls impactParticles.update', () => {
        const stage = new DenStage({game: {}})
        stage.world.update = vi.fn()
        stage.impactParticles = {update: vi.fn()}

        stage.update(0.016)

        expect(stage.impactParticles.update).toHaveBeenCalledWith(0.016)
    })


    test('render calls worldView.syncViews', () => {
        const stage = new DenStage({game: {}})
        stage.worldView.syncViews = vi.fn()
        stage.hitboxDebug = {update: vi.fn()}

        const mockRenderer = {setUniform: vi.fn(), getPass: vi.fn(() => null)}
        stage.game = {
            getLayer: vi.fn(() => ({canvas: {width: 800, height: 600}})),
            getRenderer: vi.fn(() => mockRenderer)
        }

        stage.render()

        expect(stage.worldView.syncViews).toHaveBeenCalled()
    })


    test('render calls hitboxDebug.update', () => {
        const stage = new DenStage({game: {}})
        stage.worldView.syncViews = vi.fn()
        stage.hitboxDebug = {update: vi.fn()}

        const mockRenderer = {setUniform: vi.fn(), getPass: vi.fn(() => null)}
        stage.game = {
            getLayer: vi.fn(() => ({canvas: {width: 800, height: 600}})),
            getRenderer: vi.fn(() => mockRenderer)
        }

        stage.render()

        expect(stage.hitboxDebug.update).toHaveBeenCalled()
    })

})
