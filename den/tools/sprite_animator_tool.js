import BaseFloatingTool from '../../editor/tools/base_floating_tool.js'
import {ICONS} from '../../editor/devtools/devtools_icons.js'
import '../../editor/tools/animation_preview.js'
import '../../editor/tools/animation_timeline.js'
import '../../editor/tools/spritesheet_viewer.js'
import '../../editor/number_input.js'
import SpriteAnimator from '../../render/sprite_animator.js'


export default class SpriteAnimatorTool extends BaseFloatingTool {

    static toolId = 'spriteAnimator'
    static toolName = 'Sprite Animator'
    static toolIcon = ICONS.clapperboard
    static defaultWidth = 600
    static defaultHeight = 450

    #contentEl = null
    #timelineEl = null
    #previewEl = null
    #spritesheetViewerEl = null
    #animators = {}
    #animatorConfig = null
    #animator = null
    #spritesheet = null
    #selectedAnimation = null

    connectedCallback () {
        this.#buildDOM()
    }


    onOptionsSet () {
        this.#animators = this.options.animators || {}
    }


    #buildDOM () {
        const style = document.createElement('style')
        style.textContent = STYLES
        this.shadowRoot.appendChild(style)

        this.#contentEl = document.createElement('div')
        this.#contentEl.className = 'animator-content'
        this.shadowRoot.appendChild(this.#contentEl)

        this.#render()
    }


    onParamsSet () {
        const {animator, animatorName, spritesheet} = this.params

        const resolvedName = animatorName || this.#getDefaultAnimatorName()
        this.#selectAnimator(resolvedName, {animator, spritesheet})
    }


    #getDefaultAnimatorName () {
        const animatorNames = Object.keys(this.#animators)
        return animatorNames.length > 0 ? animatorNames[0] : null
    }


