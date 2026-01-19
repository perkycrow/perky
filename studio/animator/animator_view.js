import BaseEditorComponent from '../../editor/base_editor_component.js'
import {adoptStyles, createSheet} from '../../editor/styles/index.js'
import '../../editor/layout/app_layout.js'
import '../../editor/layout/overlay.js'
import '../../editor/tools/animation_preview.js'
import '../../editor/tools/animation_timeline.js'
import '../../editor/tools/spritesheet_viewer.js'
import '../../editor/number_input.js'


const animatorStyles = createSheet(`
    :host {
        display: block;
        height: 100%;
        background: var(--bg-primary);
        color: var(--fg-primary);
        font-family: var(--font-mono);
        font-size: 12px;
    }

    app-layout {
        height: 100%;
    }

    .animator-container {
        display: flex;
        flex-direction: column;
        height: 100%;
        overflow: hidden;
    }

    .empty {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
        color: var(--fg-muted);
    }

    /* Preview section - takes remaining space */
    .preview-section {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: var(--spacing-lg);
        min-height: 200px;
        background: var(--bg-tertiary);
    }

    .preview-canvas {
        max-width: 100%;
        max-height: 100%;
    }

    /* Header/Footer controls (slotted into app-layout) */
    .header-controls,
    .footer-controls {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
    }

    .toolbar-select {
        appearance: none;
        background: var(--bg-tertiary);
        color: var(--fg-primary);
        border: none;
        border-radius: var(--radius-md);
        padding: 10px 14px;
        font-family: inherit;
        font-size: 13px;
        min-width: 120px;
        min-height: var(--touch-target);
        cursor: pointer;
        transition: background var(--transition-fast);
    }

    .toolbar-select:hover {
        background: var(--bg-hover);
    }

    .toolbar-select:focus {
        outline: none;
        background: var(--bg-hover);
    }

    .toolbar-select-small {
        min-width: 50px;
        padding: 10px 12px;
        text-align: center;
    }

    .toolbar-btn {
        appearance: none;
        background: var(--bg-tertiary);
        color: var(--fg-secondary);
        border: none;
        border-radius: var(--radius-md);
        padding: 10px 16px;
        font-family: inherit;
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
        transition: background var(--transition-fast), color var(--transition-fast), transform 0.1s;
        min-height: var(--touch-target);
        min-width: var(--touch-target);
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .toolbar-btn:hover {
        background: var(--bg-hover);
        color: var(--fg-primary);
    }

    .toolbar-btn:active {
        transform: scale(0.96);
    }

    .toolbar-btn-primary {
        background: var(--accent);
        color: var(--bg-primary);
        font-size: 20px;
        font-weight: 400;
    }

    .toolbar-btn-primary:hover {
        background: var(--accent-hover);
        color: var(--bg-primary);
    }

    .toolbar-toggle {
        font-size: 16px;
    }

    .toolbar-toggle.active {
        background: var(--accent);
        color: var(--bg-primary);
    }

    .toolbar-btn.success {
        background: var(--status-success);
        color: var(--bg-primary);
    }

    .config-input {
        width: 80px;
    }

    /* Timeline */
    .timeline-section {
        flex-shrink: 0;
        background: var(--bg-secondary);
        border-top: 1px solid var(--border);
        padding: var(--spacing-md) var(--spacing-lg);
        min-height: 120px;
        overflow: hidden;
        max-width: 100%;
    }

    /* Spritesheet panel (inside overlay) */
    .spritesheet-panel {
        background: var(--bg-secondary);
        border-radius: var(--radius-lg);
        width: 90%;
        max-width: 900px;
        height: 80%;
        max-height: 700px;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        box-shadow: var(--shadow-lg);
    }

    .spritesheet-header {
        display: flex;
        align-items: center;
        gap: var(--spacing-lg);
        padding: var(--spacing-lg) var(--spacing-xl);
        background: var(--bg-tertiary);
        flex-shrink: 0;
    }

    .spritesheet-close {
        appearance: none;
        background: var(--bg-hover);
        border: none;
        color: var(--fg-secondary);
        width: var(--touch-target);
        height: var(--touch-target);
        border-radius: var(--radius-md);
        font-size: 18px;
        cursor: pointer;
        transition: background var(--transition-fast), color var(--transition-fast);
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .spritesheet-close:hover {
        background: var(--bg-selected);
        color: var(--fg-primary);
    }

    .spritesheet-title {
        font-size: var(--font-size-lg);
        font-weight: 500;
        color: var(--fg-primary);
    }

    .spritesheet-content {
        flex: 1;
        padding: var(--spacing-lg);
        overflow: auto;
    }
`)


