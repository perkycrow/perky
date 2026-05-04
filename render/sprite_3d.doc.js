import {doc, section, text, code} from '../doc/runtime.js'
import Sprite3D from './sprite_3d.js'


export default doc('Sprite3D', () => {

    text(`
        Textured quad in 3D space that faces the camera horizontally
        while staying upright. Useful for characters, vegetation, or
        particles in a 3D scene.
    `)


    section('Constructor', () => {

        text(`
            Extends Object3D with sprite-specific properties.

            Options:
            - \`texture\` — texture to display (or use material)
            - \`material\` — Material3D for full material properties
            - \`width\`, \`height\` — world-space size (default: 1)
            - \`anchorX\`, \`anchorY\` — anchor point (default: 0.5, 0.0)
            - \`castShadow\` — whether to cast shadows (default: false)
        `)

        code('Creating a sprite', () => {
            const sprite = new Sprite3D({
                texture: treeTexture,
                width: 2,
                height: 3,
                anchorY: 0
            })
        })

    })


    section('Properties', () => {

        text(`
            \`texture\` — direct texture reference

            \`material\` — optional Material3D for color, emissive, roughness, etc.

            \`width\`, \`height\` — sprite dimensions in world units

            \`anchorX\`, \`anchorY\` — origin point (0-1, default: center-bottom)

            \`castShadow\` — enables shadow casting

            \`activeTexture\` — returns material texture if set, otherwise texture
        `)

    })


    section('Rendering', () => {

        text(`
            The WebGLSprite3DRenderer handles billboarding automatically.
            Sprites rotate to face the camera on the Y axis while remaining
            upright, with subtle tilt when viewed from above.

            Depth is calculated from the sprite center for correct sorting
            with other 3D objects.
        `)

    })

})
