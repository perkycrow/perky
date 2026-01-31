import {doc, section, text, code, action, logger} from '../doc/runtime.js'
import Stage from './stage.js'
import World from './world.js'
import WorldView from './world_view.js'
import Entity from './entity.js'
import PerkyModule from '../core/perky_module.js'


export default doc('Stage', () => {

    text(`
        A stage represents a distinct phase of your game — a level, a menu, a cutscene.
        Subclass Stage to define a World and WorldView pair, and override update/render
        for stage-specific logic.
    `)


    section('Basic Usage', () => {

        text(`
            Extend Stage and set a static \`World\` class. The stage automatically
            creates the world and its view on construction.
        `)

        code('Defining a stage', () => {
            class BattleStage extends Stage {
                static World = World

                update (deltaTime) {
                    // Stage-specific update logic
                }

                render () {
                    // Stage-specific render logic
                }
            }
        })

        action('Stage with world', () => {
            class LevelStage extends Stage {
                static World = World
            }

            const stage = new LevelStage({game: {}})

            logger.log('has world:', stage.world !== undefined)
            logger.log('has worldView:', stage.worldView !== undefined)
        })

    })


    section('World and WorldView', () => {

        text(`
            Stage creates a [[World@game]] and [[WorldView@game]] from the static class properties.
            If \`World\` is null (default), no world or view is created.
            If \`WorldView\` is null, a world is created without a view.
        `)

        action('No world by default', () => {
            const stage = new Stage({game: {}})

            logger.log('world:', stage.world)
            logger.log('worldView:', stage.worldView)
        })

        action('Custom WorldView', () => {
            class MyWorldView extends WorldView {
                onStart () {
                    super.onStart()
                    logger.log('Custom world view started')
                }
            }

            class MyStage extends Stage {
                static World = World
                static WorldView = MyWorldView
            }

            const app = new PerkyModule()
            const stage = app.create(MyStage, {game: {}})

            logger.log('worldView type:', stage.worldView.constructor.name)
        })

    })


    section('Subclassing', () => {

        text(`
            Override update and render for stage-specific behavior.
            Access the world through \`this.world\` and the game through \`this.game\`.
        `)

        code('Game stage example', () => {
            class GameplayStage extends Stage {
                static World = World

                update (deltaTime) {
                    this.world.update(deltaTime, {})
                }

                render () {
                    if (this.worldView) {
                        this.worldView.sync()
                    }
                }
            }
        })

    })


    section('API', () => {

        code('Static properties', () => {
            // Stage.World - World class to instantiate (default: null)
            // Stage.WorldView - WorldView class to instantiate (default: WorldView)
            // Stage.$category - 'stage'
        })

        code('Properties', () => {
            // stage.game - Reference to the game instance
            // stage.world - The World instance (if World class is set)
            // stage.worldView - The WorldView instance (if both World and WorldView are set)
        })

        code('Methods', () => {
            // update(deltaTime) - Override for stage update logic
            // render() - Override for stage render logic
        })

    })

})
