import {doc, section, text, code, action, logger} from '../doc/runtime.js'
import {loadScene, serializeScene} from './scene_config.js'
import Entity from './entity.js'
import World from './world.js'


export default doc('SceneConfig', () => {

    text(`
        Loads and saves scene layouts. A scene config is a JSON object with
        an \`entities\` array — each entry has a \`type\`, position, and optional id.
        Use with a [[Wiring@game]] registry to resolve type names to classes.
    `)


    section('Loading a Scene', () => {

        text(`
            \`loadScene\` reads a config and creates entities in a world.
            Each entry's \`type\` is resolved through wiring. Entries with
            unknown types are skipped.
        `)

        code('loadScene signature', () => {
            // loadScene(config, world, wiring) → Entity[]
            //
            // config: {entities: [{type, x, y, $id}, ...]}
            // world:  a World instance to create entities in
            // wiring: a Wiring instance with 'entities' registry
        })

    })


    section('Serializing a Scene', () => {

        text(`
            \`serializeScene\` walks a world's entities and builds a config
            object. Only entities whose class is registered in wiring are
            included. Zero positions are omitted to keep configs compact.
        `)

        code('serializeScene signature', () => {
            // serializeScene(world, wiring) → {entities: [...]}
        })

    })


    section('Round-Trip', () => {

        action('Load and serialize', () => {
            class Player extends Entity {}

            const wiring = {
                get: (ns, name) => (name === 'Player' ? Player : null),
                getAll: () => ({Player})
            }

            const config = {entities: [{type: 'Player', x: 3, y: 5}]}
            const world = new World()
            const loaded = loadScene(config, world, wiring)

            logger.log('loaded:', loaded.length, 'entities')

            const serialized = serializeScene(world, wiring)
            logger.log('serialized:', JSON.stringify(serialized))
        })

    })

})
