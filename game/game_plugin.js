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


    plugin.registerModule('gameLoop', gameLoop)


    plugin.addProperty('paused', {
        get () {
            return plugin.gameLoop.paused
        }
    })


    plugin.addMethod('pause', function (...args) {
        if (!plugin.running) {
            return false
        }

        return plugin.gameLoop.pause(...args)
    })


    plugin.addMethod('resume', function (...args) {
        if (!plugin.initialized || !plugin.started || !plugin.gameLoop.paused) {
            return false
        }

        return plugin.gameLoop.resume(...args)
    })


    plugin.addMethod('setFps', function (fps) {
        return plugin.gameLoop.setFps(fps)
    })


    plugin.addMethod('getFps', function () {
        return plugin.gameLoop.getFps()
    })


    plugin.addMethod('getCurrentFps', function () {
        return plugin.gameLoop.getCurrentFps()
    })


    plugin.bindEvents({
        'module:set': (moduleName, module) => {
            if (moduleName === 'gameLoop') {
                initGameLoopEvents(engine, module)
            }
        }
    })
}


function initGameLoopEvents (engine, gameLoop) {
    gameLoop.on('update', engine.emitter('update'))
    gameLoop.on('render', engine.emitter('render'))
    gameLoop.on('pause', engine.emitter('pause'))
    gameLoop.on('resume', engine.emitter('resume'))
    gameLoop.on('changed:fps', engine.emitter('changed:fps'))
} 