export default class AnimatorView extends BaseEditorComponent {

    #context = null
    #animators = {}
    #animatorClass = null
    #animator = null
    #spritesheet = null
    #selectedAnimation = null

    #appLayout = null
    #containerEl = null
    #previewEl = null
    #timelineEl = null
    #overlayEl = null
    #spritesheetEl = null

    connectedCallback () {
        this.#buildDOM()

        if (this.#context) {
            const firstKey = Object.keys(this.#animators)[0]
            if (firstKey) {
                this.#selectAnimator(firstKey)
            }
        }
    }


    setContext ({textureSystem, animators}) {
        this.#context = {textureSystem}
        this.#animators = animators || {}

        if (this.isConnected) {
            const firstKey = Object.keys(this.#animators)[0]
            if (firstKey) {
                this.#selectAnimator(firstKey)
            }
        }
    }


    #selectAnimator (name) {
        const AnimatorClass = this.#animators[name]
        if (!AnimatorClass) {
            return
        }

        this.#animatorClass = AnimatorClass

        this.#animator = new AnimatorClass({
            sprite: null,
            textureSystem: this.#context.textureSystem
        })

        const spritesheetName = this.#inferSpritesheetName()
        this.#spritesheet = spritesheetName
            ? this.#context.textureSystem.getSpritesheet(spritesheetName)
            : null

        this.#selectedAnimation = this.#animator.children[0] || null

