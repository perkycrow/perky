import {doc, section, text, code} from '../../../doc/runtime.js'
import VolumetricFogEffect from './volumetric_fog_effect.js'


export default doc('VolumetricFogEffect', {advanced: true}, () => {

    text(`
        Screen-space volumetric fog with light scattering. Ray-marches
        through the scene accumulating fog density and in-scattered
        light from point lights.
    `)


    section('Properties', () => {

        text(`
            \`enabled\` — toggle effect on/off

            \`time\` — animation time for wind movement

            Density:
            - \`density\` — base fog density (default: 0.05)
            - \`heightFalloff\` — exponential height decay (default: 0.2)
            - \`baseHeight\` — ground level (default: 0)

            Noise animation:
            - \`noiseScale\` — noise frequency (default: 0.1)
            - \`noiseStrength\` — noise influence (default: 0.5)
            - \`windDirection\` — [x, z] wind direction (default: [1, 0])
            - \`windSpeed\` — wind animation speed (default: 0.5)

            Light scattering:
            - \`scatterAnisotropy\` — Henyey-Greenstein g value (default: 0.3)

            Ray-marching:
            - \`steps\` — number of samples (default: 16)
            - \`maxDistance\` — maximum ray distance (default: 80)
            - \`startDistance\` — fade-in distance (default: 3)
        `)

        code('Configuring fog', () => {
            fog.enabled = true
            fog.density = 0.08
            fog.heightFalloff = 0.3
            fog.scatterAnisotropy = 0.5
            fog.time = elapsedTime
        })

    })


    section('Algorithm', () => {

        text(`
            1. Ray-march from camera toward each pixel
            2. Sample fog density (height-based with noise)
            3. Accumulate in-scattered light from point lights
            4. Apply Henyey-Greenstein phase function for directional scattering
            5. Bilateral blur to reduce noise while preserving edges
            6. Composite over scene using transmittance

            Positive anisotropy creates forward scattering (sun shafts),
            negative creates backscatter (halo effects).
        `)

    })


    section('Rendering', () => {

        text(`
            \`init(shaderRegistry)\` — registers fog and blur shaders

            \`render(gl, ctx, sceneTexture)\` — computes fog and composites

            Returns the final composited texture.
        `)

    })


    section('Cleanup', () => {

        text(`
            \`dispose(gl)\` deletes framebuffers and textures.
        `)

    })

})
