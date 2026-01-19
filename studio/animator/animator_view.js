import BaseEditorComponent from '../../editor/base_editor_component.js'
import {buildEditorStyles, editorBaseStyles, editorScrollbarStyles} from '../../editor/editor_theme.js'
import '../../editor/tools/animation_preview.js'
import '../../editor/tools/animation_timeline.js'
import '../../editor/tools/spritesheet_viewer.js'
import '../../editor/number_input.js'


export default class AnimatorView extends BaseEditorComponent {

    #context = null
    #animators = {}
    #animatorClass = null
    #animator = null
    #spritesheet = null
    #selectedAnimation = null

    #containerEl = null
    #toolbarEl = null
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
        const style = document.createElement('style')
        style.textContent = STYLES
        this.shadowRoot.appendChild(style)

        this.#containerEl = document.createElement('div')
        this.#containerEl.className = 'animator-container'
        this.shadowRoot.appendChild(this.#containerEl)

        // Spritesheet overlay (hidden by default)
        this.#overlayEl = document.createElement('div')
        this.#overlayEl.className = 'spritesheet-overlay'
        this.#overlayEl.addEventListener('click', (e) => {
            if (e.target === this.#overlayEl) {
                this.#closeSpritesheetOverlay()
            }
        })
        this.shadowRoot.appendChild(this.#overlayEl)
    }


    #render () {
        this.#containerEl.innerHTML = ''

        if (!this.#animator) {
            this.#containerEl.innerHTML = '<div class="empty">No animator loaded</div>'
            return
        }

        // Preview section (takes most space)
        const previewSection = this.#createPreviewSection()
        this.#containerEl.appendChild(previewSection)

        // Toolbar (compact, below preview)
        this.#toolbarEl = this.#createToolbar()
        this.#containerEl.appendChild(this.#toolbarEl)

        // Timeline (bottom)
        this.#timelineEl = document.createElement('animation-timeline')
        this.#timelineEl.className = 'timeline-section'
        if (this.#selectedAnimation) {
            this.#timelineEl.setFrames(this.#selectedAnimation.frames)
        }
        this.#setupTimelineEvents()
        this.#containerEl.appendChild(this.#timelineEl)

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


    #createToolbar () {
        const toolbar = document.createElement('div')
        toolbar.className = 'toolbar'

        // Left group: selects
        const leftGroup = document.createElement('div')
        leftGroup.className = 'toolbar-group'

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

        leftGroup.appendChild(animatorSelect)
        leftGroup.appendChild(animSelect)

        // Center group: config
        const centerGroup = document.createElement('div')
        centerGroup.className = 'toolbar-group toolbar-config'

        if (this.#selectedAnimation) {
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
            for (const mode of ['forward', 'reverse', 'pingpong']) {
                const opt = document.createElement('option')
                opt.value = mode
                opt.textContent = mode === 'pingpong' ? '↔' : mode === 'reverse' ? '←' : '→'
                opt.selected = anim.playbackMode === mode
                modeSelect.appendChild(opt)
            }
            modeSelect.title = 'Playback mode'
            modeSelect.addEventListener('change', (e) => {
                anim.setPlaybackMode(e.target.value)
            })

            centerGroup.appendChild(fpsInput)
            centerGroup.appendChild(loopBtn)
            centerGroup.appendChild(modeSelect)
        }

        // Right group: actions
        const rightGroup = document.createElement('div')
        rightGroup.className = 'toolbar-group'

        // Add frames button
        const addBtn = document.createElement('button')
        addBtn.className = 'toolbar-btn toolbar-btn-primary'
        addBtn.innerHTML = '+'
        addBtn.title = 'Add frames from spritesheet'
        addBtn.addEventListener('click', () => this.#openSpritesheetOverlay())

        // Export button
        const exportBtn = document.createElement('button')
        exportBtn.className = 'toolbar-btn'
        exportBtn.textContent = 'Export'
        exportBtn.addEventListener('click', () => this.#exportToClipboard(exportBtn))

        rightGroup.appendChild(addBtn)
        rightGroup.appendChild(exportBtn)

        toolbar.appendChild(leftGroup)
        toolbar.appendChild(centerGroup)
        toolbar.appendChild(rightGroup)

        return toolbar
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
    }


    #openSpritesheetOverlay () {
        this.#overlayEl.classList.add('visible')
    }


    #closeSpritesheetOverlay () {
        this.#overlayEl.classList.remove('visible')
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
        // Rebuild toolbar
        const oldToolbar = this.#toolbarEl
        this.#toolbarEl = this.#createToolbar()
        oldToolbar?.replaceWith(this.#toolbarEl)
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


const STYLES = buildEditorStyles(
    editorBaseStyles,
    editorScrollbarStyles,
    `
    :host {
        display: block;
        height: 100%;
        background: #121216;
        color: var(--fg-primary);
        font-family: var(--font-mono);
        font-size: 12px;
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
        padding: 24px;
        min-height: 200px;
        background: #0d0d10;
    }

    .preview-canvas {
        max-width: 100%;
        max-height: 100%;
    }

    /* Toolbar */
    .toolbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 12px 16px;
        background: #1a1a1e;
        border-top: 1px solid #2a2a30;
        flex-shrink: 0;
    }

    .toolbar-group {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .toolbar-config {
        gap: 12px;
    }

    .toolbar-select {
        appearance: none;
        background: #24242a;
        color: var(--fg-primary);
        border: none;
        border-radius: 8px;
        padding: 10px 14px;
        font-family: inherit;
        font-size: 13px;
        min-width: 120px;
        cursor: pointer;
        transition: background 0.15s;
    }

    .toolbar-select:hover {
        background: #2e2e36;
    }

    .toolbar-select:focus {
        outline: none;
        background: #2e2e36;
    }

    .toolbar-select-small {
        min-width: 50px;
        padding: 10px 12px;
        text-align: center;
    }

    .toolbar-btn {
        appearance: none;
        background: #24242a;
        color: var(--fg-secondary);
        border: none;
        border-radius: 8px;
        padding: 10px 16px;
        font-family: inherit;
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
        transition: background 0.15s, color 0.15s, transform 0.1s;
        min-height: 44px;
        min-width: 44px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .toolbar-btn:hover {
        background: #2e2e36;
        color: var(--fg-primary);
    }

    .toolbar-btn:active {
        transform: scale(0.96);
    }

    .toolbar-btn-primary {
        background: var(--accent);
        color: #121216;
        font-size: 20px;
        font-weight: 400;
    }

    .toolbar-btn-primary:hover {
        background: #7daaff;
        color: #121216;
    }

    .toolbar-toggle {
        font-size: 16px;
    }

    .toolbar-toggle.active {
        background: var(--accent);
        color: #121216;
    }

    .toolbar-btn.success {
        background: var(--status-success);
        color: #121216;
    }

    .config-input {
        width: 80px;
    }

    /* Timeline */
    .timeline-section {
        flex-shrink: 0;
        background: #1a1a1e;
        border-top: 1px solid #2a2a30;
        padding: 12px 16px;
        min-height: 120px;
        overflow: hidden;
        max-width: 100%;
    }

    /* Spritesheet overlay */
    .spritesheet-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 150px;
        background: rgba(0, 0, 0, 0.9);
        z-index: 1000;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.2s;
    }

    .spritesheet-overlay.visible {
        opacity: 1;
        pointer-events: auto;
    }

    .spritesheet-panel {
        background: #1a1a1e;
        border-radius: 16px;
        width: 90%;
        max-width: 900px;
        height: 80%;
        max-height: 700px;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        box-shadow: 0 24px 48px rgba(0, 0, 0, 0.4);
        transform: scale(0.95);
        transition: transform 0.2s;
    }

    .spritesheet-overlay.visible .spritesheet-panel {
        transform: scale(1);
    }

    .spritesheet-header {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 16px 20px;
        background: #24242a;
        flex-shrink: 0;
    }

    .spritesheet-close {
        appearance: none;
        background: #2e2e36;
        border: none;
        color: var(--fg-secondary);
        width: 44px;
        height: 44px;
        border-radius: 12px;
        font-size: 18px;
        cursor: pointer;
        transition: background 0.15s, color 0.15s;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .spritesheet-close:hover {
        background: #3a3a44;
        color: var(--fg-primary);
    }

    .spritesheet-title {
        font-size: 16px;
        font-weight: 500;
        color: var(--fg-primary);
    }

    .spritesheet-content {
        flex: 1;
        padding: 16px;
        overflow: auto;
    }
`
)


customElements.define('animator-view', AnimatorView)
