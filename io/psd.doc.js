import {doc, section, text, code} from '../doc/runtime.js'
import {parsePsd, layerToRGBA} from './psd.js'


export default doc('PSD Parser', {advanced: true}, () => {

    text(`
        Photoshop file parser. Reads the binary PSD format, extracts layers with
        pixel data, and builds a tree of groups and layers. Also detects ICC color
        profiles. Used by [[PsdConverter@io]] to drive the PSD-to-spritesheet pipeline.
    `)


    section('parsePsd', () => {

        text(`
            Parses a PSD file from a Uint8Array. Returns width, height, color mode,
            color profile, flat layer list, tree structure, and detected animations.
        `)

        code('Basic usage', () => {
            const psd = parsePsd(new Uint8Array(buffer))

            psd.width         // 512
            psd.height        // 512
            psd.colorMode     // 'RGB'
            psd.colorProfile  // {name: 'sRGB', isP3: false}
            psd.layers        // flat array of layer records
            psd.tree          // [{type: 'group', name: 'anim - idle', children: [...]}]
            psd.animations    // {idle: [layer, layer, ...], run: [...]}
        })

    })


    section('layerToRGBA', () => {

        text(`
            Converts a layer's channel data into an RGBA pixel buffer. By default
            produces a full-size image matching the PSD dimensions. Pass \`trim: true\`
            to get a tightly-cropped result with offset coordinates.
        `)

        code('Full-size output', () => {
            const rgba = layerToRGBA(layer, psd.width, psd.height)

            rgba.pixels  // Uint8Array of RGBA data
            rgba.width   // psd.width
            rgba.height  // psd.height
        })

        code('Trimmed output', () => {
            const rgba = layerToRGBA(layer, psd.width, psd.height, {trim: true})

            rgba.pixels  // cropped RGBA data
            rgba.width   // layer width
            rgba.height  // layer height
            rgba.left    // x offset within PSD
            rgba.top     // y offset within PSD
        })

    })


    section('Layer Tree', () => {

        text(`
            The tree structure mirrors PSD groups. Groups named \`anim - idle\`,
            \`anim - run\`, etc. are detected as animation groups. Frame layers
            inside are sorted numerically by name.
        `)

        code('Tree structure', () => {
            psd.tree[0].type     // 'group'
            psd.tree[0].name     // 'anim - idle'
            psd.tree[0].children // [{type: 'layer', name: '1', layer: {...}}, ...]
        })

    })

})
