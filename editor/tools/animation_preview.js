import BaseEditorComponent from '../base_editor_component.js'
import {buildEditorStyles, editorBaseStyles} from '../editor_theme.js'
import {ICONS} from '../devtools/devtools_icons.js'
import WebGLRenderer from '../../render/webgl_renderer.js'
import Sprite from '../../render/sprite.js'
import Object2D from '../../render/object_2d.js'


export default class AnimationPreview extends BaseEditorComponent {

    #canvas = null
    #previewArea = null
    #renderer = null
    #scene = null
    #sprite = null
    #animation = null
    #animationFrameId = null
    #lastTime = 0
    #isPlaying = false
    #resizeObserver = null

    #sceneryEnabled = false
    #sceneryOffset = 0
    #sceneryCanvas = null
    #sceneryCtx = null
    #motion = null

    connectedCallback () {
        this.#buildDOM()

        if (this.#animation) {
            this.#updateSprite()
            this.#render()
        }
    }


    disconnectedCallback () {
        this.stop()
        this.#renderer = null
        this.#scene = null
        this.#sprite = null
        if (this.#resizeObserver) {
            this.#resizeObserver.disconnect()
            this.#resizeObserver = null
        }
    }


    #buildDOM () {
        const style = document.createElement('style')
        style.textContent = STYLES
        this.shadowRoot.appendChild(style)

        const container = document.createElement('div')
        container.className = 'preview-container'

        this.#previewArea = document.createElement('div')
        this.#previewArea.className = 'preview-area'

        this.#sceneryCanvas = document.createElement('canvas')
        this.#sceneryCanvas.className = 'scenery-canvas'
        this.#sceneryCtx = this.#sceneryCanvas.getContext('2d')
        this.#previewArea.appendChild(this.#sceneryCanvas)

        this.#canvas = document.createElement('canvas')
        this.#canvas.className = 'preview-canvas'
        this.#canvas.width = 256
        this.#canvas.height = 256
        this.#previewArea.appendChild(this.#canvas)
        container.appendChild(this.#previewArea)

        const controls = document.createElement('div')
        controls.className = 'preview-controls'

        const playBtn = document.createElement('button')
        playBtn.className = 'play-btn'
        playBtn.innerHTML = ICONS.start
        playBtn.addEventListener('click', () => this.#togglePlay())

        const stopBtn = document.createElement('button')
        stopBtn.className = 'stop-btn'
        stopBtn.innerHTML = ICONS.stop
        stopBtn.addEventListener('click', () => this.stop())

        const sceneryBtn = document.createElement('button')
        sceneryBtn.className = 'scenery-btn'
        sceneryBtn.innerHTML = ICONS.scenery
        sceneryBtn.addEventListener('click', () => this.#toggleScenery())

        controls.appendChild(playBtn)
        controls.appendChild(stopBtn)
        controls.appendChild(sceneryBtn)
        container.appendChild(controls)

        this.shadowRoot.appendChild(container)

        this.#setupRenderer()
        this.#setupResizeObserver()
    }


    #toggleScenery () {
        this.#sceneryEnabled = !this.#sceneryEnabled
        this.#sceneryOffset = 0

        const sceneryBtn = this.shadowRoot.querySelector('.scenery-btn')
        if (sceneryBtn) {
            sceneryBtn.classList.toggle('active', this.#sceneryEnabled)
        }

        this.#updateSceneryCanvas()
        this.#fitToContainer(this.#animation?.currentFrame?.region)
        this.#renderScenery()
    }


    setMotion (motion) {
        this.#motion = motion
        if (this.#sceneryEnabled) {
            this.#sceneryOffset = 0
            this.#updateSceneryCanvas()
            this.#fitToContainer(this.#animation?.currentFrame?.region)
            this.#renderScenery()
        }
    }


    #setupRenderer () {
        this.#renderer = new WebGLRenderer({
            canvas: this.#canvas,
            backgroundColor: 'transparent',
            width: 256,
            height: 256
        })

        this.#renderer.camera.setUnitsInView({width: 256, height: 256})

