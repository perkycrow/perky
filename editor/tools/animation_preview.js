import BaseEditorComponent from '../base_editor_component.js'
import {buildEditorStyles, editorBaseStyles} from '../editor_theme.js'
import {ICONS} from '../devtools/devtools_icons.js'
import WebGLRenderer from '../../render/webgl_renderer.js'
import Sprite from '../../render/sprite.js'
import Object2D from '../../render/object_2d.js'
import Noise from '../../math/noise.js'
import Color from '../../math/color.js'


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
    #anchor = {x: 0.5, y: 0}
    #noise = new Noise(42)

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

        const settingsBtn = document.createElement('button')
        settingsBtn.className = 'settings-btn'
        settingsBtn.innerHTML = ICONS.wrench
        settingsBtn.addEventListener('click', () => this.#toggleSettings())

        const sceneryBtn = document.createElement('button')
        sceneryBtn.className = 'scenery-btn'
        sceneryBtn.innerHTML = ICONS.scenery
        sceneryBtn.addEventListener('click', () => this.#toggleScenery())

        controls.appendChild(playBtn)
        controls.appendChild(stopBtn)
        controls.appendChild(settingsBtn)
        controls.appendChild(sceneryBtn)
        container.appendChild(controls)

        this.shadowRoot.appendChild(container)

        this.#setupRenderer()
        this.#setupResizeObserver()
        this.#syncSceneryState()
    }


    #toggleSettings () {
        this.dispatchEvent(new CustomEvent('settingsrequest'))
    }


    get #sceneryActive () {
        return this.#sceneryEnabled && this.#motion?.enabled
    }


    #toggleScenery () {
        if (!this.#motion?.enabled) {
            return
        }

        this.#sceneryEnabled = !this.#sceneryEnabled
        this.#sceneryOffset = 0
        this.#syncSceneryState()
    }


    setMotion (motion) {
        this.#motion = motion
        this.#sceneryOffset = 0

        if (!motion?.enabled) {
            this.#sceneryEnabled = false
        }

        this.#syncSceneryState()
    }


    updateMotion (motion) {
        this.#motion = motion
        this.#syncSceneryState()
    }


    setAnchor (anchor) {
        this.#anchor = anchor || {x: 0.5, y: 0}
        if (this.#sceneryActive) {
            this.#renderScenery()
        }
    }


    #syncSceneryState () {
        const sceneryBtn = this.shadowRoot.querySelector('.scenery-btn')
        if (sceneryBtn) {
            sceneryBtn.classList.toggle('disabled', !this.#motion?.enabled)
            sceneryBtn.classList.toggle('active', this.#sceneryActive)
        }

        if (this.#sceneryActive) {
            this.#updateSceneryCanvas()
        } else {
            this.#clearSceneryCanvas()
        }

        this.#fitToContainer(this.#animation?.currentFrame?.region)
        this.#render()
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

        const sceneryMargin = this.#sceneryActive ? 0.7 : 1
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

        if (this.#animation.completed) {
            this.stop()
            return
        }

        this.#animationFrameId = requestAnimationFrame((t) => this.#loop(t))
    }


    #updateScenery (deltaTime) {
        if (!this.#sceneryActive) {
            return
        }

        const speed = (this.#motion.speed ?? 1) * 50
        const direction = this.#getSceneryDirection()
        this.#sceneryOffset += speed * deltaTime * direction
        this.#renderScenery()
    }


    #getSceneryDirection () {
        const dir = this.#motion?.direction || 'e'
        const directionMap = {
            e: -1,
            w: 1,
            ne: -1,
            se: -1,
            nw: 1,
            sw: 1,
            n: 1,
            s: -1
        }
        return directionMap[dir] || -1
    }


    #clearSceneryCanvas () {
        if (this.#sceneryCtx && this.#sceneryCanvas) {
            this.#sceneryCtx.clearRect(0, 0, this.#sceneryCanvas.width, this.#sceneryCanvas.height)
        }
    }


    #renderScenery () {
        if (!this.#sceneryCtx || !this.#sceneryCanvas) {
            return
        }

        const ctx = this.#sceneryCtx
        const width = this.#sceneryCanvas.width
        const height = this.#sceneryCanvas.height

        ctx.clearRect(0, 0, width, height)

        if (!this.#sceneryActive) {
            this.#renderSimpleGrid(ctx, width, height)
            return
        }

        const mode = this.#motion.mode || 'sidescroller'

        if (mode === 'sidescroller') {
            this.#renderSidescroller(ctx, width, height)
        } else if (mode === 'topdown') {
            this.#renderTopdown(ctx, width, height)
        }
    }


    #renderSimpleGrid (ctx, width, height) {
        const spriteSize = this.#getSpriteSize()
        const gridSize = spriteSize.width * 0.2

        ctx.strokeStyle = 'rgba(150, 170, 190, 0.06)'
        ctx.lineWidth = 1

        for (let x = gridSize; x < width; x += gridSize) {
            ctx.beginPath()
            ctx.moveTo(x, 0)
            ctx.lineTo(x, height)
            ctx.stroke()
        }

        for (let y = gridSize; y < height; y += gridSize) {
            ctx.beginPath()
            ctx.moveTo(0, y)
            ctx.lineTo(width, y)
            ctx.stroke()
        }
    }


    #getSpriteSize () {
        const region = this.#animation?.currentFrame?.region
        if (!region || !this.#canvas) {
            return {width: 64, height: 64}
        }
        const canvasRect = this.#canvas.getBoundingClientRect()
        const scale = canvasRect.height / region.height
        return {
            width: region.width * scale,
            height: region.height * scale
        }
    }


    #renderSidescroller (ctx, width, height) {
        const groundY = this.#getGroundY(height)
        const spriteSize = this.#getSpriteSize()

        this.#renderBuildings(ctx, width, groundY, spriteSize)

        ctx.fillStyle = 'rgba(100, 120, 140, 0.08)'
        ctx.fillRect(0, groundY, width, height - groundY)

        const unitSize = spriteSize.width * 0.2

        ctx.strokeStyle = 'rgba(150, 170, 190, 0.08)'
        ctx.lineWidth = 1

        const startX = (this.#sceneryOffset % unitSize) - unitSize
        for (let x = startX; x < width + unitSize; x += unitSize) {
            ctx.beginPath()
            ctx.moveTo(x, groundY)
            ctx.lineTo(x, height)
            ctx.stroke()
        }

        for (let y = groundY + unitSize; y < height; y += unitSize) {
            ctx.beginPath()
            ctx.moveTo(0, y)
            ctx.lineTo(width, y)
            ctx.stroke()
        }

        ctx.strokeStyle = 'rgba(150, 170, 190, 0.25)'
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(0, groundY)
        ctx.lineTo(width, groundY)
        ctx.stroke()

        const firstUnit = Math.floor(-this.#sceneryOffset / unitSize)

        for (let i = -1; i < Math.ceil(width / unitSize) + 2; i++) {
            const unit = firstUnit + i
            const x = (this.#sceneryOffset % unitSize) + i * unitSize

            let poleHeight
            if (unit % 10 === 0) {
                poleHeight = unitSize * 2
                ctx.strokeStyle = 'rgba(150, 170, 190, 0.2)'
                ctx.lineWidth = 2
            } else if (unit % 5 === 0) {
                poleHeight = unitSize * 1.25
                ctx.strokeStyle = 'rgba(150, 170, 190, 0.15)'
                ctx.lineWidth = 1.5
            } else {
                poleHeight = unitSize * 0.6
                ctx.strokeStyle = 'rgba(150, 170, 190, 0.1)'
                ctx.lineWidth = 1
            }

            ctx.beginPath()
            ctx.moveTo(x, groundY)
            ctx.lineTo(x, groundY - poleHeight)
            ctx.stroke()
        }
    }


    #renderBuildings (ctx, width, groundY, spriteSize) {
        const baseHeight = spriteSize.height * 1.2
        const baseWidth = spriteSize.width * 0.5
        const gridSize = baseWidth * 0.8

        const buildings = []

        const minDepth = 0.3
        const maxDepth = 1.0

        const worldLeftSlow = -this.#sceneryOffset * minDepth - width
        const worldRightFast = -this.#sceneryOffset * maxDepth + width * 2

        const startSlot = Math.floor(Math.min(worldLeftSlow, worldRightFast) / gridSize) - 2
        const endSlot = Math.ceil(Math.max(worldLeftSlow, worldRightFast) / gridSize) + 2

        for (let slot = startSlot; slot <= endSlot; slot++) {
            const depthNoise = this.#noise.perlin2d(slot * 1.2, 0)
            const depth = minDepth + (depthNoise + 1) * 0.35

            const offsetNoise = this.#noise.perlin2d(slot * 1.7, 100)
            const baseX = slot * gridSize + offsetNoise * gridSize * 0.4

            const heightNoise = this.#noise.perlin2d(slot * 1.3, 200)
            const widthNoise = this.#noise.perlin2d(slot * 1.5, 300)

            const scale = 0.5 + depth * 0.5
            const buildingHeight = baseHeight * (0.4 + (heightNoise + 1) * 0.4) * scale
            const buildingWidth = baseWidth * (0.3 + (widthNoise + 1) * 0.35) * scale

            const screenX = baseX + this.#sceneryOffset * depth

            if (screenX + buildingWidth / 2 > 0 && screenX - buildingWidth / 2 < width) {
                const color = new Color('#1a1a1e').lighten(depth * 8)

                buildings.push({screenX, buildingWidth, buildingHeight, color: color.toHex(), depth})
            }
        }

        buildings.sort((a, b) => a.depth - b.depth)

        for (const b of buildings) {
            ctx.fillStyle = b.color
            ctx.fillRect(
                b.screenX - b.buildingWidth / 2,
                groundY - b.buildingHeight,
                b.buildingWidth,
                b.buildingHeight
            )
        }
    }


    #getGroundY (sceneryHeight) {
        if (!this.#canvas) {
            return sceneryHeight - 20
        }

        const canvasRect = this.#canvas.getBoundingClientRect()
        const sceneryRect = this.#sceneryCanvas.getBoundingClientRect()

        const canvasTop = canvasRect.top - sceneryRect.top
        const canvasHeight = canvasRect.height

        const anchorY = this.#anchor.y
        const groundY = canvasTop + canvasHeight * (1 - anchorY)

        return groundY
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

    .preview-controls button.disabled {
        opacity: 0.4;
        cursor: not-allowed;
    }
`
)


customElements.define('animation-preview', AnimationPreview)
