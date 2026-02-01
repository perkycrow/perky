import {doc, section, text, code, action, logger} from '../../doc/runtime.js'
import ShelfPacker from './shelf_packer.js'


export default doc('ShelfPacker', {advanced: true}, () => {

    text(`
        Shelf-based bin packing algorithm used by [[TextureAtlas@render/textures]] to
        arrange images into a fixed-size area. Places items in horizontal rows (shelves),
        creating new shelves as needed until the space is full.
    `)


    section('Packing', () => {

        text(`
            Call \`pack(width, height)\` to place a rectangle. Returns an \`{x, y}\` position
            or \`null\` if it doesn't fit. Padding is added between items automatically.
        `)

        action('Pack items', () => {
            const packer = new ShelfPacker(256, 256, 1)

            logger.log('slot 1:', packer.pack(64, 64))
            logger.log('slot 2:', packer.pack(64, 64))
            logger.log('slot 3:', packer.pack(128, 32))
            logger.log('full:', packer.full)
        })

    })


    section('Checking Fit', () => {

        text('Use `canFit(width, height)` to check if a rectangle can be placed without committing.')

        action('Check before packing', () => {
            const packer = new ShelfPacker(128, 128, 1)
            packer.pack(100, 100)

            logger.log('can fit 100x100:', packer.canFit(100, 100))
            logger.log('can fit 20x20:', packer.canFit(20, 20))
        })

    })


    section('Full State', () => {

        text('The `full` property becomes `true` when a pack call fails due to insufficient vertical space.')

        action('Filling up', () => {
            const packer = new ShelfPacker(64, 64, 0)

            packer.pack(64, 32)
            logger.log('after first:', packer.full)

            packer.pack(64, 32)
            logger.log('after second:', packer.full)

            const result = packer.pack(64, 32)
            logger.log('third result:', result)
            logger.log('now full:', packer.full)
        })

    })

})