        this.#scene = new Object2D()
        this.#sprite = new Sprite({
            anchorX: 0.5,
            anchorY: 0.5
        })
        this.#scene.add(this.#sprite)
    }


    setAnimation (animation) {
        this.stop()
        this.#animation = animation

        if (!this.#renderer && this.#canvas) {
            this.#setupRenderer()
        }

        this.#updateSprite()
        this.#render()
    }


    #updateSprite () {
        if (!this.#sprite || !this.#animation) {
            return
        }

        const frame = this.#animation.currentFrame
        if (frame?.region) {
            this.#sprite.region = frame.region
            this.#fitToContainer(frame.region)
        }
    }


    #setupResizeObserver () {
        this.#resizeObserver = new ResizeObserver(() => {
            this.#resizeCanvas()
        })
        this.#resizeObserver.observe(this.#previewArea)
    }


    #resizeCanvas () {
        if (!this.#animation?.currentFrame?.region) {
            return
        }
        this.#fitToContainer(this.#animation.currentFrame.region)
        this.#updateSceneryCanvas()
        this.#render()
    }


    #fitToContainer (region) {
        if (!region || !this.#renderer || !this.#previewArea) {
            return
        }

        const padding = 32
        const paddingBottom = 80
        const containerWidth = this.#previewArea.clientWidth - padding * 2
        const containerHeight = this.#previewArea.clientHeight - padding - paddingBottom

        if (containerWidth <= 0 || containerHeight <= 0) {
            return
        }

        const sceneryMargin = this.#sceneryEnabled ? 0.7 : 1
        const scaleX = containerWidth / region.width
        const scaleY = containerHeight / region.height
        const scale = Math.min(scaleX, scaleY, 1) * sceneryMargin

        const canvasWidth = Math.max(1, Math.floor(region.width * scale))
        const canvasHeight = Math.max(1, Math.floor(region.height * scale))

        this.#renderer.displayWidth = canvasWidth
        this.#renderer.displayHeight = canvasHeight
        this.#renderer.applyPixelRatio()

        this.#renderer.camera.viewportWidth = canvasWidth
        this.#renderer.camera.viewportHeight = canvasHeight
        this.#renderer.camera.setUnitsInView({width: region.width, height: region.height})
    }


    #updateSceneryCanvas () {
        if (!this.#sceneryCanvas || !this.#previewArea) {
            return
        }

        const padding = 32
        const paddingBottom = 80
        const width = this.#previewArea.clientWidth - padding * 2
        const height = this.#previewArea.clientHeight - padding - paddingBottom

        if (width <= 0 || height <= 0) {
            return
        }

        this.#sceneryCanvas.width = width
        this.#sceneryCanvas.height = height
        this.#sceneryCanvas.style.width = `${width}px`
        this.#sceneryCanvas.style.height = `${height}px`
    }


    #togglePlay () {
        if (this.#isPlaying) {
            this.pause()
        } else {
            this.play()
        }
    }


    play () {
        if (!this.#animation || this.#isPlaying) {
            return
        }

        this.#isPlaying = true
        this.#animation.play()
        this.#lastTime = performance.now()
        this.#animationFrameId = requestAnimationFrame((t) => this.#loop(t))

        const playBtn = this.shadowRoot.querySelector('.play-btn')
        if (playBtn) {
            playBtn.innerHTML = ICONS.pause
        }

        this.dispatchEvent(new CustomEvent('play'))
    }


    pause () {
        this.#isPlaying = false
        this.#animation?.pause()

        if (this.#animationFrameId) {
            cancelAnimationFrame(this.#animationFrameId)
            this.#animationFrameId = null
        }

        const playBtn = this.shadowRoot.querySelector('.play-btn')
        if (playBtn) {
            playBtn.innerHTML = ICONS.start
        }

        this.dispatchEvent(new CustomEvent('pause'))
    }


    stop () {
        this.pause()
        this.#animation?.stop()
        this.#sceneryOffset = 0
        this.#updateSprite()
        this.#render()

        this.dispatchEvent(new CustomEvent('stop'))
    }


    #loop (currentTime) {
        if (!this.#isPlaying) {
            return
        }

        const deltaTime = (currentTime - this.#lastTime) / 1000
        this.#lastTime = currentTime

        this.#animation.update(deltaTime)
        this.#updateScenery(deltaTime)
        this.#updateSprite()
        this.#render()

        this.dispatchEvent(new CustomEvent('frame', {
            detail: {index: this.#animation.currentIndex}
        }))

        this.#animationFrameId = requestAnimationFrame((t) => this.#loop(t))
    }


    #updateScenery (deltaTime) {
        if (!this.#sceneryEnabled || !this.#motion?.enabled) {
            return
        }

        const speed = (this.#motion.speed || 1) * 50
        const direction = this.#getSceneryDirection()
        this.#sceneryOffset += speed * deltaTime * direction
        this.#renderScenery()
    }


    #getSceneryDirection () {
        const dir = this.#motion?.direction || 'e'
        const directionMap = {
            e: 1,
            w: -1,
            ne: 1,
            se: 1,
            nw: -1,
            sw: -1,
            n: -1,
            s: 1
        }
        return directionMap[dir] || 1
    }


    #renderScenery () {
        if (!this.#sceneryCtx || !this.#sceneryCanvas) {
            return
        }

        const ctx = this.#sceneryCtx
        const width = this.#sceneryCanvas.width
        const height = this.#sceneryCanvas.height

        ctx.clearRect(0, 0, width, height)

        if (!this.#sceneryEnabled || !this.#motion?.enabled) {
            return
        }

        const mode = this.#motion.mode || 'sidescroller'

        if (mode === 'sidescroller') {
            this.#renderSidescroller(ctx, width, height)
        } else if (mode === 'topdown') {
            this.#renderTopdown(ctx, width, height)
        }
    }


    #renderSidescroller (ctx, width, height) {
        const groundY = height - 20

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(0, groundY)
        ctx.lineTo(width, groundY)
        ctx.stroke()

        const poleSpacing = 80
        const poleHeight = 60
        const offset = ((this.#sceneryOffset % poleSpacing) + poleSpacing) % poleSpacing

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)'
        ctx.lineWidth = 3

        for (let x = -offset; x < width + poleSpacing; x += poleSpacing) {
            ctx.beginPath()
            ctx.moveTo(x, groundY)
            ctx.lineTo(x, groundY - poleHeight)
            ctx.stroke()

            ctx.beginPath()
            ctx.arc(x, groundY - poleHeight - 5, 5, 0, Math.PI * 2)
            ctx.stroke()
        }
    }


    #renderTopdown (ctx, width, height) {
        const lineSpacing = 40
        const dir = this.#motion?.direction || 'e'
        const offset = Math.abs(this.#sceneryOffset % lineSpacing)

        const horizontal = ['e', 'w', 'ne', 'nw', 'se', 'sw'].includes(dir)
        const vertical = ['n', 's', 'ne', 'nw', 'se', 'sw'].includes(dir)
        const dirX = ['w', 'nw', 'sw'].includes(dir) ? -1 : 1
        const dirY = ['n', 'ne', 'nw'].includes(dir) ? -1 : 1

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)'
        ctx.lineWidth = 1

        const offsetX = horizontal ? offset * dirX : 0
        const offsetY = vertical ? offset * dirY : 0

        for (let y = -lineSpacing + offsetY; y < height + lineSpacing; y += lineSpacing) {
            ctx.beginPath()
            ctx.moveTo(0, y)
            ctx.lineTo(width, y)
            ctx.stroke()
        }

        for (let x = -lineSpacing + offsetX; x < width + lineSpacing; x += lineSpacing) {
            ctx.beginPath()
            ctx.moveTo(x, 0)
            ctx.lineTo(x, height)
            ctx.stroke()
        }
    }


    #render () {
        if (!this.#renderer || !this.#scene) {
            return
        }
        this.#renderScenery()
        this.#renderer.render(this.#scene)
    }


    get currentIndex () {
        return this.#animation?.currentIndex ?? 0
    }


    get isPlaying () {
        return this.#isPlaying
    }


    setCurrentIndex (index) {
        if (!this.#animation) {
            return
        }

        this.#animation.seekToFrame(index)
        this.#updateSprite()
        this.#render()

        this.dispatchEvent(new CustomEvent('frame', {
            detail: {index: this.#animation.currentIndex}
        }))
    }


}


