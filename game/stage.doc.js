import {doc, section, text, code, action, logger} from '../doc/runtime.js'
import Stage from './stage.js'
import World from './world.js'
import Entity from './entity.js'
import EntityView from './entity_view.js'
import Circle from '../render/circle.js'


export default doc('Stage', () => {

    text(`
        A stage represents a distinct phase of your game — a level, a menu, a cutscene.
        Subclass Stage to define a World, register entity-view mappings, and override
        update/render for stage-specific logic.
    `)


    section('Basic Usage', () => {

        text(`
            Extend Stage and set a static \`World\` class. The stage automatically
            creates the world on construction.
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
        })

    })


    section('View Registration', () => {

        text(`
            Stage manages the mapping between entities and their visual representations.
            Use \`register()\` to associate entity classes with view classes.
        `)

        action('Register entity views', () => {
            class Player extends Entity {}
            class PlayerView extends EntityView {
                constructor (entity, context) {
                    super(entity, context)
                    this.root = new Circle({radius: 1, color: '#4a9eff'})
                }
            }

            class GameStage extends Stage {
                static World = World

                onStart () {
                    super.onStart()
                    this.register(Player, PlayerView)
                }
            }

            const stage = new GameStage({game: {}})
            stage.start()
            stage.world.create(Player, {$id: 'player'})

            const views = stage.getViews('player')
            logger.log('views created:', views.length)
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
                    this.updateViews(deltaTime)
                }

                render () {
                    this.syncViews()
                }
            }
        })

    })


    section('API', () => {

        code('Static properties', () => {
            // Stage.World - World class to instantiate (default: null)
            // Stage.$category - 'stage'
        })

        code('Properties', () => {
            // stage.game - Reference to the game instance
            // stage.world - The World instance (if World class is set)
            // stage.viewsGroup - Group2D containing all entity views
        })

        code('Methods', () => {
            // register(classOrMatcher, View, config) - Register entity-view mapping
            // unregister(classOrMatcher) - Remove a registration
            // clearRegistry() - Remove all registrations
            // getViews(entityId) - Get views for an entity
            // updateViews(deltaTime) - Call update() on all views
            // syncViews() - Call sync() on all views
            // update(deltaTime) - Override for stage update logic
            // render() - Override for stage render logic
        })

    })

})
