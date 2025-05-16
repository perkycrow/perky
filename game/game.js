import Application from '../application/application'
import GameLoop from './game_loop'


export default class Game extends Application {

    constructor (params = {}) {
        super(params)

        this.registerModule('gameLoop', new GameLoop({
            fps: params.fps || 60,
            maxFrameSkip: params.maxFrameSkip || 5
        }))

        initEvents(this)
    }


    get paused () {
        return this.gameLoop.paused
    }


    pause (...args) {
        if (!this.running) {
            return false
        }

        return this.gameLoop.pause(...args)
    }

    resume (...args) {
        if (!this.initialized || !this.started || !this.gameLoop.paused) {
            return false
        }

        return this.gameLoop.resume(...args)
    }


    setFps (fps) {
        return this.gameLoop.setFps(fps)
    }


    getFps () {
        return this.gameLoop.getFps()
    }


    getCurrentFps () {
        return this.gameLoop.getCurrentFps()
    }

}



function initEvents (game) {
    const {gameLoop} = game
    
    gameLoop.on('update', game.emitter('update'))

    gameLoop.on('render', game.emitter('render'))

    gameLoop.on('pause', game.emitter('pause'))

    gameLoop.on('resume', game.emitter('resume'))

    gameLoop.on('changed:fps', game.emitter('changed:fps'))
}
