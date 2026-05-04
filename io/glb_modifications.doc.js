import {doc, section, text, action, logger} from '../doc/runtime.js'
import {loadModifications} from './glb_modifications.js'


export default doc('GLB Modifications', {advanced: true}, () => {

    text(`
        Loads modification config files for GLB models. Used to swap textures or override
        materials on 3D models at runtime without editing the original GLB files.
    `)


    section('loadModifications', () => {

        text(`
            Fetches a JSON config file describing modifications for a GLB model.
            Returns \`null\` if the file doesn't exist or isn't valid JSON.
        `)

        action('Load modifications config', async () => {
            const mods = await loadModifications('assets/props/barrel.glb.json')
            if (mods) {
                logger.log('loaded', mods.length, 'modifications')
                for (const mod of mods) {
                    logger.log('  type:', mod.type, '| material:', mod.material)
                }
            } else {
                logger.log('no modifications found')
            }
        })

    })


    section('Config Format', () => {

        text(`
            The config file is a JSON file with a \`modifications\` array. Each modification
            specifies a type and target material:

            \`\`\`json
            {
                "modifications": [
                    {
                        "type": "texture_swap",
                        "material": "wood",
                        "slot": "baseColor",
                        "texture": "wood_dark.png"
                    }
                ]
            }
            \`\`\`

            Texture paths are relative to the config file location. Images are loaded
            automatically and included in the returned modification objects.
        `)

    })

})
