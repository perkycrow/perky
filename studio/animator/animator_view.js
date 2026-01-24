import BaseEditorComponent from '../../editor/base_editor_component.js'
import {adoptStyles, createSheet} from '../../editor/styles/index.js'
import '../../editor/layout/app_layout.js'
import '../../editor/layout/overlay.js'
import '../../editor/tools/animation_preview.js'
import '../../editor/tools/animation_timeline.js'
import '../../editor/tools/spritesheet_viewer.js'
import '../../editor/layout/side_drawer.js'
import '../../editor/number_input.js'
import '../../editor/select_input.js'
import '../../editor/toggle_input.js'


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


    .preview-section {
        flex: 1;
        min-height: 200px;
        overflow: hidden;
    }

    .preview-section animation-preview {
        width: 100%;
        height: 100%;
    }


    .header-controls,
    .footer-controls {
        display: flex;
        align-items: center;
        gap: var(--spacing-md);
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


    .timeline-section {
        flex-shrink: 0;
        background: var(--bg-secondary);
        border-top: 1px solid var(--border);
        padding: var(--spacing-md) var(--spacing-lg);
        min-height: 120px;
        overflow: hidden;
        max-width: 100%;
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
    #framesDrawerEl = null
    #editorDrawerEl = null
    #spritesheetEl = null
    #selectedFrameIndex = -1

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


        this.#appLayout = document.createElement('app-layout')
        this.#appLayout.setAttribute('no-menu', '')
        this.#appLayout.setAttribute('no-close', '')


        this.#containerEl = document.createElement('div')
        this.#containerEl.className = 'animator-container'
        this.#appLayout.appendChild(this.#containerEl)

        this.shadowRoot.appendChild(this.#appLayout)
    }


    #render () {

        this.#appLayout.querySelectorAll('[slot]').forEach(el => el.remove())
        this.#containerEl.innerHTML = ''

        if (!this.#animator) {
            this.#containerEl.innerHTML = '<div class="empty">No animator loaded</div>'
            return
        }


        this.#buildHeaderControls()


        const previewSection = this.#createPreviewSection()
        this.#containerEl.appendChild(previewSection)

        this.#timelineEl = document.createElement('animation-timeline')
        this.#timelineEl.className = 'timeline-section'
        if (this.#selectedAnimation) {
            this.#timelineEl.setFrames(this.#selectedAnimation.frames)
        }
        this.#setupTimelineEvents()
        this.#containerEl.appendChild(this.#timelineEl)


        this.#buildFooterControls()


        this.#buildDrawers()
    }


    #createPreviewSection () {
        const section = document.createElement('div')
        section.className = 'preview-section'

        this.#previewEl = document.createElement('animation-preview')
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

        const headerStart = document.createElement('div')
        headerStart.className = 'header-controls'
        headerStart.setAttribute('slot', 'header-start')


        const animatorSelect = document.createElement('select-input')
        animatorSelect.setAttribute('context', 'studio')
        const animatorNames = Object.keys(this.#animators)
        const currentAnimatorName = animatorNames.find(name => this.#animators[name] === this.#animatorClass)
        animatorSelect.setOptions(animatorNames)
        animatorSelect.setValue(currentAnimatorName)
        animatorSelect.addEventListener('change', (e) => {
            this.#selectAnimator(e.detail.value)
        })


        const animSelect = document.createElement('select-input')
        animSelect.setAttribute('context', 'studio')
        const animOptions = this.#animator.children.map(anim => ({value: anim.$id, label: anim.$id}))
        animSelect.setOptions(animOptions)
        animSelect.setValue(this.#selectedAnimation?.$id)
        animSelect.addEventListener('change', (e) => {
            this.#selectedAnimation = this.#animator.getChild(e.detail.value)
            this.#updateForSelectedAnimation()
        })

        headerStart.appendChild(animatorSelect)
        headerStart.appendChild(animSelect)
        this.#appLayout.appendChild(headerStart)


        if (this.#selectedAnimation) {
            const headerEnd = document.createElement('div')
            headerEnd.className = 'header-controls'
            headerEnd.setAttribute('slot', 'header-end')

            const anim = this.#selectedAnimation


            const fpsInput = document.createElement('number-input')
            fpsInput.setAttribute('context', 'studio')
            fpsInput.setLabel('FPS')
            fpsInput.setValue(anim.fps)
            fpsInput.setStep(1)
            fpsInput.setPrecision(0)
            fpsInput.setMin(1)
            fpsInput.setMax(60)
            fpsInput.addEventListener('change', (e) => {
                anim.setFps(e.detail.value)
            })


            const loopToggle = document.createElement('toggle-input')
            loopToggle.setAttribute('context', 'studio')
            loopToggle.setLabel('Loop')
            loopToggle.setChecked(anim.loop)
            loopToggle.addEventListener('change', (e) => {
                anim.setLoop(e.detail.checked)
            })


            const modeSelect = document.createElement('select-input')
            modeSelect.setAttribute('context', 'studio')
            modeSelect.setOptions([
                {value: 'forward', label: 'Forward'},
                {value: 'reverse', label: 'Reverse'},
                {value: 'pingpong', label: 'Ping-pong'}
            ])
            modeSelect.setValue(anim.playbackMode)
            modeSelect.addEventListener('change', (e) => {
                anim.setPlaybackMode(e.detail.value)
            })

            headerEnd.appendChild(fpsInput)
            headerEnd.appendChild(loopToggle)
            headerEnd.appendChild(modeSelect)
            this.#appLayout.appendChild(headerEnd)
        }
    }


    #buildFooterControls () {

        const footerStart = document.createElement('div')
        footerStart.className = 'footer-controls'
        footerStart.setAttribute('slot', 'footer-start')

        const addBtn = document.createElement('button')
        addBtn.className = 'toolbar-btn toolbar-btn-primary'
        addBtn.innerHTML = '+'
        addBtn.title = 'Add frames from spritesheet'
        addBtn.addEventListener('click', () => this.#toggleFramesDrawer())

        footerStart.appendChild(addBtn)
        this.#appLayout.appendChild(footerStart)


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


    #buildDrawers () {
        this.#framesDrawerEl = document.createElement('side-drawer')
        this.#framesDrawerEl.setAttribute('position', 'left')
        this.#framesDrawerEl.setAttribute('title', 'Frames')

        this.#spritesheetEl = document.createElement('spritesheet-viewer')
        if (this.#spritesheet) {
            this.#spritesheetEl.setSpritesheet(this.#spritesheet)
        }

        this.#spritesheetEl.addEventListener('frameclick', (e) => {
            this.#addFrameToTimeline(e.detail)
        })

        this.#framesDrawerEl.appendChild(this.#spritesheetEl)
        this.#containerEl.appendChild(this.#framesDrawerEl)

        this.#editorDrawerEl = document.createElement('side-drawer')
        this.#editorDrawerEl.setAttribute('position', 'right')
        this.#editorDrawerEl.setAttribute('title', 'Frame')
        this.#containerEl.appendChild(this.#editorDrawerEl)
    }


    #toggleFramesDrawer () {
        this.#framesDrawerEl?.toggle()
    }


    #updateEditorDrawer () {
        if (this.#selectedFrameIndex < 0) {
            this.#editorDrawerEl?.close()
            return
        }

        const frame = this.#selectedAnimation?.frames[this.#selectedFrameIndex]
        if (!frame) {
            this.#editorDrawerEl?.close()
            return
        }

        this.#editorDrawerEl.innerHTML = ''
        this.#buildFrameEditor(frame)
        this.#editorDrawerEl.open()
    }


    #buildFrameEditor (frame) {
        const container = document.createElement('div')
        container.style.cssText = 'display: flex; flex-direction: column; gap: var(--spacing-md);'

        const durationInput = document.createElement('number-input')
        durationInput.setAttribute('context', 'studio')
        durationInput.setLabel('Duration')
        durationInput.setValue(frame.duration || 1)
        durationInput.setStep(0.1)
        durationInput.setPrecision(1)
        durationInput.setMin(0.1)
        durationInput.setMax(10)
        durationInput.addEventListener('change', (e) => {
            frame.duration = e.detail.value
            this.#timelineEl.setFrames(this.#selectedAnimation.frames)
        })

        container.appendChild(durationInput)
        this.#editorDrawerEl.appendChild(container)
    }


    #addFrameToTimeline ({name, region}) {
        if (!this.#selectedAnimation || !region) {
            return
        }

        this.#selectedAnimation.frames.push({region, name})
        this.#timelineEl.setFrames(this.#selectedAnimation.frames)
        this.#updateFramesCount()


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

        this.#timelineEl.addEventListener('frameselect', (e) => {
            this.#handleFrameSelect(e.detail)
        })
    }


    #handleFrameSelect ({index}) {
        this.#selectedFrameIndex = index
        this.#updateEditorDrawer()
    }


    #updateForSelectedAnimation () {
        if (this.#selectedAnimation) {
            this.#timelineEl?.setFrames(this.#selectedAnimation.frames)
            this.#previewEl?.setAnimation(this.#selectedAnimation)
        }


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

        if (this.#selectedFrameIndex === index) {
            this.#selectedFrameIndex = -1
            this.#timelineEl.clearSelection()
            this.#updateEditorDrawer()
        } else if (this.#selectedFrameIndex > index) {
            this.#selectedFrameIndex--
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
