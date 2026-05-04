import {doc, section, text, code} from '../doc/runtime.js'


export default doc('SMAA Lookup Textures', {advanced: true}, () => {

    text(`
        Precomputed lookup textures for SMAA (Subpixel Morphological
        Anti-Aliasing). These are base64-encoded PNG images containing
        coverage patterns used by the weight calculation pass.
    `)


    section('Area Texture', () => {

        text(`
            \`SMAA_AREA_TEXTURE\` contains precomputed coverage areas for
            different edge patterns. The weight calculation shader samples
            this texture to determine blending weights for each pixel.

            Dimensions: 160×560 pixels (7 subtextures × 80 patterns each)

            For each pair of edge distances, stores the coverage area
            needed to blend smoothly between pixels.
        `)

    })


    section('Search Texture', () => {

        text(`
            \`SMAA_SEARCH_TEXTURE\` accelerates edge pattern searches.
            Instead of iterating pixel-by-pixel, the shader samples
            this texture to jump directly to pattern boundaries.

            Dimensions: 66×33 pixels (packed pattern lookup)

            Encodes jump distances for different edge configurations,
            reducing the number of texture fetches during edge detection.
        `)

    })


    section('Usage', () => {

        text(`
            These textures are loaded once and bound during the weight
            calculation pass of SMAA. The effect handles this automatically.
        `)

        code('Texture exports', () => {
            const {SMAA_AREA_TEXTURE, SMAA_SEARCH_TEXTURE} = smaaLookupTextures
        })

    })

})
