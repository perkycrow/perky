import Application from '../application/application.js'
import GameLoop from './game_loop.js'
import RenderSystem from '../render/render_system.js'
import TextureSystem from '../render/textures/texture_system.js'
import World from './world.js'
import GameRenderer from './game_renderer.js'


export default class Game extends Application {

    static World = World
    static Renderer = GameRenderer

    constructor (params = {}) {
        super(params)

        this.create(GameLoop, {$bind: 'gameLoop'})
        this.create(RenderSystem, {
            $bind: 'renderSystem',
            ...params.renderSystem
        })
        this.create(TextureSystem, {
            $bind: 'textureSystem',
            fallback: (id) => this.getSource(id),
            ...params.textureSystem
        })

        this.on('update', this.#updateActiveControllers)
        this.on('update', (...args) => this.update(...args))

        this.#createWorld()
        this.#createRenderer()

        this.configureGame?.(params)
    }


    #createWorld () {
        const WorldClass = this.constructor.World
        if (WorldClass) {
            this.world = this.create(WorldClass)
        }
    }


    #createRenderer () {
        this.camera = this.renderSystem.getCamera('main')

        const RendererClass = this.constructor.Renderer
        if (RendererClass) {
            this.renderer = this.create(RendererClass, {
                $id: 'renderer',
                world: this.world,
                game: this
            })
        }

        this.on('render', (...args) => {
            this.render(...args)
        })
    }


    update () {
        // Override in subclass for custom update logic
    }


    render () {
        this.renderer?.render()
    }


    #updateActiveControllers (deltaTime) {
        const activeControllers = this.getActiveControllers()

        for (const controllerName of activeControllers) {
            const controller = this.getController(controllerName)

            if (controller && typeof controller.update === 'function') {
                controller.update(this, deltaTime)
            }
        }
    }

}