    #selectAnimator (name, {animator, spritesheet} = {}) {
        const animatorConfig = name ? this.#animators[name] : null
        this.#animatorConfig = animatorConfig || null
        this.#animator = this.#resolveAnimator(animator, animatorConfig)
        this.#spritesheet = this.#resolveSpritesheet(spritesheet, animatorConfig)
        this.#selectedAnimation = null
        this.#render()
    }


    #resolveAnimator (animator, animatorConfig) {
        if (animator) {
            return animator
        }

        const {textureSystem} = this.params
        if (animatorConfig && textureSystem) {
            return new SpriteAnimator({
                sprite: null,
                config: animatorConfig,
                textureSystem
            })
        }

        return null
    }


    #resolveSpritesheet (spritesheet, animatorConfig) {
        if (spritesheet) {
            return spritesheet
        }

        const {textureSystem} = this.params
        if (animatorConfig && textureSystem) {
            const spritesheetId = animatorConfig.spritesheet
            return spritesheetId ? textureSystem.getSpritesheet(spritesheetId) : null
        }

        return null
    }


    #render () {
        if (!this.#contentEl) {
            return
        }

        if (!this.#animator) {
            this.#renderNoAnimator()
            return
        }

        this.#renderAnimator()
    }


    #renderNoAnimator () {
        this.#contentEl.innerHTML = `
            <div class="no-animator">
                <p>No animator provided</p>
                <p class="hint">Open with: animatorClass + textureSystem</p>
            </div>
        `
    }


    #renderAnimator () {
        const animations = this.#animator.children

        if (!this.#selectedAnimation && animations.length > 0) {
            this.#selectedAnimation = animations[0]
        }

        const hasAnimators = Object.keys(this.#animators).length > 0

        this.#contentEl.innerHTML = `
            ${hasAnimators ? `
            <div class="animator-topbar">
                <select class="animator-select"></select>
                <button class="export-all-btn" title="Copy animator config to clipboard">Export</button>
            </div>
            ` : ''}
            <div class="animator-header">
                <select class="animation-select"></select>
                <div class="animation-info"></div>
            </div>
            <div class="animator-main">
                <div class="animator-left">
                    <animation-preview></animation-preview>
                </div>
                <div class="animator-right">
                    <animation-timeline></animation-timeline>
                    <spritesheet-viewer></spritesheet-viewer>
                </div>
            </div>
        `

        if (hasAnimators) {
            this.#setupAnimatorSelect()
            this.#setupExportAllButton()
        }
        this.#renderAnimationSelect(animations)
        this.#renderAnimationInfo()
        this.#setupPreview()
        this.#setupTimeline()
        this.#setupSpritesheetViewer()
    }


    #setupAnimatorSelect () {
        const select = this.#contentEl.querySelector('.animator-select')

        for (const [name, animatorEntry] of Object.entries(this.#animators)) {
            const option = document.createElement('option')
            option.value = name
            option.textContent = name
            option.selected = animatorEntry === this.#animatorConfig
            select.appendChild(option)
        }

        select.addEventListener('change', (e) => {
            this.#selectAnimator(e.target.value)
        })
    }


    #setupExportAllButton () {
        const btn = this.#contentEl.querySelector('.export-all-btn')
        btn.addEventListener('click', () => this.#exportAnimatorToClipboard())
    }


    #exportAnimatorToClipboard () {
        if (!this.#animator) {
            return
        }

        const fullConfig = this.#buildFullConfig()
        const text = `static animations = ${JSON.stringify(fullConfig, null, 4)}`

        navigator.clipboard.writeText(text).then(() => {
            const btn = this.#contentEl.querySelector('.export-all-btn')
            const original = btn.textContent
            btn.textContent = 'Copied!'
            setTimeout(() => {
                btn.textContent = original
            }, 1500)
        })
    }


    #buildFullConfig () {
        const config = {}

        for (const anim of this.#animator.children) {
            config[anim.$id] = this.#buildAnimationConfig(anim)
        }

        return config
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
            const frameConfig = {}

            if (frame.source) {
                frameConfig.source = frame.source
            } else if (frame.name) {
                frameConfig.source = `${this.#spritesheet?.$id || 'spritesheet'}:${frame.name}`
            }

            if (frame.duration && frame.duration !== 1) {
                frameConfig.duration = frame.duration
            }

            if (frame.events && frame.events.length > 0) {
                frameConfig.events = [...frame.events]
            }

            return frameConfig
        })

        return config
    }


    #renderAnimationSelect (animations) {
        const select = this.#contentEl.querySelector('.animation-select')

        for (const anim of animations) {
            const option = document.createElement('option')
            option.value = anim.$id
            option.textContent = anim.$id
            option.selected = anim === this.#selectedAnimation
            select.appendChild(option)
        }

        select.addEventListener('change', (e) => {
            this.#selectedAnimation = this.#animator.get(e.target.value)
            this.#renderAnimationInfo()
            this.#timelineEl?.setFrames(this.#selectedAnimation.frames)
            this.#previewEl?.setAnimation(this.#selectedAnimation)
        })
    }


    #renderAnimationInfo () {
        const infoEl = this.#contentEl.querySelector('.animation-info')

        if (!this.#selectedAnimation) {
            infoEl.textContent = ''
            return
        }

        const anim = this.#selectedAnimation
        infoEl.innerHTML = `
            <label class="info-item">
                loop: <input type="checkbox" class="loop-input" ${anim.loop ? 'checked' : ''}>
            </label>
            <label class="info-item">
                mode: <select class="playback-select">
                    <option value="forward" ${anim.playbackMode === 'forward' ? 'selected' : ''}>forward</option>
                    <option value="reverse" ${anim.playbackMode === 'reverse' ? 'selected' : ''}>reverse</option>
                    <option value="pingpong" ${anim.playbackMode === 'pingpong' ? 'selected' : ''}>pingpong</option>
                </select>
            </label>
            <span class="info-item frames-count">frames: ${anim.totalFrames}</span>
        `

        const fpsInput = document.createElement('number-input')
        fpsInput.className = 'fps-input'
        fpsInput.setLabel('fps')
        fpsInput.setValue(anim.fps)
        fpsInput.setStep(1)
        fpsInput.setPrecision(0)
        fpsInput.setMin(1)
        fpsInput.setMax(60)
        infoEl.insertBefore(fpsInput, infoEl.firstChild)

        setupAnimationInfoListeners(infoEl, anim)
    }


    #setupTimeline () {
        this.#timelineEl = this.#contentEl.querySelector('animation-timeline')

        if (this.#selectedAnimation) {
            this.#timelineEl.setFrames(this.#selectedAnimation.frames)
        }

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


    #handleFrameDrop ({index, frameName}) {
        if (!this.#selectedAnimation || !this.#spritesheet) {
            return
        }

        const region = this.#spritesheet.getRegion(frameName)
        if (!region) {
            return
        }

        const newFrame = {region, name: frameName}
        this.#selectedAnimation.frames.splice(index, 0, newFrame)

        this.#timelineEl.setFrames(this.#selectedAnimation.frames)
        this.#renderAnimationInfo()
    }


    #handleFrameMove ({fromIndex, toIndex}) {
        if (!this.#selectedAnimation) {
            return
        }

        const frames = this.#selectedAnimation.frames
        const [movedFrame] = frames.splice(fromIndex, 1)

        const insertIndex = fromIndex < toIndex ? toIndex - 1 : toIndex
        frames.splice(insertIndex, 0, movedFrame)

        this.#timelineEl.setFrames(frames)
    }


    #handleFrameDelete ({index}) {
        if (!this.#selectedAnimation) {
            return
        }

        const frames = this.#selectedAnimation.frames
        if (index < 0 || index >= frames.length) {
            return
        }

        frames.splice(index, 1)
        this.#timelineEl.setFrames(frames)
        this.#renderAnimationInfo()
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


    #setupPreview () {
        this.#previewEl = this.#contentEl.querySelector('animation-preview')

        if (this.#selectedAnimation) {
            this.#previewEl.setAnimation(this.#selectedAnimation)
        }

        this.#previewEl.addEventListener('frame', (e) => {
            this.#timelineEl?.setCurrentIndex(e.detail.index)
        })

        this.#previewEl.addEventListener('stop', () => {
            this.#timelineEl?.setCurrentIndex(0)
        })
    }


    #setupSpritesheetViewer () {
        this.#spritesheetViewerEl = this.#contentEl.querySelector('spritesheet-viewer')

        if (this.#spritesheet) {
            this.#spritesheetViewerEl.setSpritesheet(this.#spritesheet)
        }
    }

}


