import {doc, section, text, code, action, logger} from '../doc/runtime.js'
import GameController from './game_controller.js'
import Entity from './entity.js'


export default doc('GameController', () => {

    text(`
        Extends [[ActionController@core]] with game-specific conveniences.
        Provides access to world, renderer, and camera as resources,
        plus a spawn shorthand for creating entities.
    `)


    section('Basic Usage', () => {

        text(`
            Extend GameController and define action methods.
            Use \`this.world\`, \`this.renderer\`, and \`this.camera\` to interact with the game.
        `)

        code('Custom controller', () => {
            class BattleController extends GameController {
                shoot () {
                    this.spawn(Bullet, {
                        x: this.camera.x,
                        y: this.camera.y
                    })
                }

                clearEnemies () {
                    for (const entity of this.world.entities) {
                        if (entity.hasTag('enemy')) {
                            this.world.removeChild(entity.$id)
                        }
                    }
                }
            }
        })

    })


    section('Spawn', () => {

        text(`
            The spawn method is a shorthand for \`this.world.create(Entity, options)\`.
            Returns the created entity, or undefined if no world is available.
        `)

        action('Spawn entities', () => {
            const controller = new GameController({$id: 'battle'})

            logger.log('spawn without world:', controller.spawn(Entity))
        })

    })


    section('Resources', () => {

        text(`
            GameController declares three static resources: \`world\`, \`renderer\`, and \`camera\`.
            These are automatically resolved from the game when the controller is installed
            on an [[ActionDispatcher@core]].
        `)

        code('Available resources', () => {
            // this.game      - The game instance (alias for this.engine)
            // this.world     - The game's World
            // this.renderer  - The game's renderer
            // this.camera    - The game's camera
        })

    })


    section('API', () => {

        code('Static properties', () => {
            // GameController.resources = ['world', 'renderer', 'camera']
        })

        code('Properties', () => {
            // controller.game - The game instance (alias for engine)
        })

        code('Methods', () => {
            // spawn(EntityClass, options) - Create entity in the world
        })

    })

})
