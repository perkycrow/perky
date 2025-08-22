import PerkyModule from '../core/perky_module'


export default class SpriteAnimation extends PerkyModule {
    
    #animationId = null
    #lastFrameTime = 0
    
    constructor (sprite, frames, options = {}) {
        super()
        
        this.sprite = sprite
        this.frames = Array.isArray(frames) ? frames : []
        this.fps = options.fps || 12
        this.loop = options.loop !== false
        this.autoStart = options.autoStart || false

        // TODO: Remove this dependency on app
        this.app = options.app || null  // Needed to resolve texture names
        
        this.currentIndex = 0
        this.playing = false
        this.completed = false
        
        if (this.autoStart) {
            this.play()
        }
    }


    get frameInterval () {
        return 1000 / this.fps
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
        this.#lastFrameTime = performance.now()
        
        this.#animate()
        this.emit('play')
        
        return this
    }


    pause () {
        if (!this.playing) {
            return this
        }
        
        this.playing = false
        
        if (this.#animationId) {
            cancelAnimationFrame(this.#animationId)
            this.#animationId = null
        }
        
        this.emit('pause')
        return this
    }

    
    stop () {
        this.pause()
        this.currentIndex = 0
        this.completed = false
        this.#updateSpriteFrame()
        this.emit('stop')
        return this
    }

    
    restart () {
        this.stop()
        this.play()
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

    
    #animate () {
        if (!this.playing) {
            return
        }
        
        const now = performance.now()
        const elapsed = now - this.#lastFrameTime
        
        if (elapsed >= this.frameInterval) {
            this.#advanceFrame()
            this.#lastFrameTime = now
        }
        
        this.#animationId = requestAnimationFrame(() => this.#animate())
    }

    
    #advanceFrame () {
        const wasLastFrame = this.currentIndex === this.totalFrames - 1
        
        if (wasLastFrame) {
            if (this.loop) {
                this.currentIndex = 0
                this.emit('loop')
            } else {
                this.playing = false
                this.completed = true
                this.emit('complete')
                return
            }
        } else {
            this.currentIndex++
        }
        
        this.#updateSpriteFrame()
        this.emit('frameChanged', this.currentFrame, this.currentIndex)
    }

    
    #updateSpriteFrame () {
        if (!this.sprite || !this.currentFrame) {
            return
        }
        
        const texture = this.#resolveTexture(this.currentFrame)
        if (texture && this.sprite.material) {
            this.sprite.material.map = texture
            this.sprite.material.needsUpdate = true
        }
    }


    #resolveTexture (frame) {
        if (typeof frame === 'string' && this.app) {
            const texture = this.app.getSource('texture', frame)
            if (!texture) {
                console.warn(`SpriteAnimation: Texture '${frame}' not found`)
            }
            return texture
        }
        return frame
    }


    dispose () {
        this.pause()
        this.sprite = null
        this.frames = []
        super.dispose()
    }

}
