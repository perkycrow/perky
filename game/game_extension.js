import PerkyModule from '../core/perky_module'
import GameLoop from './game_loop'


export default class GameExtension extends PerkyModule {

    constructor (options = {}) {
        super({
            name: 'game',
            ...options
        })
    }


    onInstall (host, options) {
        this.use(GameLoop, {
            $bind: 'gameLoop',
            fps: options.fps || 60,
            maxFrameSkip: options.maxFrameSkip || 5
        })

        this.delegateProperties(this.gameLoop, ['paused'], true)
        this.delegateTo(this.gameLoop, ['pause', 'resume', 'setFps', 'getFps', 'getCurrentFps'])

        initGameLoopEvents(host, this.gameLoop)
    }

}


function initGameLoopEvents (host, gameLoop) {
    gameLoop.pipeTo(host, ['update', 'render', 'pause', 'resume', 'changed:fps'])
}

