import EditorComponent from '../../editor/editor_component.js'
import {createElement, adoptStyleSheets, createStyleSheet} from '../../application/dom_utils.js'
import '../../editor/layout/overlay.js'
import PsdConverter from '../../io/psd_converter.js'
import {ICONS} from '../../editor/devtools/devtools_icons.js'
import {extractFramesFromGroup, findAnimationGroups} from '../../io/spritesheet.js'
import {putPixels} from '../../io/canvas.js'


const styles = createStyleSheet(`
    :host {
        display: contents;
    }

    .importer-content {
        display: flex;
        flex-direction: column;
        width: 100%;
        height: 100%;
    }

    .importer-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: var(--spacing-lg);
        border-bottom: 1px solid var(--border);
        background: var(--bg-secondary);
    }

    .header-btn {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
        padding: var(--spacing-sm) var(--spacing-md);
        background: transparent;
        border: none;
        color: var(--accent);
        font-size: var(--font-size-md);
        font-family: var(--font-mono);
        cursor: pointer;
        border-radius: var(--radius-md);
        min-height: var(--touch-target);
        -webkit-tap-highlight-color: transparent;
    }

    .header-btn:active {
        background: var(--bg-hover);
    }

    .header-btn:disabled {
        opacity: 0.5;
        pointer-events: none;
    }

    .header-btn.primary {
        background: var(--accent);
        color: var(--bg-primary);
    }

    .header-title {
        font-size: var(--font-size-lg);
        font-weight: 600;
        color: var(--fg-primary);
    }

    .importer-body {
        flex: 1;
        overflow-y: auto;
        -webkit-overflow-scrolling: touch;
    }

    .step {
        display: none;
        height: 100%;
    }

    .step.active {
        display: flex;
        flex-direction: column;
    }

    .drop-zone {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        margin: var(--spacing-xl);
        border: 2px dashed var(--border);
        border-radius: var(--radius-lg);
        cursor: pointer;
        transition: border-color var(--transition-normal), background var(--transition-normal);
        -webkit-tap-highlight-color: transparent;
    }

    .drop-zone:active,
    .drop-zone.dragover {
        border-color: var(--accent);
        background: var(--bg-hover);
    }

    .drop-zone-icon {
        width: 48px;
        height: 48px;
        margin-bottom: var(--spacing-lg);
        opacity: 0.6;
        color: var(--fg-muted);
    }

    .drop-zone-text {
        font-size: var(--font-size-lg);
        color: var(--fg-primary);
        margin-bottom: var(--spacing-sm);
    }

    .drop-zone-hint {
        font-size: var(--font-size-sm);
        color: var(--fg-muted);
    }

    .preview-section {
        padding: var(--spacing-xl);
    }

    .preview-canvas-container {
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--bg-primary);
        border-radius: var(--radius-lg);
        padding: var(--spacing-xl);
        margin-bottom: var(--spacing-lg);
        min-height: 150px;
    }

    .preview-canvas {
        max-width: 100%;
        max-height: 200px;
        image-rendering: pixelated;
    }

    .preview-dimensions {
        text-align: center;
        font-size: var(--font-size-sm);
        color: var(--fg-muted);
        margin-bottom: var(--spacing-xl);
    }

    .section-title {
        font-size: 13px;
        font-weight: 600;
        color: var(--fg-muted);
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: var(--spacing-md);
    }

    .animation-tags {
        display: flex;
        flex-wrap: wrap;
        gap: var(--spacing-sm);
        margin-bottom: var(--spacing-xl);
    }

    .animation-tag {
        display: flex;
        align-items: center;
        gap: var(--spacing-xs);
        padding: var(--spacing-sm) var(--spacing-md);
        background: var(--bg-secondary);
        border-radius: var(--radius-md);
        font-size: var(--font-size-sm);
        color: var(--fg-primary);
    }

    .animation-tag span {
        color: var(--fg-muted);
    }

    .settings-row {
        display: flex;
        align-items: center;
        gap: var(--spacing-md);
        margin-bottom: var(--spacing-md);
    }

    .settings-label {
        flex: 0 0 100px;
        font-size: var(--font-size-sm);
        color: var(--fg-muted);
    }

    .settings-input {
        flex: 1;
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
    }

    .size-input {
        width: 80px;
        padding: var(--spacing-sm) var(--spacing-md);
        background: var(--bg-primary);
        border: 1px solid var(--border);
        border-radius: var(--radius-md);
        color: var(--fg-primary);
        font-family: var(--font-mono);
        font-size: var(--font-size-md);
        min-height: var(--touch-target);
    }

    .size-separator {
        color: var(--fg-muted);
    }

    .link-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: var(--touch-target);
        height: var(--touch-target);
        background: transparent;
        border: 1px solid var(--border);
        border-radius: var(--radius-md);
        color: var(--fg-muted);
        cursor: pointer;
        -webkit-tap-highlight-color: transparent;
    }

    .link-btn:active {
        background: var(--bg-hover);
    }

    .link-btn.active {
        color: var(--accent);
        border-color: var(--accent);
    }

    .link-btn svg {
        width: 18px;
        height: 18px;
    }

    .resize-select {
        flex: 1;
        padding: var(--spacing-sm) var(--spacing-md);
        background: var(--bg-primary);
        border: 1px solid var(--border);
        border-radius: var(--radius-md);
        color: var(--fg-primary);
        font-family: var(--font-mono);
        font-size: var(--font-size-md);
        min-height: var(--touch-target);
    }

    .name-section {
        padding: var(--spacing-xl);
    }

    .name-input {
        width: 100%;
        padding: var(--spacing-md);
        background: var(--bg-primary);
        border: 1px solid var(--border);
        border-radius: var(--radius-md);
        color: var(--fg-primary);
        font-family: var(--font-mono);
        font-size: var(--font-size-lg);
        min-height: var(--touch-target);
        margin-bottom: var(--spacing-lg);
    }

    .name-input:focus {
        outline: none;
        border-color: var(--accent);
    }

    .output-info {
        background: var(--bg-secondary);
        border-radius: var(--radius-md);
        padding: var(--spacing-lg);
        margin-bottom: var(--spacing-xl);
    }

    .output-info-title {
        font-size: var(--font-size-sm);
        color: var(--fg-muted);
        margin-bottom: var(--spacing-sm);
    }

    .output-item {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
        font-size: var(--font-size-md);
        color: var(--fg-primary);
        padding: var(--spacing-xs) 0;
    }

    .output-item-icon {
        width: 16px;
        height: 16px;
        opacity: 0.6;
    }

    .create-btn {
        width: 100%;
        padding: var(--spacing-lg);
        background: var(--accent);
        border: none;
        border-radius: var(--radius-md);
        color: var(--bg-primary);
        font-family: var(--font-mono);
        font-size: var(--font-size-lg);
        font-weight: 600;
        cursor: pointer;
        min-height: var(--touch-target);
        -webkit-tap-highlight-color: transparent;
    }

    .create-btn:active {
        opacity: 0.9;
    }

    .create-btn:disabled {
        opacity: 0.5;
        pointer-events: none;
    }

    .progress-section {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: var(--spacing-xl);
    }

    .progress-bar-container {
        width: 100%;
        max-width: 300px;
        height: 8px;
        background: var(--bg-primary);
        border-radius: 4px;
        overflow: hidden;
        margin-bottom: var(--spacing-lg);
    }

    .progress-bar {
        height: 100%;
        background: var(--accent);
        transition: width 0.2s ease;
    }

    .progress-text {
        font-size: var(--font-size-md);
        color: var(--fg-muted);
    }

    .error-message {
        color: var(--error);
        font-size: var(--font-size-sm);
        padding: var(--spacing-md);
        background: var(--bg-secondary);
        border-radius: var(--radius-md);
        margin: var(--spacing-md) var(--spacing-xl);
    }

    .hidden {
        display: none !important;
    }
`)


