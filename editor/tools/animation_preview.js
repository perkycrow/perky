import BaseEditorComponent from '../base_editor_component.js'
import {buildEditorStyles, editorBaseStyles} from '../editor_theme.js'
import WebGLRenderer from '../../render/webgl_renderer.js'
import Sprite from '../../render/sprite.js'
import Object2D from '../../render/object_2d.js'


export default class AnimationPreview extends BaseEditorComponent {

    #canvas = null
    #renderer = null
    #scene = null
    #sprite = null
    #animation = null
    #animationFrameId = null
    #lastTime = 0
    #isPlaying = false

    connectedCallback () {
        this.#buildDOM()
    }


    disconnectedCallback () {
        this.stop()
        this.#renderer = null
        this.#scene = null
        this.#sprite = null
    }


    #buildDOM () {
        const style = document.createElement('style')
        style.textContent = STYLES
        this.shadowRoot.appendChild(style)

        const container = document.createElement('div')
        container.className = 'preview-container'

        this.#canvas = document.createElement('canvas')
        this.#canvas.className = 'preview-canvas'
        this.#canvas.width = 128
        this.#canvas.height = 128
        container.appendChild(this.#canvas)

        const controls = document.createElement('div')
        controls.className = 'preview-controls'

        const playBtn = document.createElement('button')
        playBtn.className = 'play-btn'
        playBtn.textContent = '▶'
        playBtn.addEventListener('click', () => this.#togglePlay())

        const stopBtn = document.createElement('button')
        stopBtn.className = 'stop-btn'
        stopBtn.textContent = '⏹'
        stopBtn.addEventListener('click', () => this.stop())

        controls.appendChild(playBtn)
        controls.appendChild(stopBtn)
        container.appendChild(controls)

        this.shadowRoot.appendChild(container)

        this.#setupRenderer()
    }


    #setupRenderer () {
        this.#renderer = new WebGLRenderer({
            canvas: this.#canvas,
            backgroundColor: '#1a1a1a',
            width: 128,
            height: 128
        })

        this.#renderer.camera.setUnitsInView({width: 128, height: 128})

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
            this.#fitCamera(frame.region)
        }
    }


    #fitCamera (region) {
        if (!region || !this.#renderer) {
            return
        }

        const canvasSize = 128
        const padding = 8

        const scaleX = (canvasSize - padding * 2) / region.width
        const scaleY = (canvasSize - padding * 2) / region.height
        const scale = Math.min(scaleX, scaleY)

        const unitsInView = canvasSize / scale
        this.#renderer.camera.setUnitsInView({width: unitsInView, height: unitsInView})
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
        playBtn.textContent = '⏸'

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
        playBtn.textContent = '▶'

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

}


const STYLES = buildEditorStyles(
    editorBaseStyles,
    `
    :host {
        display: block;
    }

    .preview-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
    }

    .preview-canvas {
        border-radius: 4px;
        background: #1a1a1a;
        border: 1px solid var(--border);
    }

    .preview-controls {
        display: flex;
        gap: 8px;
    }

    .preview-controls button {
        background: var(--bg-secondary);
        color: var(--fg-primary);
        border: 1px solid var(--border);
        border-radius: 4px;
        padding: 4px 12px;
        cursor: pointer;
        font-size: 14px;
    }

    .preview-controls button:hover {
        background: var(--bg-tertiary);
        border-color: var(--accent);
    }
`
)


customElements.define('animation-preview', AnimationPreview)
