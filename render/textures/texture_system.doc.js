import {doc, section, text, code, container} from '../../doc/runtime.js'
import TextureSystem from './texture_system.js'
import {pluralize} from '../../core/utils.js'


export default doc('TextureSystem', {advanced: true}, () => {

    text(`
        High-level texture management system that automatically packs images
        into texture atlases. Integrates with the renderer to optimize draw calls
        by batching sprites that share the same atlas texture.
    `)


    section('Live Demo', () => {

        text('Add images to the texture system and see how they are packed into atlases.')

        container({title: 'Texture system in action', height: 420, scrollable: true, preset: 'centered'}, ctx => {
            const system = new TextureSystem({atlasSize: 512})

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

            function buildSystem () {
                const scaled = loadedImages.map(({name, img, scale}) => ({
                    name,
                    canvas: scaleImage(img, scale)
                }))

                scaled.sort((a, b) => b.canvas.height - a.canvas.height)

                for (const {name, canvas} of scaled) {
                    system.addRegion(name, canvas)
                }

                system.atlases.forEach((atlas, i) => {
                    const col = ctx.column({parent: atlasesRow})
                    ctx.label(`Atlas ${i + 1} (${pluralize('region', atlas.regionCount, true)})`, {parent: col})
                    ctx.canvas(atlas.canvas, {maxWidth: 300, parent: col})
                })

                infoLabel.textContent = `TextureSystem: ${pluralize('region', system.regionCount, true)} in ${pluralize('atlas', system.atlases.length, true)}`
            }

            images.forEach(({name, src, scale}) => {
                const img = new Image()
                img.src = src
                img.onload = () => {
                    loadedImages.push({name, img, scale})
                    loaded++
                    infoLabel.textContent = `Loading ${loaded}/${images.length}...`

                    if (loaded === images.length) {
                        buildSystem()
                    }
                }
            })
        })

    })


    section('Basic Usage', () => {

        text('Create a texture system and add images to it.')

        code('Adding regions', () => {
            const textureSystem = new TextureSystem({
                atlasSize: 2048  // Optional, default is 2048
            })

            // Add a single image
            const region = textureSystem.addRegion('player', playerImage)

            // Add multiple images at once
            textureSystem.addRegions({
                enemy: enemyImage,
                bullet: bulletImage,
                explosion: explosionImage
            })

            // Retrieve a region later
            const playerRegion = textureSystem.getRegion('player')

            // Check if region exists
            if (textureSystem.hasRegion('player')) {
                // Use region
            }
        })

    })


    section('Manual Atlases', () => {

        text(`
            For pre-made spritesheets with known frame positions,
            use \`registerManualAtlas\` to define regions without repacking.
        `)

        code('Registering a spritesheet', () => {
            const textureSystem = new TextureSystem()

            // Define frames for a spritesheet
            const frames = {
                idle: {x: 0, y: 0, w: 64, h: 64},
                run1: {x: 64, y: 0, w: 64, h: 64},
                run2: {x: 128, y: 0, w: 64, h: 64},
                jump: {x: 192, y: 0, w: 64, h: 64}
            }

            textureSystem.registerManualAtlas('hero', spritesheetImage, frames)

            // Access regions with prefixed IDs
            const idleRegion = textureSystem.getRegion('hero:idle')
            const run1Region = textureSystem.getRegion('hero:run1')
        })

    })


    section('Integration', () => {

        text(`
            TextureSystem is a [[PerkyModule@core]] that can be installed on a host.
            When installed, it delegates key methods to the host for convenience.
        `)

        code('As a module', () => {
            // TextureSystem delegates these methods to its host:
            // - getRegion
            // - hasRegion
            // - addRegion
            // - addRegions
            // - registerManualAtlas

            // After installation, you can call them directly on the host
            host.addRegion('sprite', image)
            const region = host.getRegion('sprite')
        })

    })


    section('Dirty Tracking', () => {

        text(`
            The system tracks which atlases have been modified since the last
            GPU upload. This allows efficient texture updates.
        `)

        code('Syncing with GPU', () => {
            const textureSystem = new TextureSystem()

            // Add some images...
            textureSystem.addRegion('a', imageA)
            textureSystem.addRegion('b', imageB)

            // Get atlases that need uploading
            const dirtyAtlases = textureSystem.getDirtyAtlases()

            for (const atlas of dirtyAtlases) {
                // Upload atlas.canvas to GPU texture
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, atlas.canvas)
            }

            // Mark all as clean after upload
            textureSystem.markAllClean()
        })

    })

})
