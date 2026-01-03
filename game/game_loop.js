import PerkyModule from '../core/perky_module.js'


export default class GameLoop extends PerkyModule {

    static $category = 'gameLoop'

    #paused = false

    constructor (params = {}) {
        super(params)

        this.lastTime = 0
        this.accumulator = 0
        this.maxFrameSkip = params.maxFrameSkip || 5
        this.frameCount = 0
        this.lastFpsUpdate = 0

        this.setFps(params.fps || 60)
    }


    onInstall (host) {
        this.delegateTo(host, [
            'paused',
            'pause',
            'resume',
            'setFps',
            'getFps',
            'getCurrentFps'
        ])

        this.delegateEventsTo(host, [
            'update',
            'render',
            'pause',
            'resume',
            'changed:fps'
        ])
    }


    get paused () {
        return this.#paused
    }


    set paused (value) {
        this.#paused = value
    }


    get running () {
        return super.running && !this.#paused
    }


    onStart () {
        this.#paused = false
        this.lastTime = performance.now()
        this.accumulator = 0
        this.frameCount = 0
        this.lastFpsUpdate = this.lastTime

        requestAnimationFrame(time => update(this, time))
    }


    pause (...args) {
        if (!this.started || this.#paused) {
            return false
        }

        this.#paused = true
        this.emit('pause', ...args)

        return true
    }


    resume (...args) {
        if (!this.started || !this.#paused) {
            return false
        }

        this.#paused = false
        this.lastTime = performance.now()
        this.emit('resume', ...args)

        requestAnimationFrame(time => update(this, time))

        return true
    }


    getFps () {
        return this.fps
    }


    setFps (fps) {
        this.fps = fps
        this.frameInterval = 1000 / fps
        this.emit('changed:fps', fps)
    }


    getCurrentFps () {
        return this.currentFps || 0
    }

}


function update (gameLoop, currentTime) {
    if (!gameLoop.started || gameLoop.paused) {
        return false
    }

    const {frameInterval, maxFrameSkip} = gameLoop

    const deltaTime = currentTime - gameLoop.lastTime
    gameLoop.lastTime = currentTime

    gameLoop.frameCount++
    if (currentTime - gameLoop.lastFpsUpdate >= 1000) {
        gameLoop.currentFps = gameLoop.frameCount
        gameLoop.frameCount = 0
        gameLoop.lastFpsUpdate = currentTime
    }

    gameLoop.accumulator += Math.min(deltaTime, frameInterval * maxFrameSkip)

    while (gameLoop.accumulator >= frameInterval) {
        gameLoop.emit('update', frameInterval / 1000)
        gameLoop.accumulator -= frameInterval
    }

    const frameProgress = gameLoop.accumulator / frameInterval
    gameLoop.emit('render', frameProgress, gameLoop.currentFps)

    requestAnimationFrame(time => update(gameLoop, time))

    return true
}
