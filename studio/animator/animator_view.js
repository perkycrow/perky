import EditorComponent from '../../editor/editor_component.js'
import {createElement, adoptStyleSheets} from '../../application/dom_utils.js'
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
import PerkyStore from '../../io/perky_store.js'
import PsdConverter from '../../io/psd_converter.js'
import {canvasToBlob} from '../../io/canvas.js'
import {animatorViewStyles, frameEditorStyles, settingsStyles} from './animator_view.styles.js'
import {inferSpritesheetName, collectEventSuggestions, buildAnimationConfig} from './animator_helpers.js'
import {buildFrameEditor} from './components/frame_editor.js'
import {buildAnchorEditor} from './components/anchor_editor.js'
import {buildAnimationSettings} from './components/animation_settings.js'


export default class AnimatorView extends EditorComponent {

    #context = null
    #animatorName = null
    #animatorConfig = null
    #animator = null
    #spritesheet = null
    #selectedAnimation = null
    #isCustom = false
    #store = new PerkyStore()
    #dirty = false
    #autoSaveTimer = null

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

        if (this.#context && this.#animatorConfig) {
            this.#initAnimator()
        }
    }


    onDisconnected () {
        clearTimeout(this.#autoSaveTimer)
    }


    setContext ({textureSystem, animatorConfig, animatorName, backgroundImage, studioConfig, isCustom, manifest}) {
        this.#context = {textureSystem, studioConfig, manifest}
        this.#animatorConfig = animatorConfig
        this.#animatorName = animatorName || 'animator'
        this.#backgroundImage = backgroundImage || null
        this.#isCustom = isCustom || false

        if (this.isConnected && this.#animatorConfig) {
            this.#initAnimator()
        }
    }


    #initAnimator () {
        if (!this.#animatorConfig) {
            return
        }

        this.#animator = new SpriteAnimator({
            sprite: null,
            config: this.#animatorConfig,
            textureSystem: this.#context.textureSystem
        })

        const spritesheetName = inferSpritesheetName(this.#animatorConfig)
        this.#spritesheet = spritesheetName
            ? this.#context.textureSystem.getSpritesheet(spritesheetName)
            : null

        this.#anchor = this.#animatorConfig.anchor || {x: 0.5, y: 0.5}
        this.#selectedAnimation = this.#animator.children[0] || null

        this.#render()
    }


    #buildDOM () {
        adoptStyleSheets(this.shadowRoot, animatorViewStyles, frameEditorStyles, settingsStyles)


        this.#appLayout = createElement('app-layout', {
            attrs: {'no-menu': '', 'no-close': '', 'no-footer': ''}
        })


        this.#containerEl = createElement('div', {class: 'animator-container'})
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

        this.#timelineEl = createElement('animation-timeline', {class: 'timeline-section'})
        if (this.#selectedAnimation) {
            this.#timelineEl.setFrames(this.#selectedAnimation.frames)
        }
        this.#setupTimelineEvents()
        this.#containerEl.appendChild(this.#timelineEl)


        this.#buildDrawers()
    }


    #createPreviewSection () {
        const section = createElement('div', {class: 'preview-section'})

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

        const headerStart = createElement('div', {
            class: 'header-controls',
            attrs: {slot: 'header-start'}
        })


        const backBtn = createElement('button', {
            class: 'toolbar-btn',
            html: ICONS.chevronLeft,
            title: 'Back to gallery'
        })
        backBtn.addEventListener('click', () => {
            window.location.href = 'index.html'
        })
        headerStart.appendChild(backBtn)


        const settingsMenu = document.createElement('dropdown-menu')
        settingsMenu.setIcon(ICONS.wrench)
        const menuItems = [
            {label: 'Animation Settings', action: () => this.#openAnimationSettings()},
            {label: 'Anchor Settings', action: () => this.#openSpritesheetSettings()},
            {label: 'Copy to Clipboard', action: () => this.#exportToClipboard()},
            {label: 'Export .perky', action: () => this.#exportPerkyFile()}
        ]
        if (this.#isCustom) {
            menuItems.push({label: 'Replace Spritesheet', action: () => this.#replaceSpritesheet()})
        }
        settingsMenu.setItems(menuItems)
        headerStart.appendChild(settingsMenu)


        this.#headerAnimSelect = createElement('select-input', {attrs: {context: 'studio'}})
        const animOptions = this.#animator.children.map(anim => ({value: anim.$id, label: anim.$id}))
        this.#headerAnimSelect.setOptions(animOptions)
        this.#headerAnimSelect.setValue(this.#selectedAnimation?.$id)
        this.#headerAnimSelect.addEventListener('change', (e) => {
            this.#selectedAnimation = this.#animator.getChild(e.detail.value)
            this.#updateForSelectedAnimation()
            this.#syncDrawerAnimSelect()
        })

        headerStart.appendChild(this.#headerAnimSelect)
        this.#appLayout.appendChild(headerStart)


        if (this.#selectedAnimation) {
            const headerEnd = createElement('div', {
                class: 'header-controls',
                attrs: {slot: 'header-end'}
            })

            const anim = this.#selectedAnimation


            const fpsInput = createElement('number-input', {attrs: {context: 'studio'}})
            fpsInput.setLabel('FPS')
            fpsInput.setValue(anim.fps)
            fpsInput.setStep(1)
            fpsInput.setPrecision(0)
            fpsInput.setMin(1)
            fpsInput.setMax(60)
            fpsInput.addEventListener('change', (e) => {
                anim.setFps(e.detail.value)
                this.#markDirty()
            })


            const loopToggle = createElement('toggle-input', {attrs: {context: 'studio'}})
            loopToggle.setLabel('Loop')
            loopToggle.setChecked(anim.loop)
            loopToggle.addEventListener('change', (e) => {
                anim.setLoop(e.detail.checked)
                this.#markDirty()
            })


            const modeSelect = createElement('select-input', {attrs: {context: 'studio'}})
            modeSelect.setOptions([
                {value: 'forward', label: 'Forward'},
                {value: 'reverse', label: 'Reverse'},
                {value: 'pingpong', label: 'Ping-pong'}
            ])
            modeSelect.setValue(anim.playbackMode)
            modeSelect.addEventListener('change', (e) => {
                anim.setPlaybackMode(e.detail.value)
                this.#markDirty()
            })

            headerEnd.appendChild(fpsInput)
            headerEnd.appendChild(loopToggle)
            headerEnd.appendChild(modeSelect)
            this.#appLayout.appendChild(headerEnd)
        }
    }


    #buildDrawers () {
        this.#framesDrawerEl = createElement('side-drawer', {attrs: {position: 'left'}})

        this.#spritesheetEl = document.createElement('spritesheet-viewer')
        if (this.#spritesheet) {
            this.#spritesheetEl.setSpritesheet(this.#spritesheet)
        }

        this.#spritesheetEl.addEventListener('frameclick', (e) => {
            this.#addFrameToTimeline(e.detail)
        })

        this.#framesDrawerEl.appendChild(this.#spritesheetEl)
        this.#previewSectionEl.appendChild(this.#framesDrawerEl)

        this.#editorDrawerEl = createElement('side-drawer', {attrs: {position: 'right'}})
        this.#previewSectionEl.appendChild(this.#editorDrawerEl)

        this.#spritesheetSettingsDrawerEl = createElement('side-drawer', {attrs: {position: 'right'}})
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
            this.#markDirty()
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
                this.#markDirty()
            },
            onMotionUpdate: (motion) => {
                this.#previewEl?.updateMotion(motion)
                this.#markDirty()
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
                this.#markDirty()
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

        const frames = this.#selectedAnimation.frames
        let insertIndex

        if (this.#selectedFrameIndex >= 0) {
            insertIndex = this.#selectedFrameIndex + 1
            frames.splice(insertIndex, 0, {region, name})
        } else {
            frames.push({region, name})
            insertIndex = frames.length - 1
        }

        this.#timelineEl.setFrames(frames)
        this.#timelineEl.flashAddedFrame(insertIndex)
        this.#markDirty()
    }


    #setupTimelineEvents () {
        this.#timelineEl.addEventListener('frameclick', (e) => {
            this.#previewEl?.setCurrentIndex(e.detail.index)
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
        this.#markDirty()
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
        this.#markDirty()
    }


    #handleFrameDuration ({index, duration}) {
        if (!this.#selectedAnimation) {
            return
        }

        const frame = this.#selectedAnimation.frames[index]
        if (frame) {
            frame.duration = duration
            this.#timelineEl.setFrames(this.#selectedAnimation.frames)
            this.#markDirty()
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


    #markDirty () {
        this.#dirty = true
        clearTimeout(this.#autoSaveTimer)
        this.#autoSaveTimer = setTimeout(() => this.#autoSave(), 2000)
    }


    async #autoSave () {
        if (!this.#dirty || !this.#animator) {
            return
        }

        this.#dirty = false

        if (this.#isCustom) {
            await this.#saveCustomAnimator()
        } else {
            await this.#forkAndSave()
        }
    }


    async #saveCustomAnimator () {
        const animatorConfig = this.#buildAnimatorConfig()
        const resource = await this.#store.get(this.#animatorName)
        if (!resource) {
            return
        }

        const configFile = resource.files.find(f => f.name.endsWith('Animator.json'))
        if (configFile) {
            configFile.blob = new Blob([JSON.stringify(animatorConfig)], {type: 'application/json'})
        }

        await this.#store.save(this.#animatorName, {
            type: 'animator',
            name: resource.name,
            files: resource.files
        })
    }


    async #forkAndSave () {
        const manifest = this.#context.manifest
        if (!manifest) {
            return
        }

        const spritesheetId = inferSpritesheetName(this.#animatorConfig)
        const spritesheetAsset = manifest.getAsset(spritesheetId)
        if (!spritesheetAsset?.source) {
            return
        }

        const name = this.#animatorName.replace(/Animator$/, '')
        const animatorConfig = this.#buildAnimatorConfig()
        const files = await buildForkFiles(name, spritesheetId, animatorConfig, spritesheetAsset.source)

        await this.#store.save(this.#animatorName, {
            type: 'animator',
            name,
            files
        })

        this.#isCustom = true
    }


    async #exportPerkyFile () {
        if (!this.#isCustom) {
            await this.#forkAndSave()
        }

        await this.#store.export(this.#animatorName)
    }


    #buildAnimatorConfig () {
        const spritesheetName = inferSpritesheetName(this.#animatorConfig)
        const animations = {}

        for (const anim of this.#animator.children) {
            animations[anim.$id] = buildAnimationConfig(anim, this.#spritesheet)
        }

        return {
            spritesheet: spritesheetName,
            anchor: {...this.#anchor},
            animations
        }
    }


    async #replaceSpritesheet () {
        if (!this.#isCustom || !this.#animator) {
            return
        }

        const file = await pickFile('.psd')
        if (!file) {
            return
        }

        const name = this.#animatorName.replace(/Animator$/, '')
        const spritesheetName = `${name}Spritesheet`

        const buffer = new Uint8Array(await file.arrayBuffer())
        const converter = new PsdConverter()
        const psd = converter.parse(buffer)
        const result = await converter.convert(psd, {name})

        const animatorConfig = this.#buildAnimatorConfig()
        cleanAnimatorConfig(animatorConfig, result.spritesheetJson)

        const files = [
            {name: `${name}Animator.json`, blob: new Blob([JSON.stringify(animatorConfig)], {type: 'application/json'})},
            {name: `${spritesheetName}.json`, blob: new Blob([JSON.stringify(result.spritesheetJson)], {type: 'application/json'})}
        ]

        for (let i = 0; i < result.atlases.length; i++) {
            files.push({
                name: `${spritesheetName}_${i}.png`,
                blob: await canvasToBlob(result.atlases[i].canvas)
            })
        }

        await this.#store.save(this.#animatorName, {
            type: 'animator',
            name,
            files
        })

        window.location.href = `animator.html?id=${encodeURIComponent(this.#animatorName)}&custom=1`
    }

}


