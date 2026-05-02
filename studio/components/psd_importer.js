import EditorComponent from '../../editor/editor_component.js'
import {createElement, adoptStyleSheets} from '../../application/dom_utils.js'
import {psdImporterStyles} from './psd_importer.styles.js'
import '../../editor/layout/overlay.js'
import PsdConverter from '../../io/psd_converter.js'
import PerkyStore from '../../io/perky_store.js'
import {ICONS} from '../../editor/devtools/devtools_icons.js'
import {extractFramesFromGroup, findAnimationGroups} from '../../io/spritesheet.js'
import {putPixels, canvasToBlob} from '../../io/canvas.js'
import {buildAnimatorFiles} from '../animator/animator_helpers.js'


export default class PsdImporter extends EditorComponent {

    #overlay = null
    #step = 'drop'
    #psd = null
    #converter = new PsdConverter()
    #store = new PerkyStore()
    #fileInput = null
    #aspectRatioLocked = true
    #aspectRatio = 1
    #existingNames = new Set()
    #targetName = null

    #elements = {}

    onConnected () {
        adoptStyleSheets(this.shadowRoot, psdImporterStyles)
        this.#converter.on('progress', ({stage, percent}) => this.#onProgress(stage, percent))
        this.#buildDOM()
    }


    open () {
        const targetName = this.#targetName
        this.#reset()
        this.#targetName = targetName
        this.#updateStep()
        this.#overlay.open()
    }


    close () {
        this.#overlay.close()
    }


    setExistingNames (names) {
        this.#existingNames = new Set(names.map(n => n.toLowerCase()))
    }


    setTargetName (animatorName) {
        this.#targetName = animatorName.replace(/Animator$/i, '')
    }