const STYLES = buildEditorStyles(
    editorBaseStyles,
    `
    :host {
        display: block;
        width: 100%;
        height: 100%;
    }

    .preview-container {
        display: flex;
        flex-direction: column;
        width: 100%;
        height: 100%;
        position: relative;
    }

    .preview-area {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: var(--spacing-lg);
        background-color: var(--bg-tertiary);
        position: relative;
    }

    .scenery-canvas {
        position: absolute;
        pointer-events: none;
    }

    .preview-canvas {
        image-rendering: pixelated;
        image-rendering: crisp-edges;
        position: relative;
        z-index: 1;
    }

    .preview-controls {
        position: absolute;
        bottom: var(--spacing-md);
        left: 50%;
        transform: translateX(-50%);
        display: flex;
        gap: var(--spacing-xs);
        padding: var(--spacing-xs);
        background: var(--bg-secondary);
        border-radius: var(--radius-md);
        z-index: 10;
    }

    .preview-controls button {
        background: transparent;
        color: var(--fg-secondary);
        border: none;
        border-radius: var(--radius-sm);
        width: 36px;
        height: 36px;
        padding: 8px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background 0.15s, color 0.15s;
    }

    .preview-controls button svg {
        width: 100%;
        height: 100%;
        fill: currentColor;
    }

    .preview-controls button:hover {
        background: var(--bg-hover);
        color: var(--fg-primary);
    }

    .preview-controls button:active {
        background: var(--accent);
        color: var(--bg-primary);
    }

    .preview-controls button.active {
        background: var(--accent);
        color: var(--bg-primary);
    }
`
)


customElements.define('animation-preview', AnimationPreview)