customElements.define('animator-view', AnimatorView)


async function buildForkFiles (name, spritesheetId, animatorConfig, spritesheetSource) {
    const {data, images} = spritesheetSource
    const files = []

    files.push({
        name: `${name}Animator.json`,
        blob: new Blob([JSON.stringify(animatorConfig)], {type: 'application/json'})
    })

    files.push({
        name: `${spritesheetId}.json`,
        blob: new Blob([JSON.stringify(data)], {type: 'application/json'})
    })

    for (let i = 0; i < images.length; i++) {
        files.push({
            name: `${spritesheetId}_${i}.png`,
            blob: await imageToBlob(images[i])
        })
    }

    return files
}


function imageToBlob (image) {
    const canvas = document.createElement('canvas')
    canvas.width = image.naturalWidth || image.width
    canvas.height = image.naturalHeight || image.height
    canvas.getContext('2d').drawImage(image, 0, 0)
    return new Promise(resolve => canvas.toBlob(resolve, 'image/png'))
}


function cleanAnimatorConfig (config, spritesheetJson) {
    const frameNames = new Set(spritesheetJson.frames.map(f => f.filename))

    for (const anim of Object.values(config.animations)) {
        if (!anim.frames) {
            continue
        }
        anim.frames = anim.frames.filter(frame => {
            const source = frame.source || ''
            const name = source.includes(':') ? source.split(':')[1] : source
            return frameNames.has(name)
        })
    }
}


function pickFile (accept) {
    return new Promise(resolve => {
        const input = document.createElement('input')
        input.type = 'file'
        input.accept = accept
        input.addEventListener('change', () => resolve(input.files[0] || null))
        input.click()
    })
}
