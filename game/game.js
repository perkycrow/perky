import Application from '../application/application'
import GameLoop from './game_loop'


export default class Game extends Application {

    constructor (params = {}) {
        super(params)

        this.registerModule('gameLoop', new GameLoop({
            fps: params.fps || 60,
            maxFrameSkip: params.maxFrameSkip || 5
        }))

        this.#initEvents()
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


    get displayMode () {
        return this.perkyView.displayMode
    }


    setDisplayMode (mode) {
        this.perkyView.setDisplayMode(mode)
        return this
    }


    enterViewportMode () {
        this.perkyView.enterViewportMode()
        return this
    }


    enterFullscreenMode () {
        this.perkyView.enterFullscreenMode()
        return this
    }

    exitFullscreenMode () {
        this.perkyView.exitFullscreenMode()
        return this
    }


    toggleFullscreen () {
        const mode = this.displayMode
        if (mode === 'fullscreen') {
            this.exitFullscreenMode()
        } else {
            this.enterFullscreenMode()
        }
        return this
    }


    toggleViewport () {
        const mode = this.displayMode
        if (mode === 'viewport') {
            this.exitFullscreenMode()
        } else {
            this.enterViewportMode()
        }
        return this
    }


    #initEvents () {
        const {gameLoop} = this

        gameLoop.on('update', this.emitter('update'))

        gameLoop.on('render', this.emitter('render'))

        gameLoop.on('pause', this.emitter('pause'))

        gameLoop.on('resume', this.emitter('resume'))

        gameLoop.on('changed:fps', this.emitter('changed:fps'))

        this.perkyView.on('displayMode:changed', this.emitter('displayMode:changed'))
    }

}
