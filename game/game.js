import Application from '../application/application'
import GameLoop from './game_loop'
import RenderSystem from '../render/render_system'


export default class Game extends Application {

    constructor (params = {}) {
        super(params)

        this.create(RenderSystem, {$bind: 'renderSystem', ...params.renderSystem})
        this.create(GameLoop, {$bind: 'gameLoop'})
        this.on('update', this.#updateActiveControllers)

        this.configureGame(params)
    }


    configureGame () { } // eslint-disable-line class-methods-use-this


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
