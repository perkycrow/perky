import Plugin from '../core/plugin'
import GameLoop from './game_loop'


export default class GamePlugin extends Plugin {

    constructor (options = {}) {
        super({
            name: 'game',
            ...options
        })
    }


    onInstall (engine) {
        onInstall(this, engine)
    }

}


function onInstall (plugin, engine) {
    const gameLoop = new GameLoop({
        fps: plugin.options.fps || 60,
        maxFrameSkip: plugin.options.maxFrameSkip || 5
    })

    engine.registerModule('gameLoop', gameLoop)


    plugin.addProperty('paused', {
        get () {
            return this.gameLoop.paused
        }
    })


    plugin.addMethod('pause', function (...args) {
        if (!this.running) {
            return false
        }

        return this.gameLoop.pause(...args)
    })


    plugin.addMethod('resume', function (...args) {
        if (!this.initialized || !this.started || !this.gameLoop.paused) {
            return false
        }

        return this.gameLoop.resume(...args)
    })


    plugin.addMethod('setFps', function (fps) {
        return this.gameLoop.setFps(fps)
    })


    plugin.addMethod('getFps', function () {
        return this.gameLoop.getFps()
    })


    plugin.addMethod('getCurrentFps', function () {
        return this.gameLoop.getCurrentFps()
    })


    initGameLoopEvents(engine, gameLoop)
}


function initGameLoopEvents (engine, gameLoop) {
    gameLoop.on('update', engine.emitter('update'))
    gameLoop.on('render', engine.emitter('render'))
    gameLoop.on('pause', engine.emitter('pause'))
    gameLoop.on('resume', engine.emitter('resume'))
    gameLoop.on('changed:fps', engine.emitter('changed:fps'))
} 