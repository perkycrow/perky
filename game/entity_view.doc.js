import {doc, section, text, code, action, logger} from '../doc/runtime.js'
import EntityView from './entity_view.js'
import Entity from './entity.js'
import Group2D from '../render/group_2d.js'
import Circle from '../render/circle.js'
import Rectangle from '../render/rectangle.js'


export default doc('EntityView', () => {

    text(`
        Base class for visual representations of entities.
        Subclass EntityView when you need custom rendering logic or complex visuals.
        For simple cases, use [[WorldView@game]] auto-registration with Object2D classes instead.
    `)


    section('Basic Structure', () => {

        text(`
            An EntityView connects an [[Entity@game]] to a render graph node.
            Override the constructor to build your visual hierarchy.
        `)

        code('Minimal view', () => {
            class BallView extends EntityView {
                constructor (entity, context) {
                    super(entity, context)
                    this.root = new Circle({
                        radius: 1,
                        color: '#e94560'
                    })
                }
            }
        })

        code('Complex view', () => {
            class PlayerView extends EntityView {
                constructor (entity, context) {
                    super(entity, context)

                    this.root = new Group2D()

                    this.body = new Rectangle({
                        width: 1,
                        height: 2,
                        color: '#533483'
                    })

                    this.head = new Circle({
                        radius: 0.4,
                        color: '#e94560',
                        y: 1.5
                    })

                    this.root.add(this.body, this.head)
                }
            }
        })

    })


    section('Sync', () => {

        text(`
            The sync method is called each frame to update the render object.
            By default it copies x/y from entity to root. Override for custom behavior.
        `)

        action('Default sync', () => {
            const entity = new Entity({x: 5, y: 3})
            const view = new EntityView(entity, {})
            view.root = new Circle({radius: 1})

            logger.log('before sync:')
            logger.log('  root.x:', view.root.x)
            logger.log('  root.y:', view.root.y)

            view.sync()

            logger.log('after sync:')
            logger.log('  root.x:', view.root.x)
            logger.log('  root.y:', view.root.y)
        })

        code('Custom sync', () => {
            class SpinnerView extends EntityView {
                constructor (entity, context) {
                    super(entity, context)
                    this.root = new Rectangle({
                        width: 2,
                        height: 0.5,
                        color: '#4a9eff'
                    })
                }

                sync () {
                    super.sync()
                    this.root.rotation = this.entity.angle
                    this.root.opacity = this.entity.health
                }
            }
        })

    })


    section('Dispose', () => {

        text(`
            Called when the entity is removed from the world.
            Removes the root from its parent group and cleans up references.
        `)

        action('Dispose behavior', () => {
            const entity = new Entity({x: 0, y: 0})
            const group = new Group2D()
            const view = new EntityView(entity, {group})
            view.root = new Circle({radius: 1})
            group.add(view.root)

            logger.log('before dispose:')
            logger.log('  group children:', group.children.length)
            logger.log('  view.root:', view.root !== null)

            view.dispose()

            logger.log('after dispose:')
            logger.log('  group children:', group.children.length)
            logger.log('  view.root:', view.root)
        })

    })


    section('API', () => {

        code('Constructor', () => {
            // entity: The Entity instance to visualize
            // context: Object containing { group, worldView }
            const view = new EntityView(entity, context)

            // Set this.root to your render object
            view.root = new Circle({radius: 1})
        })

        code('Properties', () => {
            // view.entity - The linked Entity
            // view.context - Context object from WorldView
            // view.root - The root Object2D node (you must set this)
        })

        code('Methods', () => {
            // sync() - Update render object from entity state
            // dispose() - Clean up when entity is removed
        })

    })

})
