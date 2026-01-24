import BaseEditorComponent from '../base_editor_component.js'
import {buildEditorStyles, editorBaseStyles} from '../editor_theme.js'
import {ICONS} from '../devtools/devtools_icons.js'
import WebGLRenderer from '../../render/webgl_renderer.js'
import Sprite from '../../render/sprite.js'
import Object2D from '../../render/object_2d.js'
import Noise from '../../math/noise.js'
import Color from '../../math/color.js'
import AnimatorPreview from '../../studio/animator/animator_preview.js'


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
    #spriteOffset = 0
    #sceneryCanvas = null
    #sceneryCtx = null
    #motion = null
    #anchor = {x: 0.5, y: 0}
    #noise = new Noise(42)
    #moveSpriteMode = true

    #sceneryZoom = 0.5
    #zoomSliderVisible = false
    #pinchStartDistance = null
    #pinchStartZoom = null
    #backgroundImage = null
    #backgroundRegion = null
    #unitsInView = null
    #size = null
    #gamePreview = null
    #gamePreviewCanvas = null

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
        this.#gamePreview?.dispose()
        this.#gamePreview = null
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

        this.#gamePreviewCanvas = document.createElement('canvas')
        this.#gamePreviewCanvas.className = 'game-preview-canvas'
        this.#gamePreviewCanvas.width = 256
        this.#gamePreviewCanvas.height = 256
        this.#previewArea.appendChild(this.#gamePreviewCanvas)

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

        const zoomControls = document.createElement('div')
        zoomControls.className = 'zoom-controls'

        const zoomToggle = document.createElement('button')
        zoomToggle.className = 'zoom-toggle'
        zoomToggle.innerHTML = ICONS.zoom
        zoomToggle.addEventListener('click', () => this.#toggleZoomSlider())

        const zoomSlider = document.createElement('input')
        zoomSlider.type = 'range'
        zoomSlider.className = 'zoom-slider'
        zoomSlider.min = '0.1'
        zoomSlider.max = '1'
        zoomSlider.step = '0.05'
        zoomSlider.value = String(this.#sceneryZoom)
        zoomSlider.addEventListener('input', (e) => this.#onZoomChange(e))

        zoomControls.appendChild(zoomSlider)
        zoomControls.appendChild(zoomToggle)
        container.appendChild(zoomControls)

        this.shadowRoot.appendChild(container)

        this.#setupRenderer()
        this.#setupResizeObserver()
        this.#setupPinchZoom()
        this.#syncSceneryState()
        this.#syncZoomControls()
    }


    #toggleSettings () {
        this.dispatchEvent(new CustomEvent('settingsrequest'))
    }


    get #hasMotion () {
        return this.#motion?.enabled || this.#motion?.mode
    }


    get #sceneryActive () {
        return this.#sceneryEnabled && this.#hasMotion
    }


    #toggleScenery () {
        if (!this.#hasMotion) {
            return
        }

        this.#sceneryEnabled = !this.#sceneryEnabled
        this.#sceneryOffset = 0
        this.#spriteOffset = 0
        this.#syncSceneryState()
    }


    setMotion (motion) {
        this.#motion = motion
        this.#sceneryOffset = 0
        this.#spriteOffset = 0

        if (!this.#hasMotion) {
            this.#sceneryEnabled = false
        }

        this.#gamePreview?.setMotion(motion)
        this.#syncSceneryState()
    }


    updateMotion (motion) {
        const modeChanged = this.#motion?.mode !== motion?.mode
        this.#motion = motion
        this.#gamePreview?.setMotion(motion)

        if (modeChanged) {
            this.#syncSceneryState()
        }
    }


    setAnchor (anchor) {
        this.#anchor = anchor || {x: 0.5, y: 0}
        this.#gamePreview?.setAnchor(this.#anchor)
        if (this.#sceneryActive) {
            this.#renderScenery()
        }
    }


    setBackgroundImage (image) {
        this.#backgroundImage = image
        if (this.#sceneryActive) {
            this.#renderScenery()
        }
    }


    setUnitsInView (unitsInView) {
        this.#unitsInView = unitsInView
        this.#updateGamePreviewConfig()
        if (this.#sceneryActive) {
            this.#fitToContainer(this.#animation?.currentFrame?.region)
            this.#render()
        }
    }


    setSize (size) {
        this.#size = size
        this.#updateGamePreviewConfig()
    }


    setBackgroundRegion (region) {
        this.#backgroundRegion = region
        this.#updateGamePreviewConfig()
    }


    get #useGamePreview () {
        return this.#sceneryActive && this.#unitsInView && this.#backgroundRegion && this.#size
    }


    #updateGamePreviewConfig () {
        if (!this.#gamePreviewCanvas) {
            return
        }

        if (this.#useGamePreview && !this.#gamePreview) {
            this.#createGamePreview()
        }

        if (this.#gamePreview) {
            if (this.#unitsInView) {
                this.#gamePreview.setUnitsInView(this.#unitsInView)
            }
            if (this.#backgroundRegion) {
                this.#gamePreview.setBackgroundRegion(this.#backgroundRegion)
            }
            if (this.#size) {
                this.#gamePreview.setSize(this.#size)
            }
            if (this.#anchor) {
                this.#gamePreview.setAnchor(this.#anchor)
            }
            if (this.#motion) {
                this.#gamePreview.setMotion(this.#motion)
            }
            if (this.#animation) {
                this.#gamePreview.setAnimation(this.#animation)
            }
        }

        this.#syncPreviewVisibility()
    }


    #createGamePreview () {
        this.#gamePreview = new AnimatorPreview({
            canvas: this.#gamePreviewCanvas,
            unitsInView: this.#unitsInView,
            onFrame: (index) => {
                this.dispatchEvent(new CustomEvent('frame', {detail: {index}}))
            },
            onComplete: () => {
                this.dispatchEvent(new CustomEvent('stop'))
                this.#updatePlayButtonIcon(false)
            }
        })
    }


    #updatePlayButtonIcon (isPlaying) {
        const playBtn = this.shadowRoot?.querySelector('.play-btn')
        if (playBtn) {
            playBtn.innerHTML = isPlaying ? ICONS.pause : ICONS.start
        }
    }


    #syncPreviewVisibility () {
        if (!this.#canvas || !this.#gamePreviewCanvas || !this.#sceneryCanvas) {
            return
        }

        const useGame = this.#useGamePreview
        this.#gamePreviewCanvas.style.display = useGame ? 'block' : 'none'
        this.#canvas.style.display = useGame ? 'none' : ''
        this.#sceneryCanvas.style.display = useGame ? 'none' : ''
        this.#previewArea?.classList.toggle('game-preview-mode', useGame)
    }


    #syncSceneryState () {
        this.#updateSceneryButton()

        const wasPlaying = this.#pauseAllPreviews()

        this.#updateGamePreviewConfig()
        this.#syncPreviewVisibility()

        if (this.#useGamePreview) {
            requestAnimationFrame(() => this.#updateGamePreviewSize())
            this.#syncZoomControls()
            if (wasPlaying) {
                this.play()
            }
            return
        }

        this.#setupNormalPreview()
        if (wasPlaying) {
            this.play()
        }
    }


    #updateSceneryButton () {
        const sceneryBtn = this.shadowRoot.querySelector('.scenery-btn')
        if (sceneryBtn) {
            sceneryBtn.classList.toggle('disabled', !this.#hasMotion)
            sceneryBtn.classList.toggle('active', this.#sceneryActive)
        }
    }


    #pauseAllPreviews () {
        const wasPlaying = this.#isPlaying || this.#gamePreview?.isPlaying

        this.#gamePreview?.pause()

        if (this.#animationFrameId) {
            cancelAnimationFrame(this.#animationFrameId)
            this.#animationFrameId = null
        }
        this.#isPlaying = false

        return wasPlaying
    }


    #setupNormalPreview () {
        if (this.#sceneryActive) {
            this.#updateSceneryCanvas()
            this.#centerSprite()
        } else {
            this.#clearSceneryCanvas()
        }

        this.#syncZoomControls()
        this.#fitToContainer(this.#animation?.currentFrame?.region)
        this.#render()
    }


    #updateGamePreviewSize () {
        if (!this.#gamePreviewCanvas || !this.#previewArea || !this.#gamePreview) {
            return
        }

        const width = this.#previewArea.clientWidth
        const height = this.#previewArea.clientHeight

        if (width > 0 && height > 0) {
            this.#gamePreview.resize(width, height)
        }
        this.#gamePreview.render()
    }


    #getSceneryZoom () {
        return this.#sceneryZoom
    }


    #toggleZoomSlider () {
        this.#zoomSliderVisible = !this.#zoomSliderVisible
        this.#syncZoomControls()
    }


    #onZoomChange (e) {
        this.#sceneryZoom = parseFloat(e.target.value)
        this.#fitToContainer(this.#animation?.currentFrame?.region)
        this.#centerSprite()
        this.#render()
    }


    #syncZoomControls () {
        const zoomControls = this.shadowRoot.querySelector('.zoom-controls')
        if (zoomControls) {
            zoomControls.classList.toggle('active', this.#sceneryActive)
            zoomControls.classList.toggle('expanded', this.#zoomSliderVisible)
        }
    }


    #setupPinchZoom () {
        this.#previewArea.addEventListener('touchstart', (e) => this.#onTouchStart(e), {passive: false})
        this.#previewArea.addEventListener('touchmove', (e) => this.#onTouchMove(e), {passive: false})
        this.#previewArea.addEventListener('touchend', () => this.#onTouchEnd())
    }


    #onTouchStart (e) {
        if (e.touches.length === 2) {
            e.preventDefault()
            this.#pinchStartDistance = getTouchDistance(e.touches)
            this.#pinchStartZoom = this.#sceneryZoom
        }
    }


    #onTouchMove (e) {
        if (e.touches.length === 2 && this.#pinchStartDistance !== null) {
            e.preventDefault()
            const currentDistance = getTouchDistance(e.touches)
            const scale = currentDistance / this.#pinchStartDistance
            const newZoom = Math.min(1, Math.max(0.1, this.#pinchStartZoom * scale))

            this.#sceneryZoom = newZoom
            this.#updateZoomSlider()
            this.#fitToContainer(this.#animation?.currentFrame?.region)
            this.#centerSprite()
            this.#render()
        }
    }


    #onTouchEnd () {
        this.#pinchStartDistance = null
        this.#pinchStartZoom = null
    }




    #updateZoomSlider () {
        const slider = this.shadowRoot.querySelector('.zoom-slider')
        if (slider) {
            slider.value = String(this.#sceneryZoom)
        }
    }


    #centerSprite () {
        if (!this.#sceneryCanvas || !this.#moveSpriteMode) {
            return
        }

        const width = this.#sceneryCanvas.width
        const spriteSize = this.#getSpriteSize()
        this.#spriteOffset = (width - spriteSize.width) / 2
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

        this.#gamePreview?.setAnimation(animation)
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

        if (this.#useGamePreview) {
            this.#updateGamePreviewSize()
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

        const sceneryMargin = this.#sceneryActive ? this.#getSceneryZoom() : 1
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

        if (this.#useGamePreview && this.#gamePreview) {
            this.#gamePreview.play()
            this.#isPlaying = true
            this.#updatePlayButtonIcon(true)
            this.dispatchEvent(new CustomEvent('play'))
            return
        }

        this.#isPlaying = true
        this.#animation.play()
        this.#lastTime = performance.now()
        this.#animationFrameId = requestAnimationFrame((t) => this.#loop(t))

        this.#updatePlayButtonIcon(true)
        this.dispatchEvent(new CustomEvent('play'))
    }


    pause () {
        if (this.#useGamePreview && this.#gamePreview) {
            this.#gamePreview.pause()
        }

        this.#isPlaying = false
        this.#animation?.pause()

        if (this.#animationFrameId) {
            cancelAnimationFrame(this.#animationFrameId)
            this.#animationFrameId = null
        }

        this.#updatePlayButtonIcon(false)
        this.dispatchEvent(new CustomEvent('pause'))
    }


    stop () {
        if (this.#useGamePreview && this.#gamePreview) {
            this.#gamePreview.stop()
            this.#isPlaying = false
            this.#updatePlayButtonIcon(false)
            this.dispatchEvent(new CustomEvent('stop'))
            return
        }

        this.pause()
        this.#animation?.stop()
        this.#sceneryOffset = 0
        this.#spriteOffset = 0
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

        const spriteWidth = this.#getSpriteSize().width
        const motionSpeed = this.#motion?.speed ?? 1
        const speed = spriteWidth * motionSpeed
        const direction = this.#getSpriteDirection()

        if (this.#moveSpriteMode) {
            this.#spriteOffset += speed * deltaTime * direction
            this.#wrapSpritePosition()
        } else {
            this.#sceneryOffset += speed * deltaTime * -direction
        }

        this.#renderScenery()
    }


    #wrapSpritePosition () {
        if (!this.#sceneryCanvas) {
            return
        }

        const width = this.#sceneryCanvas.width
        const spriteSize = this.#getSpriteSize()
        const margin = spriteSize.width

        if (this.#spriteOffset > width + margin) {
            this.#spriteOffset = -margin
        } else if (this.#spriteOffset < -margin) {
            this.#spriteOffset = width + margin
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
        if (this.#backgroundImage) {
            this.#renderBackgroundImage(ctx, width, height)
            return
        }

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


    #renderBackgroundImage (ctx, width, height) {
        const img = this.#backgroundImage
        const imgRatio = img.width / img.height
        const canvasRatio = width / height

        let drawWidth
        let drawHeight

        if (imgRatio > canvasRatio) {
            drawHeight = height
            drawWidth = height * imgRatio
        } else {
            drawWidth = width
            drawHeight = width / imgRatio
        }

        const offsetX = this.#sceneryOffset % drawWidth
        const y = height - drawHeight

        ctx.drawImage(img, offsetX, y, drawWidth, drawHeight)
        ctx.drawImage(img, offsetX - drawWidth, y, drawWidth, drawHeight)
        ctx.drawImage(img, offsetX + drawWidth, y, drawWidth, drawHeight)
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
        this.#updateSpritePosition()
        this.#renderer.render(this.#scene)
    }


    #updateSpritePosition () {
        if (!this.#canvas) {
            return
        }

        if (!this.#sceneryActive || !this.#moveSpriteMode) {
            this.#canvas.style.position = ''
            this.#canvas.style.left = ''
            this.#canvas.style.top = ''
            return
        }

        const sceneryRect = this.#sceneryCanvas?.getBoundingClientRect()
        const previewRect = this.#previewArea?.getBoundingClientRect()
        const canvasRect = this.#canvas.getBoundingClientRect()

        if (!sceneryRect || !previewRect) {
            return
        }

        const sceneryLeft = sceneryRect.left - previewRect.left
        const sceneryTop = sceneryRect.top - previewRect.top
        const centerY = sceneryTop + (sceneryRect.height - canvasRect.height) / 2

        this.#canvas.style.position = 'absolute'
        this.#canvas.style.left = `${sceneryLeft + this.#spriteOffset}px`
        this.#canvas.style.top = `${centerY}px`
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

        if (this.#useGamePreview && this.#gamePreview) {
            this.#gamePreview.seekToFrame(index)
            this.dispatchEvent(new CustomEvent('frame', {
                detail: {index: this.#gamePreview.currentIndex}
            }))
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


function getTouchDistance (touches) {
    const [a, b] = touches
    const dx = a.clientX - b.clientX
    const dy = a.clientY - b.clientY
    return Math.sqrt(dx * dx + dy * dy)
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

    .preview-area.game-preview-mode {
        padding: 0;
    }

    .scenery-canvas {
        position: absolute;
        pointer-events: none;
    }

    .game-preview-canvas {
        display: none;
        image-rendering: pixelated;
        image-rendering: crisp-edges;
        position: absolute;
        top: 0;
        left: 0;
        z-index: 1;
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

    .zoom-controls {
        position: absolute;
        top: var(--spacing-md);
        right: var(--spacing-md);
        display: none;
        align-items: center;
        gap: var(--spacing-xs);
        padding: var(--spacing-xs);
        background: var(--bg-secondary);
        border-radius: var(--radius-md);
        z-index: 10;
    }

    .zoom-controls.active {
        display: flex;
    }

    .zoom-controls .zoom-slider {
        width: 100px;
        height: 4px;
        -webkit-appearance: none;
        appearance: none;
        background: var(--bg-tertiary);
        border-radius: 2px;
        outline: none;
        display: none;
    }

    .zoom-controls.expanded .zoom-slider {
        display: block;
    }

    .zoom-controls .zoom-slider::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 14px;
        height: 14px;
        background: var(--accent);
        border-radius: 50%;
        cursor: pointer;
    }

    .zoom-controls .zoom-slider::-moz-range-thumb {
        width: 14px;
        height: 14px;
        background: var(--accent);
        border-radius: 50%;
        cursor: pointer;
        border: none;
    }

    .zoom-controls .zoom-toggle {
        background: transparent;
        color: var(--fg-secondary);
        border: none;
        border-radius: var(--radius-sm);
        width: 28px;
        height: 28px;
        padding: 6px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background 0.15s, color 0.15s;
    }

    .zoom-controls .zoom-toggle svg {
        width: 100%;
        height: 100%;
        stroke: currentColor;
        fill: none;
    }

    .zoom-controls .zoom-toggle:hover {
        background: var(--bg-hover);
        color: var(--fg-primary);
    }

    .zoom-controls.expanded .zoom-toggle {
        background: var(--accent);
        color: var(--bg-primary);
    }
`
)


customElements.define('animation-preview', AnimationPreview)