function setupAnimationInfoListeners (infoEl, anim) {
    const fpsInput = infoEl.querySelector('.fps-input')
    const loopInput = infoEl.querySelector('.loop-input')
    const playbackSelect = infoEl.querySelector('.playback-select')

    fpsInput.addEventListener('change', (e) => {
        anim.setFps(e.detail.value)
    })

    loopInput.addEventListener('change', (e) => {
        anim.setLoop(e.target.checked)
    })

    playbackSelect.addEventListener('change', (e) => {
        anim.setPlaybackMode(e.target.value)
    })
}


const STYLES = SpriteAnimatorTool.buildStyles(`
    .animator-content {
        color: var(--fg-primary);
        font-family: var(--font-mono);
        font-size: 12px;
        display: flex;
        flex-direction: column;
        height: 100%;
        gap: 12px;
    }

    .no-animator {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100%;
        color: var(--fg-muted);
        gap: 8px;
    }

    .no-animator .hint {
        font-size: 10px;
        color: var(--fg-muted);
    }

    .animator-topbar {
        display: flex;
        align-items: center;
        gap: 12px;
        flex-shrink: 0;
        padding-bottom: 8px;
        border-bottom: 1px solid var(--bg-hover);
    }

    .animator-topbar .animator-select {
        flex: 1;
    }

    .export-all-btn {
        width: 100px;
        background: var(--bg-hover);
        color: var(--fg-secondary);
        border: none;
        border-radius: 4px;
        padding: 6px 12px;
        font-family: inherit;
        font-size: 11px;
        cursor: pointer;
        transition: background 0.15s, color 0.15s;
    }

    .export-all-btn:hover {
        background: var(--bg-selected);
        color: var(--fg-primary);
    }

    .animator-header {
        display: flex;
        align-items: center;
        gap: 12px;
        flex-shrink: 0;
    }

    .animator-select,
    .animation-select {
        background: var(--bg-secondary);
        color: var(--fg-primary);
        border: none;
        border-radius: 4px;
        padding: 6px 10px;
        font-family: inherit;
        font-size: 12px;
        cursor: pointer;
        transition: background 0.15s;
    }

    .animator-select:hover,
    .animation-select:hover {
        background: var(--bg-hover);
    }

    .animator-select:focus,
    .animation-select:focus {
        outline: none;
        background: var(--bg-hover);
    }

    .animation-info {
        display: flex;
        gap: 16px;
        color: var(--fg-secondary);
        font-size: 11px;
        flex: 1;
        align-items: center;
    }

    .info-item {
        display: flex;
        align-items: center;
        gap: 6px;
        color: var(--fg-muted);
    }

    .info-item input[type="checkbox"] {
        accent-color: var(--accent);
    }

    .info-item select {
        background: transparent;
        color: var(--fg-secondary);
        border: none;
        padding: 2px 4px;
        font-family: inherit;
        font-size: 11px;
        cursor: pointer;
        transition: color 0.15s;
    }

    .info-item select:hover {
        color: var(--fg-primary);
    }

    .info-item select:focus {
        outline: none;
        color: var(--fg-primary);
    }

    .fps-input {
        width: 90px;
    }

    .frames-count {
        margin-left: auto;
    }

    .animator-main {
        display: flex;
        gap: 12px;
        flex: 1;
        min-height: 0;
    }

    .animator-left {
        flex-shrink: 0;
    }

    .animator-right {
        display: flex;
        flex-direction: column;
        gap: 12px;
        flex: 1;
        min-width: 0;
    }

    animation-timeline {
        flex-shrink: 0;
    }

    spritesheet-viewer {
        flex: 1;
        min-height: 80px;
    }
`)


customElements.define('sprite-animator-tool', SpriteAnimatorTool)
