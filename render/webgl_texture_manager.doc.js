import {doc, section, text, code, action, logger} from '../doc/runtime.js'
import WebGLTextureManager from './webgl_texture_manager.js'


export default doc('WebGLTextureManager', {advanced: true}, () => {

    text(`
        Manages GPU texture lifecycle with reference counting and deferred
        deletion. Textures move through three states: active (in use), zombie
        (released but kept in VRAM), and deleted.

        When all references to a texture are released, it becomes a zombie
        rather than being deleted immediately. Zombies are resurrected for
        free if the same image is needed again, avoiding costly re-uploads.
    `)


    section('Acquire and Release', () => {

        text(`
            \`acquire(image)\` returns a WebGL texture for an image source,
            creating one if needed or resurrecting a zombie. Each acquire
            increments a reference count.

            \`release(image)\` decrements the count. When it hits zero the
            texture moves to the zombie pool.
        `)

        code('Basic usage', () => {
            const texture = textureManager.acquire(image)
            textureManager.release(image)
        })

    })


    section('Zombie Pool', () => {

        text(`
            Zombies sit in VRAM until flushed. Three flush strategies:

            - \`flush()\` — deletes all zombies immediately
            - \`flushIfFull()\` — evicts oldest zombies when pool exceeds \`maxZombieSize\` (default 150 MB)
            - \`flushStale(maxAge)\` — evicts zombies older than \`maxAge\` (default 15 minutes)

            Auto-flush runs on an interval when the manager is started
            (\`autoFlushInterval\`, default 60 seconds).
        `)

    })


    section('Quick Lookup', () => {

        text(`
            \`getTexture(image)\` returns the GPU texture for an image without
            changing reference counts. If the image has no texture yet, it
            auto-acquires one. Useful for renderers that just need the texture
            handle without managing ownership.
        `)

    })


    section('Stats', () => {

        text(`
            The \`stats\` getter returns a snapshot of active and zombie counts,
            sizes, and formatted MB values for monitoring VRAM usage.
        `)

    })

})
