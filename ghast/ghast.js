import Game from '../game/game.js'
import GhastWorld from './ghast_world.js'
import GameController from './controllers/game_controller.js'
import GameRenderer from './game_renderer.js'


export default class Ghast extends Game {

    static $name = 'ghast'

    constructor (params = {}) {
        const renderSystemConfig = {
            cameras: {
                main: {
                    unitsInView: {width: 8, height: 6}
                }
            },
            layers: [
                {
                    name: 'game',
                    type: 'webgl',
                    camera: 'main',
                    backgroundColor: '#444444'
                }
            ]
        }

        super({
            ...params,
            renderSystem: renderSystemConfig
        })
    }


    configureGame () {
        this.world = this.create(GhastWorld)

        this.registerController('game', GameController)
        this.setActiveControllers(['game'])

        const gameController = this.getController('game')
        gameController.world = this.world

        this.renderer = this.create(GameRenderer, {
            $id: 'renderer',
            world: this.world,
            game: this
        })

        gameController.renderer = this.renderer

        this.on('render', () => {
            this.renderer.render()
        })
    }


    onStart () {
        this.execute('spawnPlayer', {x: 0, y: 0})
    }

}
