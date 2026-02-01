import {doc, section, text, code, action, logger} from '../../doc/runtime.js'
import TextureAtlasManager from './texture_atlas_manager.js'


export default doc('TextureAtlasManager', {advanced: true}, () => {

    text(`
        Manages multiple [[TextureAtlas@render/textures]] instances. Automatically creates
        new atlases when the current one is full and handles oversized images as standalone
        regions. Used by [[TextureSystem@render/textures]] to pack sprites for GPU batching.
    `)


    section('Adding Images', () => {

        text(`
            Use \`add(id, image)\` to pack an image into the default atlas group.
            Duplicate IDs return the existing region. Images larger than the atlas size
            are stored as standalone [[TextureRegion@render/textures]] objects.
        `)

        code('Adding images', () => {
            const manager = new TextureAtlasManager({atlasSize: 1024})

            const region = manager.add('player', playerImage)
            const batch = manager.addBatch({
                enemy: enemyImage,
                bullet: bulletImage
            })
        })

    })


    section('Named Atlas Groups', () => {

        text(`
            Use \`addToNamedAtlas(atlasName, id, image)\` to group related images into
            separate atlas sets. Useful for keeping tilesets, characters, and UI elements
            in their own atlas groups.
        `)

        code('Named groups', () => {
            const manager = new TextureAtlasManager()

            manager.addToNamedAtlas('ui', 'button', buttonImage)
            manager.addToNamedAtlas('ui', 'icon', iconImage)
            manager.addToNamedAtlas('tiles', 'grass', grassImage)
        })

    })


    section('Retrieving Regions', () => {

        text('Look up packed regions by their ID.')

        code('Getting a region', () => {
            const manager = new TextureAtlasManager()
            manager.add('sprite', image)

            const region = manager.get('sprite')
            const exists = manager.has('sprite')
        })

    })


    section('Dirty Tracking', () => {

        text(`
            Atlases are marked dirty when images are added. Use \`getDirtyAtlases()\` to
            find which atlases need re-uploading to the GPU, then \`markAllClean()\` after syncing.
        `)

        code('Dirty tracking', () => {
            const manager = new TextureAtlasManager()
            manager.add('sprite', image)

            const dirty = manager.getDirtyAtlases()

            // Upload dirty atlas canvases to GPU textures...
            manager.markAllClean()
        })

    })


    section('Cleanup', () => {

        text('`clear()` disposes all atlases and resets the manager. `dispose()` does the same.')

        code('Clearing', () => {
            const manager = new TextureAtlasManager()
            manager.clear()
        })

    })

})