export default class PsdImporter extends EditorComponent {

    #overlay = null
    #step = 'drop'
    #psd = null
    #converter = new PsdConverter()
    #fileInput = null
    #aspectRatioLocked = true
    #aspectRatio = 1
    #existingNames = new Set()

    #elements = {}


    onConnected () {
        adoptStyleSheets(this.shadowRoot, styles)
        this.#converter.on('progress', ({stage, percent}) => this.#onProgress(stage, percent))
        this.#buildDOM()
    }


    open () {
        this.#reset()
        this.#overlay.open()
    }


    close () {
        this.#overlay.close()
    }


    setExistingNames (names) {
        this.#existingNames = new Set(names.map(n => n.toLowerCase()))
    }


    #reset () {
        this.#step = 'drop'
        this.#psd = null
        this.#aspectRatioLocked = true
        this.#updateStep()
    }


    #buildDOM () {
        this.#overlay = createElement('editor-overlay', {
            attrs: {fullscreen: '', 'no-close-on-backdrop': ''}
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
            attrs: {type: 'file', accept: '.psd'}
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
        dropZone.addEventListener('dragover', (e) => this.#handleDragOver(e, dropZone))
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
        switch (this.#step) {
            case 'drop':
                this.#elements.backBtn.innerHTML = '← Cancel'
                this.#elements.title.textContent = 'Import PSD'
                break
            case 'preview':
                this.#elements.backBtn.innerHTML = '← Back'
                this.#elements.title.textContent = this.#psd?.filename || 'Preview'
                break
            case 'progress':
                this.#elements.backBtn.classList.add('hidden')
                this.#elements.title.textContent = 'Creating...'
                break
        }

        if (this.#step !== 'progress') {
            this.#elements.backBtn.classList.remove('hidden')
        }
    }


    #handleBack () {
        switch (this.#step) {
            case 'drop':
                this.close()
                break
            case 'preview':
                this.#step = 'drop'
                this.#psd = null
                break
        }
        this.#updateStep()
    }




    #handleDragOver (e, dropZone) {
        e.preventDefault()
        dropZone.classList.add('dragover')
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
                const canvas = document.createElement('canvas')
                canvas.className = 'preview-canvas'
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

        this.#elements.nameInput.value = psd.filename || ''
        this.#elements.errorMessage.classList.add('hidden')
        this.#validateName()
    }


    #validateName () {
        const name = this.#sanitizeName(this.#elements.nameInput.value)
        const animatorName = `${name}Animator`.toLowerCase()
        const isDuplicate = this.#existingNames.has(animatorName)
        const isValid = name.length > 0 && !isDuplicate

        this.#elements.outputInfo.innerHTML = `
            <div class="output-info-title">This will create:</div>
            <div class="output-item"><span class="output-item-icon">${ICONS.image}</span> ${name || '...'}Spritesheet</div>
            <div class="output-item"><span class="output-item-icon">${ICONS.film}</span> ${name || '...'}Animator</div>
        `

        if (isDuplicate) {
            this.#elements.errorMessage.textContent = `"${name}Animator" already exists`
            this.#elements.errorMessage.classList.remove('hidden')
        } else {
            this.#elements.errorMessage.classList.add('hidden')
        }

        this.#elements.createBtn.disabled = !isValid
    }


    #sanitizeName (name) {
        return name.replace(/[^a-zA-Z0-9_]/g, '').replace(/^[0-9]/, '')
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
        const name = this.#sanitizeName(this.#elements.nameInput.value)
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

            this.dispatchEvent(new CustomEvent('complete', {
                bubbles: true,
                detail: result
            }))

            this.close()
        } catch (error) {
            this.#step = 'name'
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
