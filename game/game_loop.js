import PerkyModule from '../core/perky_module.js'


export default class GameLoop extends PerkyModule {

    static $category = 'gameLoop'

    #paused = false
    #fpsLimited = false

    constructor (params = {}) {
        super(params)

        this.lastTime = 0
        this.accumulator = 0
        this.maxFrameSkip = params.maxFrameSkip || 5
        this.frameCount = 0
        this.screenFrameCount = 0
        this.lastFpsUpdate = 0

        this.fps = params.fps ?? 60
        this.frameInterval = 1000 / this.fps
        this.#fpsLimited = params.fpsLimited ?? false
    }


    onInstall (host) {
        this.delegateTo(host, [
            'paused',
            'pause',
            'resume',
            'setFps',
            'getFps',
            'getCurrentFps',
            'getScreenFps',
            'fpsLimited',
            'setFpsLimited'
        ])

        this.delegateEventsTo(host, [
            'update',
            'render',
            'pause',
            'resume',
            'changed:fps',
            'changed:fpsLimited'
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


    getScreenFps () {
        return this.screenFps || 0
    }


    get fpsLimited () {
        return this.#fpsLimited
    }


    setFpsLimited (value) {
        this.#fpsLimited = value
        this.emit('changed:fpsLimited', value)
    }

}


function update (gameLoop, currentTime) {
    if (!gameLoop.started || gameLoop.paused) {
        return false
    }

    const deltaTime = currentTime - gameLoop.lastTime
    gameLoop.lastTime = currentTime

    gameLoop.screenFrameCount++

    if (gameLoop.fpsLimited) {
        const {frameInterval, maxFrameSkip} = gameLoop

        gameLoop.accumulator += Math.min(deltaTime, frameInterval * maxFrameSkip)

        while (gameLoop.accumulator >= frameInterval) {
            gameLoop.emit('update', frameInterval / 1000)
            gameLoop.accumulator -= frameInterval
            gameLoop.frameCount++
        }

        const frameProgress = gameLoop.accumulator / frameInterval
        gameLoop.emit('render', frameProgress, gameLoop.currentFps, gameLoop.screenFps)
    } else {
        gameLoop.emit('update', deltaTime / 1000)
        gameLoop.emit('render', 1, gameLoop.currentFps, gameLoop.screenFps)
        gameLoop.frameCount++
    }

    if (currentTime - gameLoop.lastFpsUpdate >= 1000) {
        gameLoop.currentFps = gameLoop.frameCount
        gameLoop.screenFps = gameLoop.screenFrameCount
        gameLoop.frameCount = 0
        gameLoop.screenFrameCount = 0
        gameLoop.lastFpsUpdate = currentTime
    }

    requestAnimationFrame(time => update(gameLoop, time))

    return true
}
