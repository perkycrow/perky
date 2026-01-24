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

        controls.appendChild(playBtn)
        controls.appendChild(stopBtn)
        container.appendChild(controls)

        this.shadowRoot.appendChild(container)

        this.#setupRenderer()
        this.#setupResizeObserver()
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

        const scaleX = containerWidth / region.width
        const scaleY = containerHeight / region.height
        const scale = Math.min(scaleX, scaleY, 1)

        const canvasWidth = Math.max(1, Math.floor(region.width * scale))
        const canvasHeight = Math.max(1, Math.floor(region.height * scale))

        this.#renderer.displayWidth = canvasWidth
        this.#renderer.displayHeight = canvasHeight
        this.#renderer.applyPixelRatio()

        this.#renderer.camera.viewportWidth = canvasWidth
        this.#renderer.camera.viewportHeight = canvasHeight
        this.#renderer.camera.setUnitsInView({width: region.width, height: region.height})
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
        this.#updateSprite()
        this.#render()

        this.dispatchEvent(new CustomEvent('frame', {
            detail: {index: this.#animation.currentIndex}
        }))

        this.#animationFrameId = requestAnimationFrame((t) => this.#loop(t))
    }


    #render () {
        if (!this.#renderer || !this.#scene) {
            return
        }
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
        background-image:
            linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
        background-size: 32px 32px;
        background-color: var(--bg-tertiary);
    }

    .preview-canvas {
        image-rendering: pixelated;
        image-rendering: crisp-edges;
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
`
)


customElements.define('animation-preview', AnimationPreview)
