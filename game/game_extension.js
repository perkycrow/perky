import PerkyModule from '../core/perky_module'
import GameLoop from './game_loop'


export default class GameExtension extends PerkyModule {

    constructor (params = {}) {
        super({
            name: 'game',
            ...params
        })

        this.use(GameLoop, {
            $bind: 'gameLoop',
            fps: params.fps || 60,
            maxFrameSkip: params.maxFrameSkip || 5
        })
    }

    configure (params) {
        this.use(GameLoop, {
            $bind: 'gameLoop',
            fps: params.fps || 60,
            maxFrameSkip: params.maxFrameSkip || 5
        })
    }


    onInstall (host) {
        host.delegate(this, [
            'paused',
            'pause',
            'resume',
            'setFps',
            'getFps',
            'getCurrentFps'
        ])

        initGameLoopEvents(host, this.gameLoop)
    }

}


function initGameLoopEvents (host, gameLoop) {
    gameLoop.pipeTo(host, [
        'update',
        'render',
        'pause',
        'resume',
        'changed:fps'
    ])
}
