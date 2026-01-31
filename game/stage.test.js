import {describe, test, expect, beforeEach, vi} from 'vitest'
import Stage from './stage.js'
import World from './world.js'
import WorldView from './world_view.js'
import PerkyModule from '../core/perky_module.js'


describe('Stage', () => {

    let stage

    beforeEach(() => {
        stage = new Stage({game: {}})
    })


    test('extends PerkyModule', () => {
        expect(stage).toBeInstanceOf(PerkyModule)
    })


    test('has stage category', () => {
        expect(Stage.$category).toBe('stage')
    })


    test('stores game reference', () => {
        const game = {name: 'testGame'}
        const s = new Stage({game})

        expect(s.game).toBe(game)
    })


    test('has null World by default', () => {
        expect(Stage.World).toBe(null)
    })


    test('has WorldView by default', () => {
        expect(Stage.WorldView).toBe(WorldView)
    })


    test('does not create world when World is null', () => {
        expect(stage.world).toBeUndefined()
    })


    test('does not create worldView when no world', () => {
        expect(stage.worldView).toBeUndefined()
    })


    test('creates world when World is defined', () => {
        class TestStage extends Stage {
            static World = World
        }

        const s = new TestStage({game: {}})

        expect(s.world).toBeInstanceOf(World)
    })


    test('creates worldView when World is defined', () => {
        class TestStage extends Stage {
            static World = World
        }

        const game = {}
        const s = new TestStage({game})

        expect(s.worldView).toBeInstanceOf(WorldView)
    })


    test('worldView receives world and game', () => {
        class TestStage extends Stage {
            static World = World
        }

        const game = {}
        const s = new TestStage({game})

        expect(s.worldView.world).toBe(s.world)
        expect(s.worldView.game).toBe(game)
    })


    test('does not create worldView when WorldView is null', () => {
        class TestStage extends Stage {
            static World = World
            static WorldView = null
        }

        const s = new TestStage({game: {}})

        expect(s.world).toBeInstanceOf(World)
        expect(s.worldView).toBeUndefined()
    })


    test('world is child of stage', () => {
        class TestStage extends Stage {
            static World = World
        }

        const s = new TestStage({game: {}})

        expect(s.getChild('world')).toBe(s.world)
    })


    test('worldView is child of stage', () => {
        class TestStage extends Stage {
            static World = World
        }

        const s = new TestStage({game: {}})

        expect(s.getChild('worldView')).toBe(s.worldView)
    })


    test('update is a no-op by default', () => {
        expect(() => stage.update(0.016)).not.toThrow()
    })


    test('render is a no-op by default', () => {
        expect(() => stage.render()).not.toThrow()
    })


    test('subclass can override update', () => {
        const updateSpy = vi.fn()

        class TestStage extends Stage {
            update (deltaTime) {
                updateSpy(deltaTime)
            }
        }

        const s = new TestStage({game: {}})
        s.update(0.016)

        expect(updateSpy).toHaveBeenCalledWith(0.016)
    })


    test('subclass can override render', () => {
        const renderSpy = vi.fn()

        class TestStage extends Stage {
            render () {
                renderSpy()
            }
        }

        const s = new TestStage({game: {}})
        s.render()

        expect(renderSpy).toHaveBeenCalled()
    })


    test('disposing stage disposes world and worldView', () => {
        class TestStage extends Stage {
            static World = World
        }

        const s = new TestStage({game: {}})
        const world = s.world
        const worldView = s.worldView

        s.dispose()

        expect(world.disposed).toBe(true)
        expect(worldView.disposed).toBe(true)
    })

})
