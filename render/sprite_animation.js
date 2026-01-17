import PerkyModule from '../core/perky_module.js'


export default class SpriteAnimation extends PerkyModule {

    #elapsed = 0
    #events = new Map()
    #pingpongDirection = 1

    constructor (options = {}) {
        super(options)

        const {sprite, frames, fps = 12, loop = true, speed = 1, playbackMode = 'forward'} = options

        this.sprite = sprite
        this.frames = Array.isArray(frames) ? frames : []
        this.fps = fps
        this.loop = loop
        this.speed = speed
        this.playbackMode = playbackMode

        this.currentIndex = 0
        this.playing = false
        this.completed = false
    }


    get frameDuration () {
        return 1 / this.fps
    }


    getFrameDuration (index) {
        const frame = this.frames[index]
        const baseDuration = this.frameDuration

        if (frame && typeof frame.duration === 'number') {
            return baseDuration * frame.duration
        }

        return baseDuration
    }


    get currentFrameDuration () {
        return this.getFrameDuration(this.currentIndex)
    }


    get totalFrames () {
        return this.frames.length
    }


    get currentFrame () {
        return this.frames[this.currentIndex] || null
    }


    get progress () {
        return this.totalFrames > 0 ? this.currentIndex / this.totalFrames : 0
    }


    play () {
        if (this.playing || this.totalFrames === 0) {
            return this
        }

        this.playing = true
        this.completed = false
        this.#elapsed = 0
        this.#updateSpriteFrame()
        this.emit('play')

        return this
    }


    pause () {
        if (!this.playing) {
            return this
        }

        this.playing = false
        this.emit('pause')

        return this
    }


    stop () {
        this.playing = false
        this.currentIndex = 0
        this.completed = false
        this.#elapsed = 0
        this.#updateSpriteFrame()
        this.emit('stop')

        return this
    }


    restart () {
        this.currentIndex = 0
        this.completed = false
        this.#elapsed = 0
        this.playing = true
        this.#updateSpriteFrame()
        this.emit('play')

        return this
    }


    setFrame (index) {
        if (index >= 0 && index < this.totalFrames) {
            this.currentIndex = index
            this.#updateSpriteFrame()
            this.emit('frameChanged', this.currentFrame, index)
        }
        return this
    }


    setFrameByName (frameName) {
        const index = this.frames.indexOf(frameName)
        if (index !== -1) {
            this.setFrame(index)
        }
        return this
    }


    nextFrame () {
        const nextIndex = (this.currentIndex + 1) % this.totalFrames
        this.setFrame(nextIndex)
        return this
    }


    previousFrame () {
        const prevIndex = this.currentIndex === 0 ? this.totalFrames - 1 : this.currentIndex - 1
        this.setFrame(prevIndex)
        return this
    }


    setFps (fps) {
        this.fps = fps
        this.emit('fpsChanged', fps)
        return this
    }


    setLoop (loop) {
        this.loop = loop
        return this
    }


    setSpeed (speed) {
        this.speed = speed
        return this
    }


    setPlaybackMode (mode) {
        this.playbackMode = mode
        if (mode === 'reverse') {
            this.#pingpongDirection = -1
        } else {
            this.#pingpongDirection = 1
        }
        return this
    }


    addEvent (frameIndex, eventName) {
        if (!this.#events.has(frameIndex)) {
            this.#events.set(frameIndex, [])
        }
        this.#events.get(frameIndex).push(eventName)
        return this
    }


    removeEvent (frameIndex, eventName) {
        if (!this.#events.has(frameIndex)) {
            return this
        }

        const events = this.#events.get(frameIndex)
        const index = events.indexOf(eventName)

        if (index !== -1) {
            events.splice(index, 1)
        }

        if (events.length === 0) {
            this.#events.delete(frameIndex)
        }

        return this
    }


    clearEvents () {
        this.#events.clear()
        return this
    }


    getEvents (frameIndex) {
        return this.#events.get(frameIndex) || []
    }


    seekToFrame (index) {
        if (index >= 0 && index < this.totalFrames) {
            this.currentIndex = index
            this.#elapsed = 0
            this.#updateSpriteFrame()
        }
        return this
    }


    seekToProgress (progress) {
        const clampedProgress = Math.max(0, Math.min(1, progress))
        const targetIndex = Math.floor(clampedProgress * this.totalFrames)
        return this.seekToFrame(Math.min(targetIndex, this.totalFrames - 1))
    }


    update (deltaTime) {
        if (!this.playing || this.completed) {
            return
        }

        this.#elapsed += deltaTime * this.speed

        while (this.#elapsed >= this.currentFrameDuration) {
            this.#elapsed -= this.currentFrameDuration
            this.#advanceFrame()

            if (this.completed) {
                break
            }
        }
    }


    #advanceFrame () {
        const previousIndex = this.currentIndex
        const nextIndex = this.#getNextFrameIndex()

        if (nextIndex === null) {
            this.playing = false
            this.completed = true
            this.emit('complete')
            return
        }

        this.currentIndex = nextIndex
        this.#emitFrameEvents(previousIndex, this.currentIndex)
        this.#updateSpriteFrame()
        this.emit('frameChanged', this.currentFrame, this.currentIndex)
    }


    #getNextFrameIndex () {
        const lastIndex = this.totalFrames - 1

        if (this.playbackMode === 'forward') {
            return this.#getNextForward(lastIndex)
        }

        if (this.playbackMode === 'reverse') {
            return this.#getNextReverse(lastIndex)
        }

        if (this.playbackMode === 'pingpong') {
            return this.#getNextPingpong(lastIndex)
        }

        return this.#getNextForward(lastIndex)
    }


    #getNextForward (lastIndex) {
        if (this.currentIndex < lastIndex) {
            return this.currentIndex + 1
        }

        if (this.loop) {
            this.emit('loop')
            return 0
        }

        return null
    }


    #getNextReverse (lastIndex) {
        if (this.currentIndex > 0) {
            return this.currentIndex - 1
        }

        if (this.loop) {
            this.emit('loop')
            return lastIndex
        }

        return null
    }


    #getNextPingpong (lastIndex) {
        const nextIndex = this.currentIndex + this.#pingpongDirection

        if (nextIndex >= 0 && nextIndex <= lastIndex) {
            return nextIndex
        }

        this.#pingpongDirection *= -1
        this.emit('bounce', this.#pingpongDirection)

        if (!this.loop && this.currentIndex === 0) {
            return null
        }

        return this.currentIndex + this.#pingpongDirection
    }


    #emitFrameEvents (previousIndex, currentIndex) {
        const events = this.#events.get(currentIndex)

        if (events) {
            for (const eventName of events) {
                this.emit('event', eventName, currentIndex)
                this.emit(`event:${eventName}`, currentIndex)
            }
        }
    }


    #updateSpriteFrame () {
        if (!this.sprite || !this.currentFrame) {
            return
        }

        if (this.currentFrame.region) {
            this.sprite.region = this.currentFrame.region
        } else {
            this.sprite.region = this.currentFrame
        }
    }


    onDispose () {
        this.playing = false
        this.sprite = null
        this.frames = []
        this.#events.clear()
    }

}
