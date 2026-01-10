import {doc, section, text, code, container} from '../../doc/runtime.js'
import TextureAtlas from './texture_atlas.js'
import TextureAtlasManager from './texture_atlas_manager.js'
import {pluralize} from '../../core/utils.js'


export default doc('TextureAtlas', {advanced: true}, () => {

    text(`
        Dynamic texture atlas that packs multiple images into a single texture.
        Uses a shelf-packing algorithm to efficiently arrange images.
        Useful for batching draw calls by combining multiple sprites into one texture.
    `)


    section('Atlas Preview', () => {

        text(`
            Pack multiple images into atlases using [[TextureAtlasManager@render/textures]].
            When one atlas is full, a new one is created automatically.
        `)

        container({title: 'Generated atlases', height: 420, scrollable: true, preset: 'centered'}, ctx => {
            const manager = new TextureAtlasManager({atlasSize: 512})

            const images = [
                {name: 'logo', src: './assets/images/logo.png', scale: 0.5},
                {name: 'shroom', src: './assets/images/shroom.png', scale: 0.5},
                {name: 'spore', src: './assets/images/spore.png', scale: 1},
                {name: 'next', src: './assets/images/next.png', scale: 0.5},
                {name: 'restart', src: './assets/images/restart.png', scale: 0.5}
            ]

            let loaded = 0
            const loadedImages = []

            const wrapper = ctx.column({gap: 8})
            const infoLabel = ctx.label('Loading images...', {parent: wrapper})
            const atlasesRow = ctx.row({gap: 12, parent: wrapper})

            function scaleImage (img, scale) {
                const w = Math.floor(img.width * scale)
                const h = Math.floor(img.height * scale)
                const canvas = document.createElement('canvas')
                canvas.width = w
                canvas.height = h
                canvas.getContext('2d').drawImage(img, 0, 0, w, h)
                return canvas
            }

            function buildAtlases () {
                const scaled = loadedImages.map(({name, img, scale}) => ({
                    name,
                    canvas: scaleImage(img, scale)
                }))

                scaled.sort((a, b) => b.canvas.height - a.canvas.height)

                for (const {name, canvas} of scaled) {
                    manager.add(name, canvas)
                }

                manager.atlases.forEach((atlas, i) => {
                    const col = ctx.column({parent: atlasesRow})
                    ctx.label(`Atlas ${i + 1} (${pluralize('region', atlas.regionCount, true)}${atlas.full ? ', full' : ''})`, {parent: col})
                    ctx.canvas(atlas.canvas, {maxWidth: 300, parent: col})
                })

                infoLabel.textContent = `Total: ${pluralize('atlas', manager.atlasCount, true)} | ${pluralize('region', manager.regionCount, true)}`
            }

            images.forEach(({name, src, scale}) => {
                const img = new Image()
                img.src = src
                img.onload = () => {
                    loadedImages.push({name, img, scale})
                    loaded++
                    infoLabel.textContent = `Loading ${loaded}/${images.length}...`

                    if (loaded === images.length) {
                        buildAtlases()
                    }
                }
            })
        })

    })


    section('Basic Usage', () => {

        text('Create an atlas and add images to it.')

        code('Creating and using an atlas', () => {
            const atlas = new TextureAtlas({
                width: 1024,
                height: 1024,
                padding: 1
            })

            // Add an image (returns a TextureRegion)
            const region = atlas.add('sprite-id', imageElement)

            // Check if image was added
            if (region) {
                // Use region.u0, region.v0, region.u1, region.v1 for UV coordinates
            }

            // Retrieve a region later
            const cached = atlas.get('sprite-id')

            // Check if atlas can fit another image
            if (atlas.canFit(128, 128)) {
                // There's room for a 128x128 image
            }
        })

    })


    section('Properties', () => {

        text(`
            - \`width\` / \`height\` - Atlas dimensions in pixels
            - \`padding\` - Space between packed images (default: 1)
            - \`canvas\` - The underlying canvas element
            - \`dirty\` - True if atlas was modified since last markClean()
            - \`full\` - True if no more images can be packed
            - \`regionCount\` - Number of images in the atlas
        `)

        code('Checking atlas state', () => {
            const atlas = new TextureAtlas({width: 512, height: 512})

            atlas.add('image1', img1)
            atlas.add('image2', img2)

            console.log(atlas.regionCount) // 2
            console.log(atlas.full)        // false (probably)
            console.log(atlas.dirty)       // true

            atlas.markClean()
            console.log(atlas.dirty)       // false
        })

    })


    section('Clearing and Disposal', () => {

        text('Clear the atlas to reuse it, or dispose when done.')

        code('Clear vs dispose', () => {
            const atlas = new TextureAtlas()

            // Clear removes all images but keeps the atlas usable
            atlas.clear()

            // Dispose releases all resources
            atlas.dispose()
        })

    })

})
