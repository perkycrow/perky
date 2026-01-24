import BaseEditorComponent from '../../editor/base_editor_component.js'
import {adoptStyles, createSheet} from '../../editor/styles/index.js'
import '../../editor/layout/app_layout.js'
import '../../editor/layout/overlay.js'
import '../../editor/tools/animation_preview.js'
import '../../editor/tools/animation_timeline.js'
import '../../editor/tools/spritesheet_viewer.js'
import '../../editor/layout/side_drawer.js'
import '../../editor/number_input.js'
import '../../editor/slider_input.js'
import '../../editor/select_input.js'
import '../../editor/toggle_input.js'
import '../../editor/dropdown_menu.js'
import {ICONS} from '../../editor/devtools/devtools_icons.js'


const animatorStyles = createSheet(`
    :host {
        display: block;
        height: 100%;
        background: var(--bg-primary);
        color: var(--fg-primary);
        font-family: var(--font-mono);
        font-size: 12px;
        position: relative;
    }

    app-layout {
        height: 100%;
    }

    .animator-container {
        display: flex;
        flex-direction: column;
        height: 100%;
        overflow: hidden;
        position: relative;
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
        position: relative;
    }

    .preview-section animation-preview {
        width: 100%;
        height: 100%;
    }


    .header-controls {
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

    .toolbar-btn svg {
        width: 18px;
        height: 18px;
        stroke: currentColor;
        fill: none;
        stroke-width: 2;
        stroke-linecap: round;
        stroke-linejoin: round;
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


    .frame-editor {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-lg);
    }

    .frame-editor-preview {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--spacing-sm);
    }

    .frame-editor-canvas {
        background: var(--bg-tertiary);
        border-radius: var(--radius-md);
        image-rendering: pixelated;
        image-rendering: crisp-edges;
    }

    .frame-editor-name {
        font-size: var(--font-size-sm);
        color: var(--fg-muted);
        text-align: center;
        max-width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .frame-editor-section {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-sm);
    }

    .frame-editor-label {
        font-size: var(--font-size-sm);
        font-weight: 500;
        color: var(--fg-secondary);
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    .frame-editor-duration {
        display: flex;
        align-items: center;
        gap: var(--spacing-md);
    }

    .frame-editor-duration slider-input {
        flex: 1;
        min-width: 0;
    }

    .frame-editor-duration number-input {
        flex-shrink: 0;
    }

    .frame-editor-events {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-sm);
    }

    .event-chip {
        display: inline-flex;
        align-items: center;
        gap: var(--spacing-xs);
        background: var(--bg-tertiary);
        border-radius: var(--radius-md);
        padding: var(--spacing-xs) var(--spacing-sm);
        font-size: var(--font-size-sm);
        color: var(--fg-primary);
    }

    .event-chip-remove {
        appearance: none;
        background: transparent;
        border: none;
        color: var(--fg-muted);
        font-size: 14px;
        width: 20px;
        height: 20px;
        padding: 0;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: var(--radius-sm);
        transition: background var(--transition-fast), color var(--transition-fast);
    }

    .event-chip-remove:hover {
        background: var(--status-error);
        color: white;
    }

    .event-suggestions {
        display: flex;
        flex-wrap: wrap;
        gap: var(--spacing-xs);
    }

    .event-suggestion {
        appearance: none;
        background: transparent;
        border: 1px dashed var(--border);
        border-radius: var(--radius-md);
        padding: var(--spacing-xs) var(--spacing-sm);
        font-size: var(--font-size-sm);
        font-family: var(--font-mono);
        color: var(--fg-muted);
        cursor: pointer;
        transition: background var(--transition-fast), color var(--transition-fast), border-color var(--transition-fast);
    }

    .event-suggestion:hover {
        background: var(--bg-hover);
        border-color: var(--fg-muted);
        color: var(--fg-primary);
    }

    .event-add-row {
        display: flex;
        gap: var(--spacing-sm);
        margin-top: var(--spacing-xs);
    }

    .event-input {
        flex: 1;
        background: var(--bg-tertiary);
        border: none;
        border-radius: var(--radius-md);
        padding: var(--spacing-sm) var(--spacing-md);
        font-size: var(--font-size-sm);
        font-family: var(--font-mono);
        color: var(--fg-primary);
        min-height: var(--touch-target);
    }

    .event-input:focus {
        outline: 1px solid var(--accent);
    }

    .event-input::placeholder {
        color: var(--fg-muted);
    }

    .event-add-btn {
        appearance: none;
        background: var(--accent);
        border: none;
        border-radius: var(--radius-md);
        padding: var(--spacing-sm) var(--spacing-md);
        font-size: var(--font-size-sm);
        font-family: var(--font-mono);
        font-weight: 500;
        color: var(--bg-primary);
        cursor: pointer;
        min-height: var(--touch-target);
        min-width: var(--touch-target);
        transition: background var(--transition-fast);
    }

    .event-add-btn:hover {
        background: var(--accent-hover);
    }


    .animation-settings {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-lg);
    }

    .settings-section {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-sm);
    }

    .settings-label {
        font-size: var(--font-size-sm);
        font-weight: 500;
        color: var(--fg-secondary);
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    .settings-row {
        display: flex;
        align-items: center;
        gap: var(--spacing-md);
    }

    .settings-row slider-input {
        flex: 1;
        min-width: 0;
    }

    .settings-row number-input {
        flex-shrink: 0;
    }

    .direction-pad {
        display: grid;
        grid-template-columns: repeat(3, 36px);
        grid-template-rows: repeat(3, 36px);
        gap: 2px;
        justify-content: start;
    }

    .direction-btn {
        appearance: none;
        background: var(--bg-tertiary);
        border: 1px solid var(--border);
        border-radius: var(--radius-sm);
        color: var(--fg-muted);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background var(--transition-fast), color var(--transition-fast), border-color var(--transition-fast);
    }

    .direction-btn:hover {
        background: var(--bg-hover);
        color: var(--fg-primary);
    }

    .direction-btn.active {
        background: var(--accent);
        border-color: var(--accent);
        color: var(--bg-primary);
    }

    .direction-btn svg {
        width: 16px;
        height: 16px;
        stroke: currentColor;
        fill: none;
        stroke-width: 2;
        stroke-linecap: round;
        stroke-linejoin: round;
    }

    .direction-btn.center {
        background: transparent;
        border-color: transparent;
        cursor: default;
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
    #previewSectionEl = null
    #previewEl = null
    #timelineEl = null
    #framesDrawerEl = null
    #editorDrawerEl = null
    #spritesheetEl = null
    #selectedFrameIndex = -1
    #drawerMode = null // 'frame' | 'settings'
    #headerAnimSelect = null
    #drawerAnimSelect = null

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
        this.#appLayout.setAttribute('no-footer', '')


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


        this.#previewSectionEl = this.#createPreviewSection()
        this.#containerEl.appendChild(this.#previewSectionEl)

        this.#timelineEl = document.createElement('animation-timeline')
        this.#timelineEl.className = 'timeline-section'
        if (this.#selectedAnimation) {
            this.#timelineEl.setFrames(this.#selectedAnimation.frames)
        }
        this.#setupTimelineEvents()
        this.#containerEl.appendChild(this.#timelineEl)


        this.#buildDrawers()
    }


    #createPreviewSection () {
        const section = document.createElement('div')
        section.className = 'preview-section'

        this.#previewEl = document.createElement('animation-preview')
        if (this.#selectedAnimation) {
            this.#previewEl.setAnimation(this.#selectedAnimation)
            this.#previewEl.setMotion(this.#selectedAnimation.motion)
        }
        this.#previewEl.addEventListener('frame', (e) => {
            this.#timelineEl?.setCurrentIndex(e.detail.index)
        })
        this.#previewEl.addEventListener('settingsrequest', () => {
            this.#toggleAnimationSettings()
        })

        section.appendChild(this.#previewEl)

        return section
    }


    #buildHeaderControls () {

        const headerStart = document.createElement('div')
        headerStart.className = 'header-controls'
        headerStart.setAttribute('slot', 'header-start')


        const backBtn = document.createElement('button')
        backBtn.className = 'toolbar-btn'
        backBtn.innerHTML = ICONS.chevronLeft
        backBtn.title = 'Back to gallery'
        backBtn.addEventListener('click', () => {
            this.dispatchEvent(new CustomEvent('close', {bubbles: true}))
        })
        headerStart.appendChild(backBtn)


        const settingsMenu = document.createElement('dropdown-menu')
        settingsMenu.setIcon(ICONS.wrench)
        settingsMenu.setItems([
            {label: 'Animation Settings', action: () => this.#openAnimationSettings()},
            {label: 'Export', action: () => this.#exportToClipboard()}
        ])
        headerStart.appendChild(settingsMenu)


        const animatorSelect = document.createElement('select-input')
        animatorSelect.setAttribute('context', 'studio')
        const animatorNames = Object.keys(this.#animators)
        const currentAnimatorName = animatorNames.find(name => this.#animators[name] === this.#animatorClass)
        animatorSelect.setOptions(animatorNames)
        animatorSelect.setValue(currentAnimatorName)
        animatorSelect.addEventListener('change', (e) => {
            this.#selectAnimator(e.detail.value)
        })


        this.#headerAnimSelect = document.createElement('select-input')
        this.#headerAnimSelect.setAttribute('context', 'studio')
        const animOptions = this.#animator.children.map(anim => ({value: anim.$id, label: anim.$id}))
        this.#headerAnimSelect.setOptions(animOptions)
        this.#headerAnimSelect.setValue(this.#selectedAnimation?.$id)
        this.#headerAnimSelect.addEventListener('change', (e) => {
            this.#selectedAnimation = this.#animator.getChild(e.detail.value)
            this.#updateForSelectedAnimation()
            this.#syncDrawerAnimSelect()
        })

        headerStart.appendChild(animatorSelect)
        headerStart.appendChild(this.#headerAnimSelect)
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


    #buildDrawers () {
        this.#framesDrawerEl = document.createElement('side-drawer')
        this.#framesDrawerEl.setAttribute('position', 'left')

        this.#spritesheetEl = document.createElement('spritesheet-viewer')
        if (this.#spritesheet) {
            this.#spritesheetEl.setSpritesheet(this.#spritesheet)
        }

        this.#spritesheetEl.addEventListener('frameclick', (e) => {
            this.#addFrameToTimeline(e.detail)
        })

        this.#framesDrawerEl.appendChild(this.#spritesheetEl)
        this.#previewSectionEl.appendChild(this.#framesDrawerEl)

        this.#editorDrawerEl = document.createElement('side-drawer')
        this.#editorDrawerEl.setAttribute('position', 'right')
        this.#previewSectionEl.appendChild(this.#editorDrawerEl)
    }


    #toggleFramesDrawer () {
        this.#framesDrawerEl?.toggle()
    }


    #toggleAnimationSettings () {
        if (this.#editorDrawerEl.isOpen && this.#drawerMode === 'settings') {
            this.#editorDrawerEl.close()
        } else {
            this.#openAnimationSettings()
        }
    }


    #openAnimationSettings () {
        this.#selectedFrameIndex = -1
        this.#timelineEl?.clearSelection()
        this.#drawerMode = 'settings'
        this.#editorDrawerEl.innerHTML = ''
        this.#buildAnimationSettings()
        this.#editorDrawerEl.open()
    }


    #buildAnimationSettings () {
        const container = document.createElement('div')
        container.className = 'animation-settings'

        const animSection = document.createElement('div')
        animSection.className = 'settings-section'

        const animLabel = document.createElement('div')
        animLabel.className = 'settings-label'
        animLabel.textContent = 'Animation'
        animSection.appendChild(animLabel)

        this.#drawerAnimSelect = document.createElement('select-input')
        this.#drawerAnimSelect.setAttribute('context', 'studio')
        const animOptions = this.#animator.children.map(anim => ({value: anim.$id, label: anim.$id}))
        this.#drawerAnimSelect.setOptions(animOptions)
        this.#drawerAnimSelect.setValue(this.#selectedAnimation?.$id)
        this.#drawerAnimSelect.addEventListener('change', (e) => {
            this.#selectedAnimation = this.#animator.getChild(e.detail.value)
            this.#updateForSelectedAnimation()
            this.#headerAnimSelect?.setValue(e.detail.value)
            this.#rebuildAnimationSettingsContent(container)
        })
        animSection.appendChild(this.#drawerAnimSelect)
        container.appendChild(animSection)

        this.#buildAnimationSettingsContent(container)
        this.#editorDrawerEl.appendChild(container)
    }


    #buildAnimationSettingsContent (container) {
        const anim = this.#selectedAnimation
        if (!anim) {
            return
        }

        const motion = anim.motion || {}
        const currentMode = motion.enabled ? (motion.mode || 'sidescroller') : 'none'

        const motionSection = document.createElement('div')
        motionSection.className = 'settings-section'
        motionSection.dataset.setting = 'motion'

        const motionLabel = document.createElement('div')
        motionLabel.className = 'settings-label'
        motionLabel.textContent = 'Motion'
        motionSection.appendChild(motionLabel)

        const motionOptions = document.createElement('div')
        motionOptions.className = 'motion-options'
        motionOptions.style.display = currentMode === 'none' ? 'none' : 'flex'
        motionOptions.style.flexDirection = 'column'
        motionOptions.style.gap = 'var(--spacing-md)'
        motionOptions.style.marginTop = 'var(--spacing-md)'

        const modeSelect = document.createElement('select-input')
        modeSelect.setAttribute('context', 'studio')
        modeSelect.setOptions([
            {value: 'none', label: 'None'},
            {value: 'sidescroller', label: 'Sidescroller'},
            {value: 'topdown', label: 'Top-down'}
        ])
        modeSelect.setValue(currentMode)
        modeSelect.addEventListener('change', (e) => {
            if (!anim.motion) {
                anim.motion = {}
            }
            const isEnabled = e.detail.value !== 'none'
            anim.motion.enabled = isEnabled
            anim.motion.mode = isEnabled ? e.detail.value : anim.motion.mode
            motionOptions.style.display = isEnabled ? 'flex' : 'none'
            this.#rebuildDirectionPad(directionPad, anim)
            this.#previewEl?.setMotion(anim.motion)
        })
        motionSection.appendChild(modeSelect)

        const dirSubSection = document.createElement('div')
        dirSubSection.className = 'settings-section'

        const dirLabel = document.createElement('div')
        dirLabel.className = 'settings-label'
        dirLabel.textContent = 'Direction'
        dirSubSection.appendChild(dirLabel)

        const directionPad = document.createElement('div')
        directionPad.className = 'direction-pad'
        this.#rebuildDirectionPad(directionPad, anim)
        dirSubSection.appendChild(directionPad)
        motionOptions.appendChild(dirSubSection)

        const speedSubSection = document.createElement('div')
        speedSubSection.className = 'settings-section'

        const speedLabel = document.createElement('div')
        speedLabel.className = 'settings-label'
        speedLabel.textContent = 'Reference Speed'
        speedSubSection.appendChild(speedLabel)

        const speedRow = document.createElement('div')
        speedRow.className = 'settings-row'

        const speedSlider = document.createElement('slider-input')
        speedSlider.setAttribute('context', 'studio')
        speedSlider.setAttribute('no-value', '')
        speedSlider.setAttribute('no-label', '')
        speedSlider.setValue(motion.speed ?? 1)
        speedSlider.setMin(0)
        speedSlider.setMax(10)
        speedSlider.setStep(0.1)

        const speedInput = document.createElement('number-input')
        speedInput.setAttribute('context', 'studio')
        speedInput.setValue(motion.speed ?? 1)
        speedInput.setStep(0.1)
        speedInput.setPrecision(1)
        speedInput.setMin(0)
        speedInput.setMax(100)

        const updateSpeed = (value) => {
            if (!anim.motion) {
                anim.motion = {}
            }
            anim.motion.speed = value
            this.#previewEl?.setMotion(anim.motion)
        }

        speedSlider.addEventListener('change', (e) => {
            speedInput.setValue(e.detail.value)
            updateSpeed(e.detail.value)
        })

        speedInput.addEventListener('change', (e) => {
            speedSlider.setValue(Math.min(10, Math.max(0, e.detail.value)))
            updateSpeed(e.detail.value)
        })

        speedRow.appendChild(speedSlider)
        speedRow.appendChild(speedInput)
        speedSubSection.appendChild(speedRow)
        motionOptions.appendChild(speedSubSection)

        motionSection.appendChild(motionOptions)
        container.appendChild(motionSection)
    }


    #rebuildDirectionPad (pad, anim) {
        pad.innerHTML = ''
        const motion = anim.motion || {}
        const mode = motion.mode || 'sidescroller'
        const direction = motion.direction || 'e'

        const arrows = {
            nw: '↖',
            n: '↑',
            ne: '↗',
            w: '←',
            center: '',
            e: '→',
            sw: '↙',
            s: '↓',
            se: '↘'
        }

        const sideDirections = ['n', 'e', 's', 'w']
        const topDownDirections = ['nw', 'n', 'ne', 'w', 'e', 'sw', 's', 'se']
        const activeDirections = mode === 'topdown' ? topDownDirections : sideDirections

        const layout = ['nw', 'n', 'ne', 'w', 'center', 'e', 'sw', 's', 'se']

        for (const pos of layout) {
            const btn = document.createElement('button')
            btn.className = 'direction-btn'
            if (pos === 'center') {
                btn.classList.add('center')
            } else if (activeDirections.includes(pos)) {
                btn.textContent = arrows[pos]
                if (direction === pos) {
                    btn.classList.add('active')
                }
                btn.addEventListener('click', () => {
                    if (!anim.motion) {
                        anim.motion = {}
                    }
                    anim.motion.direction = pos
                    this.#rebuildDirectionPad(pad, anim)
                    this.#previewEl?.setMotion(anim.motion)
                })
            } else {
                btn.style.visibility = 'hidden'
            }
            pad.appendChild(btn)
        }
    }


    #rebuildAnimationSettingsContent (container) {
        const sections = container.querySelectorAll('[data-setting]')
        sections.forEach(s => s.remove())
        this.#buildAnimationSettingsContent(container)
    }


    #syncDrawerAnimSelect () {
        if (this.#drawerAnimSelect && this.#drawerMode === 'settings') {
            this.#drawerAnimSelect.setValue(this.#selectedAnimation?.$id)
            const container = this.#editorDrawerEl.querySelector('.animation-settings')
            if (container) {
                this.#rebuildAnimationSettingsContent(container)
            }
        }
    }


    #updateEditorDrawer () {
        if (this.#selectedFrameIndex < 0) {
            if (this.#drawerMode === 'frame') {
                this.#editorDrawerEl?.close()
                this.#drawerMode = null
            }
            return
        }

        const frame = this.#selectedAnimation?.frames[this.#selectedFrameIndex]
        if (!frame) {
            if (this.#drawerMode === 'frame') {
                this.#editorDrawerEl?.close()
                this.#drawerMode = null
            }
            return
        }

        this.#drawerMode = 'frame'
        this.#editorDrawerEl.innerHTML = ''
        this.#buildFrameEditor(frame)
        this.#editorDrawerEl.open()
    }


    #buildFrameEditor (frame) {
        const container = document.createElement('div')
        container.className = 'frame-editor'

        container.appendChild(this.#buildFramePreview(frame))
        container.appendChild(this.#buildDurationSection(frame))
        container.appendChild(this.#buildEventsSection(frame))

        this.#editorDrawerEl.appendChild(container)
    }


    #buildFramePreview (frame) {
        const section = document.createElement('div')
        section.className = 'frame-editor-preview'

        const canvas = document.createElement('canvas')
        canvas.width = 120
        canvas.height = 120
        canvas.className = 'frame-editor-canvas'

        const region = frame.region
        if (region?.image) {
            const ctx = canvas.getContext('2d')
            const scale = Math.min(120 / region.width, 120 / region.height)
            const w = region.width * scale
            const h = region.height * scale
            const x = (120 - w) / 2
            const y = (120 - h) / 2
            ctx.drawImage(region.image, region.x, region.y, region.width, region.height, x, y, w, h)
        }

        const name = document.createElement('div')
        name.className = 'frame-editor-name'
        name.textContent = frame.name || 'Unnamed frame'
        name.title = frame.name || ''

        section.appendChild(canvas)
        section.appendChild(name)
        return section
    }


    #buildDurationSection (frame) {
        const section = document.createElement('div')
        section.className = 'frame-editor-section'

        const label = document.createElement('div')
        label.className = 'frame-editor-label'
        label.textContent = 'Duration multiplier'
        section.appendChild(label)

        const controls = document.createElement('div')
        controls.className = 'frame-editor-duration'

        const slider = document.createElement('slider-input')
        slider.setAttribute('context', 'studio')
        slider.setAttribute('no-value', '')
        slider.setAttribute('no-label', '')
        slider.setValue(frame.duration || 1)
        slider.setMin(0.5)
        slider.setMax(3)
        slider.setStep(0.1)

        const numberInput = document.createElement('number-input')
        numberInput.setAttribute('context', 'studio')
        numberInput.setValue(frame.duration || 1)
        numberInput.setStep(0.1)
        numberInput.setPrecision(2)
        numberInput.setMin(0.1)
        numberInput.setMax(10)

        const updateDuration = (value) => {
            frame.duration = value
            this.#timelineEl.setFrames(this.#selectedAnimation.frames)
        }

        slider.addEventListener('change', (e) => {
            numberInput.setValue(e.detail.value)
            updateDuration(e.detail.value)
        })

        numberInput.addEventListener('change', (e) => {
            slider.setValue(Math.min(3, Math.max(0.5, e.detail.value)))
            updateDuration(e.detail.value)
        })

        controls.appendChild(slider)
        controls.appendChild(numberInput)
        section.appendChild(controls)
        return section
    }


    #buildEventsSection (frame) {
        const section = document.createElement('div')
        section.className = 'frame-editor-section'

        const label = document.createElement('div')
        label.className = 'frame-editor-label'
        label.textContent = 'Events'
        section.appendChild(label)

        const eventsContainer = document.createElement('div')
        eventsContainer.className = 'frame-editor-events'

        const renderEvents = () => {
            eventsContainer.innerHTML = ''

            const currentEvents = frame.events || []
            for (const event of currentEvents) {
                const chip = document.createElement('div')
                chip.className = 'event-chip'

                const chipText = document.createElement('span')
                chipText.textContent = event

                const removeBtn = document.createElement('button')
                removeBtn.className = 'event-chip-remove'
                removeBtn.innerHTML = '×'
                removeBtn.addEventListener('click', () => {
                    frame.events = currentEvents.filter(e => e !== event)
                    this.#timelineEl.setFrames(this.#selectedAnimation.frames)
                    renderEvents()
                })

                chip.appendChild(chipText)
                chip.appendChild(removeBtn)
                eventsContainer.appendChild(chip)
            }

            const suggestions = this.#collectEventSuggestions(currentEvents)
            if (suggestions.length > 0) {
                const suggestionsEl = document.createElement('div')
                suggestionsEl.className = 'event-suggestions'

                for (const suggestion of suggestions) {
                    const btn = document.createElement('button')
                    btn.className = 'event-suggestion'
                    btn.textContent = suggestion
                    btn.addEventListener('click', () => {
                        if (!frame.events) {
                            frame.events = []
                        }
                        frame.events.push(suggestion)
                        this.#timelineEl.setFrames(this.#selectedAnimation.frames)
                        renderEvents()
                    })
                    suggestionsEl.appendChild(btn)
                }
                eventsContainer.appendChild(suggestionsEl)
            }

            const addRow = document.createElement('div')
            addRow.className = 'event-add-row'

            const input = document.createElement('input')
            input.type = 'text'
            input.className = 'event-input'
            input.placeholder = 'New event...'

            const addBtn = document.createElement('button')
            addBtn.className = 'event-add-btn'
            addBtn.textContent = 'Add'
            addBtn.addEventListener('click', () => {
                const value = input.value.trim()
                if (value) {
                    if (!frame.events) {
                        frame.events = []
                    }
                    if (!frame.events.includes(value)) {
                        frame.events.push(value)
                        this.#timelineEl.setFrames(this.#selectedAnimation.frames)
                        renderEvents()
                    }
                    input.value = ''
                }
            })

            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    addBtn.click()
                }
            })

            addRow.appendChild(input)
            addRow.appendChild(addBtn)
            eventsContainer.appendChild(addRow)
        }

        renderEvents()
        section.appendChild(eventsContainer)
        return section
    }


    #collectEventSuggestions (excludeEvents) {
        const allEvents = new Set()

        for (const anim of this.#animator.children) {
            for (const frame of anim.frames) {
                const events = frame.events || []
                events.forEach(event => allEvents.add(event))
            }
        }

        excludeEvents.forEach(event => allEvents.delete(event))

        return Array.from(allEvents).slice(0, 6)
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

        this.#timelineEl.addEventListener('addrequest', () => {
            this.#toggleFramesDrawer()
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


    #exportToClipboard () {
        if (!this.#animator) {
            return
        }

        const config = {}
        for (const anim of this.#animator.children) {
            config[anim.$id] = this.#buildAnimationConfig(anim)
        }

        const text = `static animations = ${JSON.stringify(config, null, 4)}`

        navigator.clipboard.writeText(text)
    }


    #buildAnimationConfig (anim) {
        const config = {
            fps: anim.fps,
            loop: anim.loop
        }

        if (anim.playbackMode !== 'forward') {
            config.playbackMode = anim.playbackMode
        }

        if (anim.motion?.enabled) {
            config.motion = {
                mode: anim.motion.mode || 'sidescroller',
                direction: anim.motion.direction || 'e',
                speed: anim.motion.speed ?? 1
            }
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
