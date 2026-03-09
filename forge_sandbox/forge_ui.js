import {createElement} from '../application/dom_utils.js'


const OPERATIONS = [
    {id: 'union', label: '∪'},
    {id: 'subtract', label: '−'},
    {id: 'intersect', label: '∩'}
]

const SHAPES = [
    {id: 'box', label: '▢'},
    {id: 'sphere', label: '●'},
    {id: 'cylinder', label: '⬡'},
    {id: 'cone', label: '△'}
]

const COLORS = [
    {color: [1, 1, 1], css: '#ffffff'},
    {color: [0.9, 0.3, 0.3], css: '#e64d4d'},
    {color: [0.9, 0.6, 0.3], css: '#e6994d'},
    {color: [0.9, 0.9, 0.3], css: '#e6e64d'},
    {color: [0.3, 0.8, 0.4], css: '#4dcc66'},
    {color: [0.3, 0.5, 0.9], css: '#4d80e6'},
    {color: [0.7, 0.3, 0.9], css: '#b34de6'},
    {color: [0.5, 0.5, 0.5], css: '#808080'}
]

const BUTTON_STYLE = {
    width: '44px',
    height: '44px',
    borderRadius: '8px',
    border: '2px solid transparent',
    color: 'white',
    fontSize: '20px',
    cursor: 'pointer',
    touchAction: 'manipulation'
}


export default class ForgeUI {

    #container
    #forge
    #operationBar = null
    #operationButtons = {}
    #shapePalette = null
    #colorPalette = null
    #snapButton = null
    #fileInput = null
    #toast = null

    constructor (container, forge) {
        this.#container = container
        this.#forge = forge
        this.#createMenuBar()
        this.#createAddButton()
        this.#createShapePalette()
        this.#createSnapButton()
        this.#createOperationBar()
    }


    showOperationToolbar (activeOperation) {
        this.#operationBar.style.display = 'flex'
        this.#highlightOperation(activeOperation)
    }


    hideOperationToolbar () {
        this.#operationBar.style.display = 'none'
        this.#hideColorPalette()
    }


    updateOperationToolbar (activeOperation) {
        this.#highlightOperation(activeOperation)
    }


    showToast (message) {
        if (this.#toast) {
            this.#toast.remove()
        }

        const div = createElement('div', {
            text: message,
            style: {
                position: 'absolute',
                top: '24px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'rgba(30, 30, 50, 0.85)',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '14px',
                zIndex: '10',
                pointerEvents: 'none'
            }
        })

        this.#container.appendChild(div)
        this.#toast = div

        setTimeout(() => {
            if (this.#toast === div) {
                div.remove()
                this.#toast = null
            }
        }, 600)
    }


    #createMenuBar () {
        const bar = document.createElement('div')
        Object.assign(bar.style, {
            position: 'absolute',
            top: '24px',
            left: '24px',
            display: 'flex',
            gap: '8px',
            background: 'rgba(30, 30, 50, 0.85)',
            padding: '8px',
            borderRadius: '12px',
            zIndex: '10'
        })

