import {describe, test, expect} from 'vitest'
import ShelfPacker from './shelf_packer.js'


describe(ShelfPacker, () => {

    test('constructor sets dimensions and padding', () => {
        const packer = new ShelfPacker(256, 256, 2)

        expect(packer.width).toBe(256)
        expect(packer.height).toBe(256)
        expect(packer.padding).toBe(2)
        expect(packer.full).toBe(false)
    })


    test('pack returns slot for first item', () => {
        const packer = new ShelfPacker(256, 256, 1)

        const slot = packer.pack(32, 32)

        expect(slot).toEqual({x: 0, y: 0})
    })


    test('pack places items side by side on same shelf', () => {
        const packer = new ShelfPacker(256, 256, 1)

        packer.pack(32, 32)
        const slot2 = packer.pack(32, 32)

        expect(slot2.x).toBe(33)
        expect(slot2.y).toBe(0)
    })


    test('pack creates new shelf when width exceeded', () => {
        const packer = new ShelfPacker(100, 256, 1)

        packer.pack(40, 20)
        packer.pack(40, 20)
        const slot3 = packer.pack(40, 20)

        expect(slot3.x).toBe(0)
        expect(slot3.y).toBe(21)
    })


    test('pack returns null when height exceeded', () => {
        const packer = new ShelfPacker(100, 50, 1)

        packer.pack(90, 20)
        packer.pack(90, 20)
        const slot3 = packer.pack(90, 20)

        expect(slot3).toBeNull()
        expect(packer.full).toBe(true)
    })


    test('canFit returns true when space available', () => {
        const packer = new ShelfPacker(256, 256, 1)

        expect(packer.canFit(32, 32)).toBe(true)
    })


    test('canFit returns false when no space', () => {
        const packer = new ShelfPacker(50, 50, 1)

        packer.pack(48, 48)

        expect(packer.canFit(48, 48)).toBe(false)
    })


    test('uses existing shelf when item fits', () => {
        const packer = new ShelfPacker(256, 256, 1)

        packer.pack(32, 64)
        packer.pack(32, 32)
        const slot3 = packer.pack(32, 32)

        expect(slot3.y).toBe(0)
    })

})
