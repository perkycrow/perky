import {doc, section, text, code, action, logger} from '../doc/runtime.js'
import Wiring from './wiring.js'


class Player {}


class Enemy {}


class PlayerView {

    static config = {texture: 'player'}

}


class EnemyView {

    static config = {texture: 'enemy'}

}


class BlurEffect {}


function asModules (...classes) {
    const modules = {}

    for (const Class of classes) {
        modules[`./${Class.name}.js`] = {default: Class}
    }

    return modules
}


export default doc('Wiring', () => {

    text(`
        Organizes module imports into named groups for entity-view mapping and effect registration.
        Used to wire up game entities with their visual representations.
    `)


    section('Basic Usage', () => {

        text(`
            Wiring takes module groups and extracts classes by their name.
            Each group maps class names to their constructors.
        `)

        action('Create wiring', () => {
            const wiring = new Wiring({
                entities: asModules(Player, Enemy),
                views: asModules(PlayerView, EnemyView)
            })

            logger.log('groups:', wiring.groups)
            logger.log('has Player:', wiring.has('entities', 'Player'))
            logger.log('get Player:', wiring.get('entities', 'Player')?.name)
        })

        action('Get all from group', () => {
            const wiring = new Wiring({
                entities: asModules(Player, Enemy)
            })

            const entities = wiring.getAll('entities')
            logger.log('entities:', Object.keys(entities))
        })

    })


    section('View Registration', () => {

        text(`
            \`registerViews\` automatically matches entities with their views.
            A view named \`PlayerView\` is paired with an entity named \`Player\`.
        `)

        code('Register with stage', () => {
            const wiring = new Wiring({
                entities: asModules(Player, Enemy),
                views: asModules(PlayerView, EnemyView)
            })

            // stage.register(Player, PlayerView, {texture: 'player'})
            // stage.register(Enemy, EnemyView, {texture: 'enemy'})
            wiring.registerViews(stage)
        })

        code('With config overrides', () => {
            const wiring = new Wiring({
                entities: asModules(Player),
                views: asModules(PlayerView)
            })

            // Overrides PlayerView.config.texture
            wiring.registerViews(stage, {
                Player: {texture: 'hero'}
            })
        })

    })


    section('Effect Registration', () => {

        text(`
            \`registerEffects\` registers all shader effects with a renderer.
        `)

        code('Register effects', () => {
            const wiring = new Wiring({
                effects: asModules(BlurEffect)
            })

            // renderer.registerShaderEffect(BlurEffect)
            wiring.registerEffects(renderer)
        })

    })


    section('API', () => {

        code('Constructor', () => {
            const wiring = new Wiring({
                entities: asModules(Player, Enemy),
                views: asModules(PlayerView, EnemyView),
                effects: asModules(BlurEffect)
            })
        })

        code('Methods', () => {
            // wiring.get(group, name) - Get class by group and name
            // wiring.getAll(group) - Get all classes in a group
            // wiring.has(group, name) - Check if class exists
            // wiring.registerViews(stage, overrides) - Register entity-view pairs
            // wiring.registerEffects(renderer) - Register shader effects
        })

        code('Properties', () => {
            // wiring.groups - Array of group names
        })

    })

})
