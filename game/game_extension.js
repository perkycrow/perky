import Extension from '../core/extension'
import GameLoop from './game_loop'


export default class GameExtension extends Extension {

    constructor (options = {}) {
        super({
            name: 'game',
            ...options
        })
    }


    onInstall (host, options) {
        const gameLoop = new GameLoop({
            fps: options.fps || 60,
            maxFrameSkip: options.maxFrameSkip || 5
        })

        this.use(GameLoop, {
            instance: gameLoop,
            $name: 'gameLoop',
            $category: 'module',
            $bind: 'gameLoop'
        })

        this.delegateProperties(gameLoop, ['paused'], true)
        this.delegateTo(gameLoop, ['pause', 'resume', 'setFps', 'getFps', 'getCurrentFps'])

        initGameLoopEvents(host, gameLoop)
    }

}


function initGameLoopEvents (host, gameLoop) {
    gameLoop.on('update', host.emitter('update'))
    gameLoop.on('render', host.emitter('render'))
    gameLoop.on('pause', host.emitter('pause'))
    gameLoop.on('resume', host.emitter('resume'))
    gameLoop.on('changed:fps', host.emitter('changed:fps'))
}

