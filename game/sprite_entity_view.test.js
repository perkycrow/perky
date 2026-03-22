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

})
