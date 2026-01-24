import EditorComponent from '../../editor/editor_component.js'
import {adoptStyleSheets} from '../../application/dom_utils.js'
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
import SpriteAnimator from '../../render/sprite_animator.js'
import TextureRegion from '../../render/textures/texture_region.js'
import {animatorViewStyles, frameEditorStyles, settingsStyles} from './animator_view.styles.js'
import {inferSpritesheetName, collectEventSuggestions, buildAnimationConfig} from './animator_helpers.js'
import {buildFrameEditor} from './components/frame_editor.js'
import {buildAnchorEditor} from './components/anchor_editor.js'
import {buildAnimationSettings} from './components/animation_settings.js'


export default class AnimatorView extends EditorComponent {

    #context = null
    #animators = {}
    #animatorConfig = null
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
    #spritesheetSettingsDrawerEl = null
    #spritesheetEl = null
    #selectedFrameIndex = -1
    #drawerMode = null
    #headerAnimSelect = null
    #drawerAnimSelect = null
    #anchor = {x: 0.5, y: 0.5}
    #anchorEditor = null
    #animationSettings = null
    #backgroundImage = null

    onConnected () {
        this.#buildDOM()

        if (this.#context) {
            const firstKey = Object.keys(this.#animators)[0]
            if (firstKey) {
                this.#selectAnimator(firstKey)
            }
        }
    }


    setContext ({textureSystem, animators, backgroundImage, studioConfig}) {
        this.#context = {textureSystem, studioConfig}
        this.#animators = animators || {}
        this.#backgroundImage = backgroundImage || null

        if (this.isConnected) {
            const firstKey = Object.keys(this.#animators)[0]
            if (firstKey) {
                this.#selectAnimator(firstKey)
            }
        }
    }


    #selectAnimator (name) {
        const animatorConfig = this.#animators[name]
        if (!animatorConfig) {
            return
        }

        this.#animatorConfig = animatorConfig

        this.#animator = new SpriteAnimator({
            sprite: null,
            config: animatorConfig,
            textureSystem: this.#context.textureSystem
        })

        const spritesheetName = inferSpritesheetName(animatorConfig)
        this.#spritesheet = spritesheetName
            ? this.#context.textureSystem.getSpritesheet(spritesheetName)
            : null

        this.#anchor = animatorConfig.anchor || {x: 0.5, y: 0.5}
        this.#selectedAnimation = this.#animator.children[0] || null

        this.#render()
    }


    #buildDOM () {
        adoptStyleSheets(this.shadowRoot, animatorViewStyles, frameEditorStyles, settingsStyles)


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
            this.#previewEl.setAnchor(this.#anchor)
        }
        if (this.#backgroundImage) {
            this.#previewEl.setBackgroundImage(this.#backgroundImage)
            const backgroundRegion = TextureRegion.fromImage(this.#backgroundImage)
            this.#previewEl.setBackgroundRegion(backgroundRegion)
        }
        const unitsInView = this.#context.studioConfig?.unitsInView
        if (unitsInView) {
            this.#previewEl.setUnitsInView(unitsInView)
        }
        const size = this.#animatorConfig?.size
        if (size) {
            this.#previewEl.setSize(size)
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
            {label: 'Anchor Settings', action: () => this.#openSpritesheetSettings()},
            {label: 'Export', action: () => this.#exportToClipboard()}
        ])
        headerStart.appendChild(settingsMenu)


        const animatorSelect = document.createElement('select-input')
        animatorSelect.setAttribute('context', 'studio')
        const animatorNames = Object.keys(this.#animators)
        const currentAnimatorName = animatorNames.find(name => this.#animators[name] === this.#animatorConfig)
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

        this.#spritesheetSettingsDrawerEl = document.createElement('side-drawer')
        this.#spritesheetSettingsDrawerEl.setAttribute('position', 'right')
        this.#previewSectionEl.appendChild(this.#spritesheetSettingsDrawerEl)
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


    #openSpritesheetSettings () {
        this.#editorDrawerEl.close()
        this.#spritesheetSettingsDrawerEl.innerHTML = ''

        this.#anchorEditor = buildAnchorEditor(this.#spritesheet, this.#anchor, (anchor) => {
            this.#anchorEditor.syncInputs()
            this.#anchorEditor.updatePreview()
            this.#previewEl?.setAnchor(anchor)
        })

        this.#spritesheetSettingsDrawerEl.appendChild(this.#anchorEditor.container)
        this.#spritesheetSettingsDrawerEl.open()
    }


    #openAnimationSettings () {
        this.#spritesheetSettingsDrawerEl.close()
        this.#selectedFrameIndex = -1
        this.#timelineEl?.clearSelection()
        this.#drawerMode = 'settings'
        this.#editorDrawerEl.innerHTML = ''

        this.#animationSettings = buildAnimationSettings(this.#animator, this.#selectedAnimation, {
            onAnimationChange: (animId) => {
                this.#selectedAnimation = this.#animator.getChild(animId)
                this.#updateForSelectedAnimation()
                this.#headerAnimSelect?.setValue(animId)
                this.#animationSettings.rebuild(this.#selectedAnimation)
            },
            onMotionChange: (motion) => {
                this.#previewEl?.setMotion(motion)
            },
            onMotionUpdate: (motion) => {
                this.#previewEl?.updateMotion(motion)
            }
        })

        this.#drawerAnimSelect = this.#animationSettings.animSelect
        this.#editorDrawerEl.appendChild(this.#animationSettings.container)
        this.#editorDrawerEl.open()
    }


    #syncDrawerAnimSelect () {
        if (this.#drawerAnimSelect && this.#drawerMode === 'settings') {
            this.#drawerAnimSelect.setValue(this.#selectedAnimation?.$id)
            this.#animationSettings?.rebuild(this.#selectedAnimation)
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

        const frameEditor = buildFrameEditor(frame, {
            onFramesUpdate: () => {
                this.#timelineEl.setFrames(this.#selectedAnimation.frames)
            },
            getSuggestions: (excludeEvents) => {
                return collectEventSuggestions(this.#animator, excludeEvents)
            }
        })

        this.#editorDrawerEl.appendChild(frameEditor)
        this.#editorDrawerEl.open()
    }


    #addFrameToTimeline ({name, region}) {
        if (!this.#selectedAnimation || !region) {
            return
        }

        this.#selectedAnimation.frames.push({region, name})
        this.#timelineEl.setFrames(this.#selectedAnimation.frames)


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
            this.#previewEl?.setMotion(this.#selectedAnimation.motion)
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


    #exportToClipboard () {
        if (!this.#animator) {
            return
        }

        const animations = {}
        for (const anim of this.#animator.children) {
            animations[anim.$id] = buildAnimationConfig(anim, this.#spritesheet)
        }

        const lines = []

        lines.push(`static anchor = {x: ${this.#anchor.x}, y: ${this.#anchor.y}}`)
        lines.push('')
        lines.push(`static animations = ${JSON.stringify(animations, null, 4)}`)

        navigator.clipboard.writeText(lines.join('\n'))
    }

}


customElements.define('animator-view', AnimatorView)
