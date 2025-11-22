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


    plugin.delegateProperties(gameLoop, ['paused'], true)


    plugin.delegateTo(gameLoop, ['pause', 'resume', 'setFps', 'getFps', 'getCurrentFps'])


    initGameLoopEvents(engine, gameLoop)
}


function initGameLoopEvents (engine, gameLoop) {
    gameLoop.on('update', engine.emitter('update'))
    gameLoop.on('render', engine.emitter('render'))
    gameLoop.on('pause', engine.emitter('pause'))
    gameLoop.on('resume', engine.emitter('resume'))
    gameLoop.on('changed:fps', engine.emitter('changed:fps'))
}