        this.#render()
    }


    #inferSpritesheetName () {
        const animations = this.#animatorClass?.animations
        if (!animations) {
            return null
        }

        const firstAnim = Object.values(animations)[0]
        if (firstAnim?.source) {
            return firstAnim.source.split(':')[0]
        }
        if (firstAnim?.frames?.[0]?.source) {
            return firstAnim.frames[0].source.split(':')[0]
        }
        return null
    }


    #buildDOM () {
        adoptStyles(this.shadowRoot, animatorStyles)

        // App layout wrapper
        this.#appLayout = document.createElement('app-layout')
        this.#appLayout.setAttribute('no-menu', '')
        this.#appLayout.setAttribute('no-close', '')

        // Content container (preview + timeline)
        this.#containerEl = document.createElement('div')
        this.#containerEl.className = 'animator-container'
        this.#appLayout.appendChild(this.#containerEl)

        // Spritesheet overlay
        this.#overlayEl = document.createElement('editor-overlay')
        this.#overlayEl.setAttribute('slot', 'overlay')
        this.#appLayout.appendChild(this.#overlayEl)

        this.shadowRoot.appendChild(this.#appLayout)
    }


    #render () {
        // Clear previous slotted elements
        this.#appLayout.querySelectorAll('[slot]').forEach(el => {
            if (el !== this.#overlayEl) {
                el.remove()
            }
        })
        this.#containerEl.innerHTML = ''

        if (!this.#animator) {
            this.#containerEl.innerHTML = '<div class="empty">No animator loaded</div>'
            return
        }

        // Header: selects in header-start, controls in header-end
        this.#buildHeaderControls()

        // Content: preview + timeline
        const previewSection = this.#createPreviewSection()
        this.#containerEl.appendChild(previewSection)

        this.#timelineEl = document.createElement('animation-timeline')
        this.#timelineEl.className = 'timeline-section'
        if (this.#selectedAnimation) {
            this.#timelineEl.setFrames(this.#selectedAnimation.frames)
        }
        this.#setupTimelineEvents()
        this.#containerEl.appendChild(this.#timelineEl)

        // Footer: actions
        this.#buildFooterControls()

        // Build spritesheet overlay content
        this.#buildSpritesheetOverlay()
    }


    #createPreviewSection () {
        const section = document.createElement('div')
        section.className = 'preview-section'

        this.#previewEl = document.createElement('animation-preview')
        this.#previewEl.className = 'preview-canvas'
        if (this.#selectedAnimation) {
            this.#previewEl.setAnimation(this.#selectedAnimation)
        }
        this.#previewEl.addEventListener('frame', (e) => {
            this.#timelineEl?.setCurrentIndex(e.detail.index)
        })

        section.appendChild(this.#previewEl)

        return section
    }


    #buildHeaderControls () {
        // Header start: selects
        const headerStart = document.createElement('div')
        headerStart.className = 'header-controls'
        headerStart.setAttribute('slot', 'header-start')

        // Animator select
        const animatorSelect = document.createElement('select')
        animatorSelect.className = 'toolbar-select'
        for (const name of Object.keys(this.#animators)) {
            const option = document.createElement('option')
            option.value = name
            option.textContent = name
            option.selected = this.#animators[name] === this.#animatorClass
            animatorSelect.appendChild(option)
        }
        animatorSelect.addEventListener('change', (e) => {
            this.#selectAnimator(e.target.value)
        })

        // Animation select
        const animSelect = document.createElement('select')
        animSelect.className = 'toolbar-select'
        for (const anim of this.#animator.children) {
            const option = document.createElement('option')
            option.value = anim.$id
            option.textContent = anim.$id
            option.selected = anim === this.#selectedAnimation
            animSelect.appendChild(option)
        }
        animSelect.addEventListener('change', (e) => {
            this.#selectedAnimation = this.#animator.getChild(e.target.value)
            this.#updateForSelectedAnimation()
        })

        headerStart.appendChild(animatorSelect)
        headerStart.appendChild(animSelect)
        this.#appLayout.appendChild(headerStart)

        // Header end: animation config
        if (this.#selectedAnimation) {
            const headerEnd = document.createElement('div')
            headerEnd.className = 'header-controls'
            headerEnd.setAttribute('slot', 'header-end')

            const anim = this.#selectedAnimation

            // FPS
            const fpsInput = document.createElement('number-input')
            fpsInput.className = 'config-input'
            fpsInput.setLabel('fps')
            fpsInput.setValue(anim.fps)
            fpsInput.setStep(1)
            fpsInput.setMin(1)
            fpsInput.setMax(60)
            fpsInput.addEventListener('change', (e) => {
                anim.setFps(e.detail.value)
            })

            // Loop
            const loopBtn = document.createElement('button')
            loopBtn.className = `toolbar-btn toolbar-toggle ${anim.loop ? 'active' : ''}`
            loopBtn.textContent = '⟳'
            loopBtn.title = 'Loop'
            loopBtn.addEventListener('click', () => {
                anim.setLoop(!anim.loop)
                loopBtn.classList.toggle('active', anim.loop)
            })

            // Mode
            const modeSelect = document.createElement('select')
            modeSelect.className = 'toolbar-select toolbar-select-small'
            const modeSymbols = {forward: '→', reverse: '←', pingpong: '↔'}
            for (const mode of ['forward', 'reverse', 'pingpong']) {
                const opt = document.createElement('option')
                opt.value = mode
                opt.textContent = modeSymbols[mode]
                opt.selected = anim.playbackMode === mode
                modeSelect.appendChild(opt)
            }
            modeSelect.title = 'Playback mode'
            modeSelect.addEventListener('change', (e) => {
                anim.setPlaybackMode(e.target.value)
            })

            headerEnd.appendChild(fpsInput)
            headerEnd.appendChild(loopBtn)
            headerEnd.appendChild(modeSelect)
            this.#appLayout.appendChild(headerEnd)
        }
    }


    #buildFooterControls () {
        // Footer start: add button
        const footerStart = document.createElement('div')
        footerStart.className = 'footer-controls'
        footerStart.setAttribute('slot', 'footer-start')

        const addBtn = document.createElement('button')
        addBtn.className = 'toolbar-btn toolbar-btn-primary'
        addBtn.innerHTML = '+'
        addBtn.title = 'Add frames from spritesheet'
        addBtn.addEventListener('click', () => this.#openSpritesheetOverlay())

        footerStart.appendChild(addBtn)
        this.#appLayout.appendChild(footerStart)

        // Footer end: export button
        const footerEnd = document.createElement('div')
        footerEnd.className = 'footer-controls'
        footerEnd.setAttribute('slot', 'footer-end')

        const exportBtn = document.createElement('button')
        exportBtn.className = 'toolbar-btn'
        exportBtn.textContent = 'Export'
        exportBtn.addEventListener('click', () => this.#exportToClipboard(exportBtn))

        footerEnd.appendChild(exportBtn)
        this.#appLayout.appendChild(footerEnd)
    }


    #buildSpritesheetOverlay () {
        this.#overlayEl.innerHTML = ''

        const panel = document.createElement('div')
        panel.className = 'spritesheet-panel'

        // Header
        const header = document.createElement('div')
        header.className = 'spritesheet-header'

        const closeBtn = document.createElement('button')
        closeBtn.className = 'spritesheet-close'
        closeBtn.innerHTML = '✕'
        closeBtn.addEventListener('click', () => this.#closeSpritesheetOverlay())

        const title = document.createElement('span')
        title.className = 'spritesheet-title'
        title.textContent = 'Add Frames'

        header.appendChild(closeBtn)
        header.appendChild(title)

        // Spritesheet viewer
        this.#spritesheetEl = document.createElement('spritesheet-viewer')
        this.#spritesheetEl.className = 'spritesheet-content'
        if (this.#spritesheet) {
            this.#spritesheetEl.setSpritesheet(this.#spritesheet)
        }

        // Listen for frame clicks to add to timeline
        this.#spritesheetEl.addEventListener('frameclick', (e) => {
            this.#addFrameToTimeline(e.detail)
        })

        panel.appendChild(header)
        panel.appendChild(this.#spritesheetEl)
        this.#overlayEl.appendChild(panel)

        // Close on backdrop click
        this.#overlayEl.addEventListener('close', () => this.#closeSpritesheetOverlay())
    }


    #openSpritesheetOverlay () {
        this.#overlayEl.open()
    }


    #closeSpritesheetOverlay () {
        this.#overlayEl.close()
    }


    #addFrameToTimeline ({name, region}) {
        if (!this.#selectedAnimation || !region) {
            return
        }

        this.#selectedAnimation.frames.push({region, name})
        this.#timelineEl.setFrames(this.#selectedAnimation.frames)
        this.#updateFramesCount()

        // Visual feedback - flash the last frame
        requestAnimationFrame(() => {
            const frames = this.#timelineEl.shadowRoot?.querySelectorAll('.frame')
            const lastFrame = frames?.[frames.length - 1]
            if (lastFrame) {
                lastFrame.classList.add('just-added')
                lastFrame.addEventListener('animationend', () => {
                    lastFrame.classList.remove('just-added')
                }, {once: true})
            }
        })
    }


    #setupTimelineEvents () {
        this.#timelineEl.addEventListener('frameclick', (e) => {
            this.#previewEl?.setCurrentIndex(e.detail.index)
        })

        this.#timelineEl.addEventListener('framedrop', (e) => {
            this.#handleFrameDrop(e.detail)
        })

        this.#timelineEl.addEventListener('framemove', (e) => {
            this.#handleFrameMove(e.detail)
        })

        this.#timelineEl.addEventListener('framedelete', (e) => {
            this.#handleFrameDelete(e.detail)
        })

        this.#timelineEl.addEventListener('frameduration', (e) => {
            this.#handleFrameDuration(e.detail)
        })
    }


    #updateForSelectedAnimation () {
        if (this.#selectedAnimation) {
            this.#timelineEl?.setFrames(this.#selectedAnimation.frames)
            this.#previewEl?.setAnimation(this.#selectedAnimation)
        }

        // Rebuild header controls
        this.#appLayout.querySelectorAll('[slot^="header"]').forEach(el => el.remove())
        this.#buildHeaderControls()
    }


    #handleFrameDrop ({index, frameName}) {
        if (!this.#selectedAnimation || !this.#spritesheet) {
            return
        }

        const region = this.#spritesheet.getRegion(frameName)
        if (!region) {
            return
        }

        this.#selectedAnimation.frames.splice(index, 0, {region, name: frameName})
        this.#timelineEl.setFrames(this.#selectedAnimation.frames)
        this.#updateFramesCount()
    }


    #handleFrameMove ({fromIndex, toIndex}) {
        if (!this.#selectedAnimation) {
            return
        }

        const frames = this.#selectedAnimation.frames
        const [moved] = frames.splice(fromIndex, 1)
        const insertIndex = fromIndex < toIndex ? toIndex - 1 : toIndex
        frames.splice(insertIndex, 0, moved)

        this.#timelineEl.setFrames(frames)
        this.#timelineEl.flashMovedFrame(insertIndex)
    }


    #handleFrameDelete ({index}) {
        if (!this.#selectedAnimation) {
            return
        }

        this.#selectedAnimation.frames.splice(index, 1)
        this.#timelineEl.setFrames(this.#selectedAnimation.frames)
        this.#updateFramesCount()
    }


    #handleFrameDuration ({index, duration}) {
        if (!this.#selectedAnimation) {
            return
        }

        const frame = this.#selectedAnimation.frames[index]
        if (frame) {
            frame.duration = duration
            this.#timelineEl.setFrames(this.#selectedAnimation.frames)
        }
    }


    #updateFramesCount () {
        // Could update a counter in toolbar if needed
    }


    #exportToClipboard (btn) {
        if (!this.#animator) {
            return
        }

        const config = {}
        for (const anim of this.#animator.children) {
            config[anim.$id] = this.#buildAnimationConfig(anim)
        }

        const text = `static animations = ${JSON.stringify(config, null, 4)}`

        navigator.clipboard.writeText(text).then(() => {
            if (btn) {
                const orig = btn.textContent
                btn.textContent = 'Copied!'
                btn.classList.add('success')
                setTimeout(() => {
                    btn.textContent = orig
                    btn.classList.remove('success')
                }, 1500)
            }
        })
    }


    #buildAnimationConfig (anim) {
        const config = {
            fps: anim.fps,
            loop: anim.loop
        }

        if (anim.playbackMode !== 'forward') {
            config.playbackMode = anim.playbackMode
        }

        config.frames = anim.frames.map(frame => {
            const fc = {}
            if (frame.source) {
                fc.source = frame.source
            } else if (frame.name) {
                fc.source = `${this.#spritesheet?.$id || 'spritesheet'}:${frame.name}`
            }
            if (frame.duration && frame.duration !== 1) {
                fc.duration = frame.duration
            }
            if (frame.events?.length) {
                fc.events = [...frame.events]
            }
            return fc
        })

        return config
    }

}


customElements.define('animator-view', AnimatorView)
