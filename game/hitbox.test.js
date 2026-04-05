import {describe, test, expect} from 'vitest'
import Entity from './entity.js'
import Component from './component.js'
import Hitbox from './hitbox.js'


describe('Hitbox', () => {

    test('extends Component', () => {
        const hitbox = new Hitbox()

        expect(hitbox).toBeInstanceOf(Component)
    })


    test('has default radius of 0', () => {
        const hitbox = new Hitbox()

        expect(hitbox.radius).toBe(0)
    })


    test('has default shape "circle"', () => {
        const hitbox = new Hitbox()

        expect(hitbox.shape).toBe('circle')
    })


    test('accepts custom radius', () => {
        const hitbox = new Hitbox({radius: 1.5})

        expect(hitbox.radius).toBe(1.5)
    })


    test('accepts custom shape', () => {
        const hitbox = new Hitbox({shape: 'box'})

        expect(hitbox.shape).toBe('box')
    })


    test('exposes itself as host.hitbox when attached', () => {
        const entity = new Entity()

        const hitbox = entity.create(Hitbox, {radius: 0.5})

        expect(entity.hitbox).toBe(hitbox)
        expect(entity.hitbox.radius).toBe(0.5)
    })


    test('host.hitbox is cleaned up on removal', () => {
        const entity = new Entity()

        entity.create(Hitbox, {$id: 'hitbox', radius: 0.5})

        expect(entity.hitbox).toBeDefined()

        entity.removeChild('hitbox')

        expect(entity.hitbox).toBeUndefined()
    })


    test('declares radius and shape in static $exports', () => {
        expect(Hitbox.$exports).toEqual(['radius', 'shape'])
    })


    test('exports radius and shape', () => {
        const hitbox = new Hitbox({radius: 0.8, shape: 'box'})
        const snapshot = hitbox.export()

        expect(snapshot.radius).toBe(0.8)
        expect(snapshot.shape).toBe('box')
    })


    test('imports radius and shape', () => {
        const hitbox = new Hitbox()
        hitbox.import({radius: 2, shape: 'box'})

        expect(hitbox.radius).toBe(2)
        expect(hitbox.shape).toBe('box')
    })

})
