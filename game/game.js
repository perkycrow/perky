import Application from '../application/application.js'
import GameLoop from './game_loop.js'
import RenderSystem from '../render/render_system.js'
import TextureSystem from '../render/textures/texture_system.js'


export default class Game extends Application {

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

        this.configureGame?.(params)
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