        const newBtn = createElement('button', {
            text: '📄',
            style: {...BUTTON_STYLE, background: 'rgba(255, 255, 255, 0.1)'}
        })
        newBtn.addEventListener('click', () => this.#forge.newProject())
        bar.appendChild(newBtn)

        const importBtn = createElement('button', {
            text: '📥',
            style: {...BUTTON_STYLE, background: 'rgba(255, 255, 255, 0.1)'}
        })
        importBtn.addEventListener('click', () => this.#fileInput.click())
        bar.appendChild(importBtn)

        const exportBtn = createElement('button', {
            text: '📤',
            style: {...BUTTON_STYLE, background: 'rgba(255, 255, 255, 0.1)'}
        })
        exportBtn.addEventListener('click', () => this.#forge.exportProject())
        bar.appendChild(exportBtn)

        this.#container.appendChild(bar)

        this.#fileInput = createElement('input', {
            type: 'file',
            attrs: {accept: '.json'},
            style: {display: 'none'}
        })
        this.#fileInput.addEventListener('change', () => {
            if (this.#fileInput.files[0]) {
                this.#forge.importProject(this.#fileInput.files[0])
                this.#fileInput.value = ''
            }
        })
        this.#container.appendChild(this.#fileInput)
    }


    #createAddButton () {
        const button = createElement('button', {
            text: '+',
            style: {
                position: 'absolute',
                bottom: '24px',
                right: '24px',
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                border: 'none',
                background: '#4a90d9',
                color: 'white',
                fontSize: '28px',
                cursor: 'pointer',
                zIndex: '10',
                touchAction: 'manipulation'
            }
        })
        button.addEventListener('click', () => this.#toggleShapePalette())
        this.#container.appendChild(button)
    }


    #createShapePalette () {
        const palette = document.createElement('div')
        Object.assign(palette.style, {
            position: 'absolute',
            bottom: '92px',
            right: '18px',
            display: 'none',
            flexDirection: 'column',
            gap: '8px',
            background: 'rgba(30, 30, 50, 0.85)',
            padding: '8px',
            borderRadius: '12px',
            zIndex: '10'
        })

        for (const shape of SHAPES) {
            const btn = createElement('button', {
                text: shape.label,
                style: {...BUTTON_STYLE, background: 'rgba(255, 255, 255, 0.1)'}
            })
            btn.addEventListener('click', () => {
                this.#forge.addBrush(shape.id)
                this.#hideShapePalette()
            })
            palette.appendChild(btn)
        }

        this.#container.appendChild(palette)
        this.#shapePalette = palette
    }


    #toggleShapePalette () {
        if (this.#shapePalette.style.display === 'none') {
            this.#shapePalette.style.display = 'flex'
        } else {
            this.#hideShapePalette()
        }
    }


    #hideShapePalette () {
        this.#shapePalette.style.display = 'none'
    }


    updateSnapButton (enabled) {
        this.#snapButton.style.background = enabled ? '#4a90d9' : 'rgba(255, 255, 255, 0.1)'
        this.#snapButton.style.borderColor = enabled ? '#6ab0ff' : 'transparent'
    }


    #createSnapButton () {
        const button = createElement('button', {
            text: '⊞',
            style: {
                position: 'absolute',
                bottom: '24px',
                left: '24px',
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                border: '2px solid #6ab0ff',
                background: '#4a90d9',
                color: 'white',
                fontSize: '20px',
                cursor: 'pointer',
                zIndex: '10',
                touchAction: 'manipulation'
            }
        })
        button.addEventListener('click', () => this.#forge.toggleSnap())
        this.#container.appendChild(button)
        this.#snapButton = button
    }


    #createOperationBar () {
        const bar = document.createElement('div')
        Object.assign(bar.style, {
            position: 'absolute',
            bottom: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'none',
            gap: '8px',
            background: 'rgba(30, 30, 50, 0.85)',
            padding: '8px',
            borderRadius: '12px',
            zIndex: '10'
        })

        for (const op of OPERATIONS) {
            const btn = createElement('button', {
                text: op.label,
                style: {...BUTTON_STYLE, background: 'rgba(255, 255, 255, 0.1)'}
            })
            btn.addEventListener('click', () => this.#forge.setOperation(op.id))
            bar.appendChild(btn)
            this.#operationButtons[op.id] = btn
        }

        const separator = createElement('div', {
            style: {width: '1px', background: 'rgba(255, 255, 255, 0.2)', margin: '4px 0'}
        })
        bar.appendChild(separator)

        const dupBtn = createElement('button', {
            text: '⧉',
            style: {...BUTTON_STYLE, background: 'rgba(255, 255, 255, 0.1)'}
        })
        dupBtn.addEventListener('click', () => this.#forge.duplicateBrush())
        bar.appendChild(dupBtn)

        const delBtn = createElement('button', {
            text: '✕',
            style: {...BUTTON_STYLE, background: 'rgba(255, 255, 255, 0.1)'}
        })
        delBtn.addEventListener('click', () => this.#forge.deleteBrush())
        bar.appendChild(delBtn)

        const colorSep = createElement('div', {
            style: {width: '1px', background: 'rgba(255, 255, 255, 0.2)', margin: '4px 0'}
        })
        bar.appendChild(colorSep)

        const colorBtn = createElement('button', {
            text: '🎨',
            style: {...BUTTON_STYLE, background: 'rgba(255, 255, 255, 0.1)'}
        })
        colorBtn.addEventListener('click', () => this.#toggleColorPalette())
        bar.appendChild(colorBtn)

        this.#container.appendChild(bar)
        this.#operationBar = bar

        this.#createColorPalette()
    }


    #createColorPalette () {
        const palette = document.createElement('div')
        Object.assign(palette.style, {
            position: 'absolute',
            bottom: '84px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'none',
            gap: '6px',
            background: 'rgba(30, 30, 50, 0.85)',
            padding: '8px',
            borderRadius: '12px',
            zIndex: '10',
            flexWrap: 'wrap',
            maxWidth: '200px',
            justifyContent: 'center'
        })

        for (const entry of COLORS) {
            const btn = document.createElement('button')
            Object.assign(btn.style, {
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                background: entry.css,
                cursor: 'pointer',
                touchAction: 'manipulation'
            })
            btn.addEventListener('click', () => {
                this.#forge.setBrushColor(entry.color)
                this.#hideColorPalette()
            })
            palette.appendChild(btn)
        }

        this.#container.appendChild(palette)
        this.#colorPalette = palette
    }


    #toggleColorPalette () {
        if (this.#colorPalette.style.display === 'none') {
            this.#colorPalette.style.display = 'flex'
        } else {
            this.#hideColorPalette()
        }
    }


    #hideColorPalette () {
        this.#colorPalette.style.display = 'none'
    }


    #highlightOperation (activeOperation) {
        for (const op of OPERATIONS) {
            const btn = this.#operationButtons[op.id]
            if (op.id === activeOperation) {
                btn.style.background = '#4a90d9'
                btn.style.borderColor = '#6ab0ff'
            } else {
                btn.style.background = 'rgba(255, 255, 255, 0.1)'
                btn.style.borderColor = 'transparent'
            }
        }
    }

}
