import WebGLRenderer from '../../render/webgl_renderer.js'
import Camera from '../../render/camera.js'
import Group2D from '../../render/group_2d.js'
import Sprite from '../../render/sprite.js'


export default class AnimatorPreview {

    #canvas = null
    #renderer = null
    #camera = null
    #scene = null
    #backgroundSprite = null
    #animatorSprite = null
    #animation = null
    #anchor = {x: 0.5, y: 0}
    #size = {width: 1, height: 1}
    #unitsInView = {width: 7, height: 5}
    #isPlaying = false
    #lastTime = 0
    #animationFrameId = null
    #onFrame = null
    #onComplete = null
    #spriteX = 0
    #motion = null

    constructor ({canvas, unitsInView, onFrame, onComplete} = {}) {
        this.#canvas = canvas
        if (unitsInView) {
            this.#unitsInView = unitsInView
        }
        this.#onFrame = onFrame
        this.#onComplete = onComplete

        this.#setup()
    }


    #setup () {
        this.#camera = new Camera({
            viewportWidth: this.#canvas.width,
            viewportHeight: this.#canvas.height
        })
        this.#camera.setUnitsInView(this.#unitsInView)

        this.#renderer = new WebGLRenderer({
            canvas: this.#canvas,
            backgroundColor: 'transparent'
        })
        this.#renderer.camera = this.#camera

        this.#scene = new Group2D()

        this.#backgroundSprite = new Sprite({x: 0, y: 0})
        this.#scene.addChild(this.#backgroundSprite)

        this.#animatorSprite = new Sprite({x: 0, y: 0})
        this.#scene.addChild(this.#animatorSprite)
    }


    setUnitsInView (unitsInView) {
        this.#unitsInView = unitsInView
        this.#camera.setUnitsInView(unitsInView)
        this.#updateBackground()
    }


    setSize (size) {
        this.#size = size || {width: 1, height: 1}
        this.#updateAnimatorSprite()
    }


    setMotion (motion) {
        this.#motion = motion
    }


    setBackgroundRegion (region) {
        if (!region) {
            this.#backgroundSprite.visible = false
            return
        }

        this.#backgroundSprite.region = region
        this.#updateBackground()
        this.#backgroundSprite.visible = true
    }


    #updateBackground () {
        const region = this.#backgroundSprite.region
        if (!region) {
            return
        }

        const backgroundHeight = this.#unitsInView.height
        const backgroundWidth = (region.width / region.height) * backgroundHeight

        this.#backgroundSprite.width = backgroundWidth
        this.#backgroundSprite.height = backgroundHeight
    }


    setAnimation (animation) {
        this.#animation = animation
        this.#spriteX = 0
        this.#updateAnimatorSprite()
    }


    setAnchor (anchor) {
        this.#anchor = anchor || {x: 0.5, y: 0}
        this.#updateAnimatorSprite()
    }


    #updateAnimatorSprite () {
        if (!this.#animation) {
            this.#animatorSprite.visible = false
            return
        }

        const frame = this.#animation.currentFrame
        if (!frame?.region) {
            return
        }

        const region = frame.region
        const aspectRatio = region.width / region.height
        const spriteHeight = this.#size.height
        const spriteWidth = spriteHeight * aspectRatio

        this.#animatorSprite.region = region
        this.#animatorSprite.width = spriteWidth
        this.#animatorSprite.height = spriteHeight
        this.#animatorSprite.anchorX = this.#anchor.x
        this.#animatorSprite.anchorY = this.#anchor.y
        this.#animatorSprite.visible = true

        const groundY = -this.#unitsInView.height / 2
        this.#animatorSprite.x = this.#spriteX
        this.#animatorSprite.y = groundY
    }


    resize (width, height) {
        this.#canvas.width = width
        this.#canvas.height = height

        this.#renderer.displayWidth = width
        this.#renderer.displayHeight = height
        this.#renderer.applyPixelRatio()

        this.#camera.viewportWidth = width
        this.#camera.viewportHeight = height

        this.#updateAnimatorSprite()
    }


    play () {
        if (this.#isPlaying || !this.#animation) {
            return
        }

        this.#isPlaying = true
        this.#animation.play()
        this.#lastTime = performance.now()
        this.#animationFrameId = requestAnimationFrame((t) => this.#loop(t))
    }


    pause () {
        this.#isPlaying = false
        this.#animation?.pause()

        if (this.#animationFrameId) {
            cancelAnimationFrame(this.#animationFrameId)
            this.#animationFrameId = null
        }
    }


    stop () {
        this.pause()
        this.#animation?.stop()
        this.#spriteX = 0
        this.#updateAnimatorSprite()
        this.render()
        this.#onComplete?.()
    }


    #loop (currentTime) {
        if (!this.#isPlaying) {
            return
        }

        const deltaTime = (currentTime - this.#lastTime) / 1000
        this.#lastTime = currentTime

        this.#animation.update(deltaTime)
        this.#updateMotion(deltaTime)
        this.#updateAnimatorSprite()
        this.render()

        this.#onFrame?.(this.#animation.currentIndex)

        if (this.#animation.completed) {
            this.stop()
            return
        }

        this.#animationFrameId = requestAnimationFrame((t) => this.#loop(t))
    }


    #updateMotion (deltaTime) {
        if (!this.#motion?.mode) {
            return
        }

        const speed = this.#size.width
        const direction = this.#getSpriteDirection()
        this.#spriteX += speed * deltaTime * direction

        const halfWidth = this.#unitsInView.width / 2
        const margin = this.#size.width

        if (this.#spriteX > halfWidth + margin) {
            this.#spriteX = -halfWidth - margin
        } else if (this.#spriteX < -halfWidth - margin) {
            this.#spriteX = halfWidth + margin
        }
    }


    #getSpriteDirection () {
        const dir = this.#motion?.direction || 'e'
        const directionMap = {
            e: 1,
            w: -1,
            ne: 1,
            se: 1,
            nw: -1,
            sw: -1,
            n: 0,
            s: 0
        }
        return directionMap[dir] ?? 1
    }


    render () {
        this.#renderer.render(this.#scene)
    }


    seekToFrame (index) {
        if (!this.#animation) {
            return
        }
        this.#animation.seekToFrame(index)
        this.#updateAnimatorSprite()
        this.render()
    }


    get isPlaying () {
        return this.#isPlaying
    }


    get animation () {
        return this.#animation
    }


    get sprite () {
        return this.#animatorSprite
    }


    get currentIndex () {
        return this.#animation?.currentIndex ?? 0
    }


    dispose () {
        this.stop()
        this.#renderer = null
        this.#scene = null
    }

}
