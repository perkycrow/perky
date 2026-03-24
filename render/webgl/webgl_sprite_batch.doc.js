import {doc, section, text, code} from '../../doc/runtime.js'


export default doc('WebGLSpriteBatch', {advanced: true}, () => {

    text(`
        Batches sprite draw calls into a single GPU submission. Sprites sharing
        the same texture are packed into a shared vertex buffer and drawn with
        one \`drawElements\` call, minimizing state changes.

        Used internally by [[WebGLSpriteRenderer@render/webgl]]. You typically
        don't interact with this directly unless building a custom renderer.
    `)


    section('Batch Cycle', () => {

        text(`
            A batch cycle follows three steps:

            1. \`begin(program)\` — resets counters and optionally sets an alternate shader program
            2. \`addSprite(object, opacity, hints)\` — appends a sprite's vertices to the buffer
            3. \`end()\` / \`flush()\` — uploads the buffer and issues the draw call

            The batch auto-flushes when the texture changes or the buffer is full
            (\`maxSprites\` reached, default 1000).
        `)

        code('Manual batching', () => {
            batch.begin(spriteProgram)

            for (const sprite of sprites) {
                batch.addSprite(sprite, 1.0)
            }

            batch.end()
        })

    })


    section('Vertex Layout', () => {

        text(`
            Each vertex contains 18 floats:

            - \`aPosition\` (2) — world-space x, y
            - \`aTexCoord\` (2) — texture UV
            - \`aOpacity\` (1) — effective opacity
            - \`aAnchorY\` (1) — world-space anchor Y for shadow shaders
            - \`aTintColor\` (4) — RGBA tint
            - \`aEffectParams\` (4) — per-sprite shader effect parameters
            - \`aUVBounds\` (4) — UV region bounds for effect sampling

            Four vertices per sprite, six indices (two triangles).
        `)

    })

})
