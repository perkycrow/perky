import {doc, section, text, code, action, logger} from '../doc/runtime.js'
import AutoView from './auto_view.js'
import Entity from './entity.js'
import Circle from '../render/circle.js'
import Rectangle from '../render/rectangle.js'


export default doc('AutoView', () => {

    text(`
        Used internally by [[WorldView@game]] when you register an Object2D class
        directly instead of a custom [[EntityView@game]].
        Creates the render object and syncs properties based on a config.
    `)


    section('How It Works', () => {

        text(`
            When you register an entity class with an Object2D class in WorldView,
            AutoView is used behind the scenes. It creates the render object and
            applies sync bindings each frame.
        `)

        code('WorldView registration', () => {
            // worldView.register(Player, Sprite, {
            //     texture: 'hero',
            //     sync: {
            //         rotation: 'angle',
            //         opacity: (entity) => entity.health / 100
            //     }
            // })
        })

    })


    section('Sync Bindings', () => {

        text(`
            AutoView supports two types of sync bindings:
            - **String binding**: Maps an entity property name to a render object property
            - **Function binding**: Computes a value from the entity each frame
        `)

        action('String bindings', () => {
            class Spinner extends Entity {
                constructor (options = {}) {
                    super(options)
                    this.angle = 0
                }
            }

            const entity = new Spinner({x: 0, y: 0})
            entity.angle = 1.5

            const view = new AutoView(entity, {
                ObjectClass: Rectangle,
                config: {
                    width: 2,
                    height: 0.5,
                    sync: {rotation: 'angle'}
                }
            })

            view.sync()

            logger.log('rotation:', view.root.rotation)
        })

        action('Function bindings', () => {
            class HealthOrb extends Entity {
                constructor (options = {}) {
                    super(options)
                    this.health = options.health ?? 100
                    this.maxHealth = 100
                }
            }

            const entity = new HealthOrb({x: 0, y: 0, health: 50})

            const view = new AutoView(entity, {
                ObjectClass: Circle,
                config: {
                    radius: 1,
                    sync: {opacity: (e) => e.health / e.maxHealth}
                }
            })

            view.sync()

            logger.log('opacity:', view.root.opacity)
        })

    })


    section('API', () => {

        code('Constructor', () => {
            // entity: The Entity instance
            // context: {
            //   ObjectClass: Object2D subclass to instantiate
            //   config: {
            //     ...objectOptions,  // passed to ObjectClass constructor
            //     sync: {            // optional property bindings
            //       prop: 'entityProp',        // string binding
            //       prop: (entity) => value     // function binding
            //     }
            //   }
            // }
        })

        code('Methods', () => {
            // sync() - Syncs x/y plus all configured bindings
        })

    })

})
