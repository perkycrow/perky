import Application from '../application/application'
import GameLoop from '../game/game_loop'
import Canvas2D from '../canvas/canvas_2d'
import GameController from './controllers/game_controller'

import manifest from './manifest'


export default class DefendTheDen extends Application {

    constructor (params = {}) {
        super({manifest, ...params})
    }

    configure () {
        this.create(GameLoop, {$bind: 'gameLoop'})

        this.canvas = new Canvas2D({
            container: this.element,
            autoFit: true
        })

        this.registerController('game', GameController)
        this.setActiveControllers(['game'])

        this.bindKey('KeyW', 'moveUp')
        this.bindKey('ArrowUp', 'moveUp')
        this.bindKey('KeyS', 'moveDown')
        this.bindKey('ArrowDown', 'moveDown')
        this.bindKey('Space', 'shoot')

        const player = {name: 'Player 1'}
        this.setContextFor('game', {player, y: 0})
    }

}