    #reset () {
        this.#step = 'drop'
        this.#psd = null
        this.#aspectRatioLocked = true
        this.#targetName = null
        this.#updateStep()
    }


    #buildDOM () {
        this.#overlay = createElement('editor-overlay', {
            attrs: {'fullscreen': '', 'no-close-on-backdrop': ''}
        })

        const content = createElement('div', {class: 'importer-content'})

        content.appendChild(this.#buildHeader())
        content.appendChild(this.#buildBody())

        this.#overlay.appendChild(content)
        this.shadowRoot.appendChild(this.#overlay)

        this.#updateStep()
    }


    #buildHeader () {
        const header = createElement('div', {class: 'importer-header'})

        this.#elements.backBtn = createElement('button', {
            class: 'header-btn',
            html: '← Cancel'
        })
        this.#elements.backBtn.addEventListener('click', () => this.#handleBack())

        this.#elements.title = createElement('span', {class: 'header-title', text: 'Import PSD'})

        const spacer = createElement('div', {class: 'header-btn'})
        spacer.style.visibility = 'hidden'

        header.appendChild(this.#elements.backBtn)
        header.appendChild(this.#elements.title)
        header.appendChild(spacer)

        return header
    }


    #buildBody () {
        const body = createElement('div', {class: 'importer-body'})

        body.appendChild(this.#buildDropStep())
        body.appendChild(this.#buildPreviewStep())
        body.appendChild(this.#buildProgressStep())

        return body
    }


    #buildDropStep () {
        const step = createElement('div', {class: 'step', attrs: {'data-step': 'drop'}})

        this.#fileInput = createElement('input', {
            attrs: {type: 'file', accept: '.psd,image/vnd.adobe.photoshop,image/x-photoshop,application/x-photoshop,application/photoshop'}
        })
        this.#fileInput.style.display = 'none'
        this.#fileInput.addEventListener('change', (e) => this.#handleFileSelect(e))

        const dropZone = createElement('div', {class: 'drop-zone'})
        const icon = createElement('div', {class: 'drop-zone-icon', html: ICONS.folder})
        const text = createElement('div', {class: 'drop-zone-text', text: 'Tap to select PSD'})
        const hint = createElement('div', {class: 'drop-zone-hint', text: 'or drag and drop'})
        dropZone.appendChild(icon)
        dropZone.appendChild(text)
        dropZone.appendChild(hint)

        dropZone.addEventListener('click', () => this.#fileInput.click())
        dropZone.addEventListener('dragover', (e) => handleDragOver(e, dropZone))
        dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'))
        dropZone.addEventListener('drop', (e) => this.#handleDrop(e, dropZone))

        step.appendChild(this.#fileInput)
        step.appendChild(dropZone)

        return step
    }


    #buildPreviewStep () {
        const step = createElement('div', {class: 'step', attrs: {'data-step': 'preview'}})

        const section = createElement('div', {class: 'preview-section'})

        this.#elements.previewContainer = createElement('div', {class: 'preview-canvas-container'})
        this.#elements.previewDimensions = createElement('div', {class: 'preview-dimensions'})

        section.appendChild(this.#elements.previewContainer)
        section.appendChild(this.#elements.previewDimensions)

        section.appendChild(createElement('div', {class: 'section-title', text: 'Animations'}))
        this.#elements.animationTags = createElement('div', {class: 'animation-tags'})
        section.appendChild(this.#elements.animationTags)

        section.appendChild(createElement('div', {class: 'section-title', text: 'Export Settings'}))

        const sizeRow = createElement('div', {class: 'settings-row'})
        sizeRow.appendChild(createElement('span', {class: 'settings-label', text: 'Output Size'}))
        const sizeInput = createElement('div', {class: 'settings-input'})

        this.#elements.widthInput = createElement('input', {
            class: 'size-input',
            attrs: {type: 'number', placeholder: ''}
        })
        this.#elements.widthInput.addEventListener('input', () => this.#handleWidthChange())

        this.#elements.heightInput = createElement('input', {
            class: 'size-input',
            attrs: {type: 'number', placeholder: ''}
        })
        this.#elements.heightInput.addEventListener('input', () => this.#handleHeightChange())

        this.#elements.linkBtn = createElement('button', {class: 'link-btn active', html: ICONS.link})
        this.#elements.linkBtn.addEventListener('click', () => this.#toggleAspectLock())

        sizeInput.appendChild(this.#elements.widthInput)
        sizeInput.appendChild(createElement('span', {class: 'size-separator', text: '×'}))
        sizeInput.appendChild(this.#elements.heightInput)
        sizeInput.appendChild(this.#elements.linkBtn)
        sizeRow.appendChild(sizeInput)
        section.appendChild(sizeRow)

        const resizeRow = createElement('div', {class: 'settings-row'})
        resizeRow.appendChild(createElement('span', {class: 'settings-label', text: 'Resize Mode'}))
        const resizeInput = createElement('div', {class: 'settings-input'})
        this.#elements.resizeMode = createElement('select', {class: 'resize-select'})
        this.#elements.resizeMode.innerHTML = `
            <option value="smooth" selected>Smooth</option>
            <option value="nearest">Nearest Neighbor</option>
        `
        resizeInput.appendChild(this.#elements.resizeMode)
        resizeRow.appendChild(resizeInput)
        section.appendChild(resizeRow)

        section.appendChild(createElement('div', {class: 'section-title', text: 'Animator Name'}))

        this.#elements.nameInput = createElement('input', {
            class: 'name-input',
            attrs: {type: 'text', placeholder: 'Enter name...'}
        })
        this.#elements.nameInput.addEventListener('input', () => this.#validateName())
        section.appendChild(this.#elements.nameInput)

        this.#elements.outputInfo = createElement('div', {class: 'output-info'})
        section.appendChild(this.#elements.outputInfo)

        this.#elements.errorMessage = createElement('div', {class: 'error-message hidden'})
        section.appendChild(this.#elements.errorMessage)

        this.#elements.createBtn = createElement('button', {
            class: 'create-btn',
            text: 'Create Animator'
        })
        this.#elements.createBtn.addEventListener('click', () => this.#handleCreate())
        section.appendChild(this.#elements.createBtn)

        step.appendChild(section)

        return step
    }


    #buildProgressStep () {
        const step = createElement('div', {class: 'step', attrs: {'data-step': 'progress'}})

        const section = createElement('div', {class: 'progress-section'})

        const barContainer = createElement('div', {class: 'progress-bar-container'})
        this.#elements.progressBar = createElement('div', {class: 'progress-bar'})
        this.#elements.progressBar.style.width = '0%'
        barContainer.appendChild(this.#elements.progressBar)
        section.appendChild(barContainer)

        this.#elements.progressText = createElement('div', {class: 'progress-text', text: 'Preparing...'})
        section.appendChild(this.#elements.progressText)

        step.appendChild(section)

        return step
    }


    #toggleAspectLock () {
        this.#aspectRatioLocked = !this.#aspectRatioLocked
        if (this.#aspectRatioLocked) {
            this.#elements.linkBtn.classList.add('active')
            this.#elements.linkBtn.innerHTML = ICONS.link
        } else {
            this.#elements.linkBtn.classList.remove('active')
            this.#elements.linkBtn.innerHTML = ICONS.unlink
        }
    }


    #handleWidthChange () {
        this.#syncDimension('width')
    }


    #handleHeightChange () {
        this.#syncDimension('height')
    }


    #syncDimension (source) {
        if (!this.#aspectRatioLocked || !this.#psd) {
            return
        }

        const sourceInput = source === 'width' ? this.#elements.widthInput : this.#elements.heightInput
        const targetInput = source === 'width' ? this.#elements.heightInput : this.#elements.widthInput
        const value = parseInt(sourceInput.value, 10)

        if (value > 0) {
            const computed = source === 'width'
                ? Math.round(value / this.#aspectRatio)
                : Math.round(value * this.#aspectRatio)
            targetInput.value = computed
        }
    }


    #updateStep () {
        const steps = this.shadowRoot.querySelectorAll('.step')
        steps.forEach(s => s.classList.remove('active'))

        const current = this.shadowRoot.querySelector(`[data-step="${this.#step}"]`)
        if (current) {
            current.classList.add('active')
        }

        this.#updateHeader()
    }


    #updateHeader () {
        const isUpdate = Boolean(this.#targetName)
        const headers = {
            drop: {backText: '← Cancel', title: isUpdate ? 'Update PSD' : 'Import PSD'},
            preview: {backText: '← Back', title: this.#psd?.filename || 'Preview'},
            progress: {backText: null, title: isUpdate ? 'Updating...' : 'Creating...'}
        }

        const config = headers[this.#step]
        if (config) {
            if (config.backText) {
                this.#elements.backBtn.innerHTML = config.backText
                this.#elements.backBtn.classList.remove('hidden')
            } else {
                this.#elements.backBtn.classList.add('hidden')
            }
            this.#elements.title.textContent = config.title
        }
    }


    #handleBack () {
        const actions = {
            drop: () => this.close(),
            preview: () => {
                this.#step = 'drop'
                this.#psd = null
            }
        }

        const action = actions[this.#step]
        if (action) {
            action()
        }
        this.#updateStep()
    }


    #handleDrop (e, dropZone) {
        e.preventDefault()
        dropZone.classList.remove('dragover')

        const file = e.dataTransfer.files[0]
        if (file && file.name.endsWith('.psd')) {
            this.#loadFile(file)
        }
    }


    #handleFileSelect (e) {
        const file = e.target.files[0]
        if (file) {
            this.#loadFile(file)
        }
    }


    async #loadFile (file) {
        try {
            const buffer = await file.arrayBuffer()
            const psd = this.#converter.parse(buffer)
            psd.filename = file.name.replace('.psd', '')

            const animations = this.#converter.getAnimationInfo(psd)
            if (animations.length === 0) {
                this.#showError('No animation groups found. Use "anim - name" folder naming.')
                return
            }

            this.#psd = psd
            this.#aspectRatio = psd.width / psd.height
            this.#populatePreview(psd, animations)
            this.#step = 'preview'
            this.#updateStep()
        } catch (error) {
            this.#showError(`Failed to parse PSD: ${error.message}`)
        }
    }


    #populatePreview (psd, animations) {
        this.#elements.previewContainer.innerHTML = ''

        const groups = findAnimationGroups(psd.tree)
        if (groups.length > 0) {
            const firstGroup = groups[0]
            const frames = extractFramesFromGroup(firstGroup, psd.width, psd.height)
            if (frames.length > 0) {
                const frame = frames[0]
                const canvas = createElement('canvas', {class: 'preview-canvas'})
                canvas.width = frame.width
                canvas.height = frame.height
                const ctx = canvas.getContext('2d')
                putPixels(ctx, frame)
                this.#elements.previewContainer.appendChild(canvas)
            }
        }

        this.#elements.previewDimensions.textContent = `${psd.width} × ${psd.height}`

        this.#elements.widthInput.placeholder = psd.width
        this.#elements.heightInput.placeholder = psd.height
        this.#elements.widthInput.value = ''
        this.#elements.heightInput.value = ''

        this.#elements.animationTags.innerHTML = ''
        for (const anim of animations) {
            const tag = createElement('div', {class: 'animation-tag'})
            tag.innerHTML = `${anim.name}<span>${anim.frameCount}f</span>`
            this.#elements.animationTags.appendChild(tag)
        }

        if (this.#targetName) {
            this.#elements.nameInput.value = this.#targetName
            this.#elements.nameInput.disabled = true
        } else {
            this.#elements.nameInput.value = psd.filename || ''
            this.#elements.nameInput.disabled = false
        }
        this.#elements.errorMessage.classList.add('hidden')
        this.#validateName()
    }


    #validateName () {
        const name = sanitizeName(this.#elements.nameInput.value)
        const animatorName = `${name}Animator`.toLowerCase()
        const isUpdate = Boolean(this.#targetName)
        const isDuplicate = !isUpdate && this.#existingNames.has(animatorName)
        const isValid = name.length > 0 && !isDuplicate

        const actionLabel = isUpdate ? 'update' : 'create'
        this.#elements.outputInfo.innerHTML = `
            <div class="output-info-title">This will ${actionLabel}:</div>
            <div class="output-item"><span class="output-item-icon">${ICONS.image}</span> ${name || '...'}Spritesheet</div>
            <div class="output-item"><span class="output-item-icon">${ICONS.film}</span> ${name || '...'}Animator</div>
        `

        if (isDuplicate) {
            this.#elements.errorMessage.textContent = `"${name}Animator" already exists`
            this.#elements.errorMessage.classList.remove('hidden')
        } else {
            this.#elements.errorMessage.classList.add('hidden')
        }

        this.#elements.createBtn.textContent = isUpdate ? 'Update Animator' : 'Create Animator'
        this.#elements.createBtn.disabled = !isValid
    }


    #onProgress (stage, percent) {
        const messages = {
            extracting: 'Extracting frames...',
            resizing: 'Resizing...',
            packing: 'Packing atlas...',
            compositing: 'Compositing...',
            finalizing: 'Finalizing...',
            complete: 'Complete!'
        }
        this.#elements.progressBar.style.width = `${percent}%`
        this.#elements.progressText.textContent = messages[stage] || stage
    }


    async #handleCreate () {
        const name = sanitizeName(this.#elements.nameInput.value)
        if (!name) {
            return
        }

        this.#step = 'progress'
        this.#updateStep()

        try {
            const targetWidth = parseInt(this.#elements.widthInput.value, 10) || null
            const targetHeight = parseInt(this.#elements.heightInput.value, 10) || null
            const nearest = this.#elements.resizeMode.value === 'nearest'

            const result = await this.#converter.convert(this.#psd, {
                targetWidth,
                targetHeight,
                nearest,
                name
            })

            const atlasBlobs = await Promise.all(
                result.atlases.map(atlas => canvasToBlob(atlas.canvas))
            )
            const files = buildAnimatorFiles({name, spritesheetName: result.spritesheetName, animatorConfig: result.animatorConfig, spritesheetData: result.spritesheetJson, atlasBlobs})
            const animatorId = `${name}Animator`

            await this.#store.save(animatorId, {
                type: 'animator',
                name,
                files
            })

            this.dispatchEvent(new CustomEvent('complete', {
                bubbles: true,
                detail: {...result, id: animatorId}
            }))

            this.close()
        } catch (error) {
            this.#step = 'preview'
            this.#updateStep()
            this.#showError(`Conversion failed: ${error.message}`)
        }
    }


    #showError (message) {
        this.#elements.errorMessage.textContent = message
        this.#elements.errorMessage.classList.remove('hidden')
    }

}


customElements.define('psd-importer', PsdImporter)


function handleDragOver (e, dropZone) {
    e.preventDefault()
    dropZone.classList.add('dragover')
}


function sanitizeName (name) {
    return name.replace(/[^a-zA-Z0-9_]/g, '').replace(/^[0-9]/, '')
}
