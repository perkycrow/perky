import {doc, section, text, code, container, action, logger} from '../doc/runtime.js'
import PerkyModule from '../core/perky_module.js'
import WorldView from './world_view.js'
import World from './world.js'
import Entity from './entity.js'
import EntityView from './entity_view.js'
import Circle from '../render/circle.js'
import Sprite from '../render/sprite.js'
import Rectangle from '../render/rectangle.js'
import Group2D from '../render/group_2d.js'
import CanvasRenderer from '../render/canvas_renderer.js'
import WebGLRenderer from '../render/webgl_renderer.js'


export default doc('WorldView', () => {

    text(`
        Bridges the game world (entities) with the rendering system (Object2D).
        Automatically creates views when entities are added and disposes them when removed.

        WorldView supports two registration modes:
        - **Custom View**: Full control with an [[EntityView@game]] subclass
        - **Auto View**: Direct Object2D class with optional sync bindings
    `)


    section('Basic Setup', () => {

        text(`
            WorldView connects a [[World@game]] to a renderer by creating visual representations
            for each entity based on registered mappings.
        `)

        container({title: 'Simple entity rendering', height: 200}, ctx => {
            const app = new PerkyModule()
            const renderer = app.create(CanvasRenderer, {
                container: ctx.container,
                autoFit: true,
                backgroundColor: '#1a1a2e'
            })
            const world = app.create(World)
            const worldView = app.create(WorldView, {world})

            class Ball extends Entity {}

            worldView.register(Ball, Circle, {
                radius: 0.8,
                color: '#e94560'
            })

            app.start()

            const scene = new Group2D()
            scene.add(worldView.rootGroup)

            world.create(Ball, {x: -3, y: 0})
            world.create(Ball, {x: 0, y: 0})
            world.create(Ball, {x: 3, y: 0})

            renderer.render(scene)
            ctx.setApp(renderer, scene)
        })

    })


    section('Auto View (Object2D)', () => {

        text(`
            Register an Object2D class directly instead of creating a custom EntityView.
            WorldView automatically syncs x/y from the entity to the render object.
        `)

        container({title: 'Moving entities', height: 200}, ctx => {
            const app = new PerkyModule()
            const renderer = app.create(CanvasRenderer, {
                container: ctx.container,
                autoFit: true,
                backgroundColor: '#16213e'
            })
            const world = app.create(World)
            const worldView = app.create(WorldView, {world})

            class Particle extends Entity {}

            worldView.register(Particle, Circle, {
                radius: 0.5,
                color: '#4a9eff'
            })

            app.start()

            const scene = new Group2D()
            scene.add(worldView.rootGroup)

            const particles = []
            for (let i = 0; i < 5; i++) {
                const entity = world.create(Particle, {
                    x: (i - 2) * 2,
                    y: 0
                })
                particles.push(entity)
            }

            renderer.render(scene)

            ctx.slider('Wave', {min: 0, max: 100, default: 0}, value => {
                const t = value / 100 * Math.PI * 2
                particles.forEach((p, i) => {
                    p.y = Math.sin(t + i * 0.5) * 2
                })
                worldView.sync()
                renderer.render(scene)
            })

            ctx.setApp(renderer, scene)
        })

    })


    section('Sync Bindings', () => {

        text(`
            Use the \`sync\` option to bind entity properties to render object properties.
            Bindings can be strings (property names) or functions (transformations).
        `)

        container({title: 'Health bar with sync', height: 200}, ctx => {
            const app = new PerkyModule()
            const renderer = app.create(CanvasRenderer, {
                container: ctx.container,
                autoFit: true,
                backgroundColor: '#1a1a2e'
            })
            const world = app.create(World)
            const worldView = app.create(WorldView, {world})

            class HealthOrb extends Entity {
                constructor (options) {
                    super(options)
                    this.health = options.health ?? 1
                }
            }

            worldView.register(HealthOrb, Circle, {
                radius: 1,
                color: '#4aff4a',
                sync: {
                    scaleX: 'health',
                    scaleY: 'health',
                    opacity: 'health'
                }
            })

            app.start()

            const scene = new Group2D()
            scene.add(worldView.rootGroup)

            const orb = world.create(HealthOrb, {x: 0, y: 0, health: 1})

            renderer.render(scene)

            ctx.slider('Health', {min: 0, max: 100, default: 100}, value => {
                orb.health = value / 100
                worldView.sync()
                renderer.render(scene)
            })

            ctx.setApp(renderer, scene)
        })

        container({title: 'Function bindings', height: 200}, ctx => {
            const app = new PerkyModule()
            const renderer = app.create(CanvasRenderer, {
                container: ctx.container,
                autoFit: true,
                backgroundColor: '#16213e'
            })
            const world = app.create(World)
            const worldView = app.create(WorldView, {world})

            class Spinner extends Entity {
                constructor (options) {
                    super(options)
                    this.angle = options.angle ?? 0
                    this.speed = options.speed ?? 1
                }
            }

            worldView.register(Spinner, Rectangle, {
                width: 2,
                height: 0.5,
                color: '#ff4a4a',
                sync: {
                    rotation: (entity) => entity.angle
                }
            })

            app.start()

            const scene = new Group2D()
            scene.add(worldView.rootGroup)

            const spinners = []
            for (let i = 0; i < 3; i++) {
                const entity = world.create(Spinner, {
                    x: (i - 1) * 3,
                    y: 0,
                    speed: 1 + i * 0.5
                })
                spinners.push(entity)
            }

            renderer.render(scene)

            ctx.slider('Rotation', {min: 0, max: 100, default: 0}, value => {
                const t = value / 100 * Math.PI * 4
                spinners.forEach((s, i) => {
                    s.angle = t * s.speed
                })
                worldView.sync()
                renderer.render(scene)
            })

            ctx.setApp(renderer, scene)
        })

    })


    section('Custom EntityView', () => {

        text(`
            For complex visuals, create a custom [[EntityView]] subclass.
            This gives full control over the render graph and sync logic.
        `)

        container({title: 'Custom view with multiple shapes', height: 200}, ctx => {
            const app = new PerkyModule()
            const renderer = app.create(CanvasRenderer, {
                container: ctx.container,
                autoFit: true,
                backgroundColor: '#1a1a2e'
            })
            const world = app.create(World)
            const worldView = app.create(WorldView, {world})

            class Robot extends Entity {
                constructor (options) {
                    super(options)
                    this.mood = options.mood ?? 0
                }
            }

            class RobotView extends EntityView {
                constructor (entity, context) {
                    super(entity, context)

                    this.root = new Group2D()

                    this.body = new Rectangle({
                        width: 1.5,
                        height: 2,
                        color: '#533483',
                        y: 0
                    })

                    this.head = new Circle({
                        radius: 0.6,
                        color: '#e94560',
                        y: 1.5
                    })

                    this.leftEye = new Circle({
                        radius: 0.15,
                        color: '#ffffff',
                        x: -0.2,
                        y: 1.6
                    })

                    this.rightEye = new Circle({
                        radius: 0.15,
                        color: '#ffffff',
                        x: 0.2,
                        y: 1.6
                    })

                    this.root.add(this.body, this.head, this.leftEye, this.rightEye)
                }

                sync () {
                    super.sync()
                    const bounce = Math.sin(this.entity.mood * Math.PI * 2) * 0.2
                    this.head.y = 1.5 + bounce
                    this.leftEye.y = 1.6 + bounce
                    this.rightEye.y = 1.6 + bounce
                }
            }

            worldView.register(Robot, RobotView)

            app.start()

            const scene = new Group2D()
            scene.add(worldView.rootGroup)

            const robot = world.create(Robot, {x: 0, y: -0.5, mood: 0})

            renderer.render(scene)

            ctx.slider('Mood', {min: 0, max: 100, default: 0}, value => {
                robot.mood = value / 100
                worldView.sync()
                renderer.render(scene)
            })

            ctx.setApp(renderer, scene)
        })

    })


    section('Matcher Functions', () => {

        text(`
            Instead of matching by class, use a function to match entities by any criteria.
        `)

        container({title: 'Tag-based matching', height: 200}, ctx => {
            const app = new PerkyModule()
            const renderer = app.create(CanvasRenderer, {
                container: ctx.container,
                autoFit: true,
                backgroundColor: '#16213e'
            })
            const world = app.create(World)
            const worldView = app.create(WorldView, {world})

            worldView.register(
                entity => entity.hasTag('friendly'),
                Circle,
                {radius: 0.6, color: '#4aff4a'}
            )
            worldView.register(
                entity => entity.hasTag('hostile'),
                Circle,
                {radius: 0.6, color: '#ff4a4a'}
            )

            app.start()

            const scene = new Group2D()
            scene.add(worldView.rootGroup)

            world.create(Entity, {x: -4, y: 0, $tags: ['friendly']})
            world.create(Entity, {x: -2, y: 0, $tags: ['friendly']})
            world.create(Entity, {x: 0, y: 0, $tags: ['hostile']})
            world.create(Entity, {x: 2, y: 0, $tags: ['hostile']})
            world.create(Entity, {x: 4, y: 0, $tags: ['hostile']})

            renderer.render(scene)
            ctx.setApp(renderer, scene)
        })

    })


    section('Dynamic Entities', () => {

        text(`
            Views are automatically created when entities spawn and disposed when they're removed.
        `)

        container({title: 'Spawn and despawn', height: 200}, ctx => {
            const app = new PerkyModule()
            const renderer = app.create(CanvasRenderer, {
                container: ctx.container,
                autoFit: true,
                backgroundColor: '#1a1a2e'
            })
            const world = app.create(World)
            const worldView = app.create(WorldView, {world})

            class Bullet extends Entity {}

            worldView.register(Bullet, Circle, {
                radius: 0.3,
                color: '#ffff4a'
            })

            app.start()

            const scene = new Group2D()
            scene.add(worldView.rootGroup)

            renderer.render(scene)

            const updateInfo = ctx.info(() => {
                return `Entities: ${world.entities.length}`
            })

            ctx.action('Spawn', () => {
                const x = (Math.random() - 0.5) * 10
                const y = (Math.random() - 0.5) * 4
                world.create(Bullet, {x, y})
                renderer.render(scene)
                updateInfo()
            })

            ctx.action('Remove Last', () => {
                const entities = world.entities
                if (entities.length > 0) {
                    world.removeChild(entities[entities.length - 1].$id)
                    renderer.render(scene)
                    updateInfo()
                }
            })

            ctx.action('Clear All', () => {
                const ids = world.entities.map(e => e.$id)
                ids.forEach(id => world.removeChild(id))
                renderer.render(scene)
                updateInfo()
            })

            ctx.setApp(renderer, scene)
        })

    })


    section('API', () => {

        code('register', () => {
            const app = new PerkyModule()
            const world = app.create(World)
            const worldView = app.create(WorldView, {world})

            // Custom EntityView
            worldView.register(Player, PlayerView)

            // Object2D with config
            worldView.register(Bullet, Circle, {radius: 0.2, color: '#fff'})

            // Object2D with sync bindings
            worldView.register(Enemy, Rectangle, {
                width: 1,
                height: 1,
                sync: {
                    opacity: 'health',
                    scaleX: (entity) => entity.size
                }
            })

            // Matcher function
            worldView.register(
                entity => entity.hasTag('visible'),
                Circle,
                {radius: 0.5}
            )
        })

        code('Lifecycle', () => {
            const app = new PerkyModule()
            const world = app.create(World)
            const worldView = app.create(WorldView, {world})

            // Register views before start
            worldView.register(Enemy, EnemyView)

            // app.start() triggers worldView.onStart()
            app.start()

            // In game loop
            worldView.sync()

            // app.stop() triggers worldView.onStop()
            app.stop()
        })

    })

})
