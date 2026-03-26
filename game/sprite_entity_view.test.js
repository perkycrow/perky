import {describe, test, expect} from 'vitest'
import SpriteEntityView from './sprite_entity_view.js'


describe('SpriteEntityView', () => {

    test('creates sprite root from entity texture option', () => {
        const mockImage = {width: 64, height: 64}
        const entity = {
            x: 5,
            y: 3,
            options: {texture: 'tree', width: 2, height: 3}
        }
        const context = {
            game: {
                getSource: (id) => (id === 'tree' ? mockImage : null),
                getRegion: () => null
            }
        }

        const view = new SpriteEntityView(entity, context)

        expect(view.root).toBeDefined()
        expect(view.root.x).toBe(5)
        expect(view.root.y).toBe(3)
        expect(view.root.width).toBe(2)
        expect(view.root.height).toBe(3)
        expect(view.root.image).toBe(mockImage)
    })


    test('falls back to region when no source found', () => {
        const mockRegion = {x: 0, y: 0, width: 32, height: 32}
        const entity = {
            x: 0,
            y: 0,
            options: {texture: 'frame'}
        }
        const context = {
            game: {
                getSource: () => null,
                getRegion: (id) => (id === 'frame' ? mockRegion : null)
            }
        }

        const view = new SpriteEntityView(entity, context)

        expect(view.root.region).toBe(mockRegion)
    })


    test('sync updates root from entity options', () => {
        const entity = {
            x: 0,
            y: 0,
            options: {texture: 'tree', width: 2, height: 3, depth: 5, opacity: 0.8}
        }
        const context = {
            game: {
                getSource: () => ({width: 64, height: 64}),
                getRegion: () => null
            }
        }
        const view = new SpriteEntityView(entity, context)

        entity.x = 10
        entity.y = 20
        entity.options.width = 4
        entity.options.height = 6
        entity.options.depth = 10
        entity.options.opacity = 0.5
        view.sync()

        expect(view.root.x).toBe(10)
        expect(view.root.y).toBe(20)
        expect(view.root.width).toBe(4)
        expect(view.root.height).toBe(6)
        expect(view.root.depth).toBe(10)
        expect(view.root.opacity).toBe(0.5)
    })


    test('sync uses defaults when options are not set', () => {
        const entity = {
            x: 0,
            y: 0,
            options: {texture: 'tree'}
        }
        const context = {
            game: {
                getSource: () => ({width: 64, height: 64}),
                getRegion: () => null
            }
        }
        const view = new SpriteEntityView(entity, context)

        view.sync()

        expect(view.root.width).toBeNull()
        expect(view.root.height).toBeNull()
        expect(view.root.depth).toBe(0)
        expect(view.root.opacity).toBe(1)
    })

})
