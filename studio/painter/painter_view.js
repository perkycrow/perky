import EditorComponent from '../../editor/editor_component.js'
import {createElement} from '../../application/dom_utils.js'
import PaintEngine from './paint_engine.js'
import {painterViewStyles} from './painter_view.styles.js'


export default class PainterView extends EditorComponent {

    static styles = [painterViewStyles]

    #engine = null
    #canvas = null
    #colorInput = null
    #sizeInput = null
    #hardnessInput = null
    #opacityInput = null
    #flowInput = null
    #smoothingInput = null
    #eraserBtn = null
    #smudgeBtn = null
    #clearBtn = null
    #addLayerBtn = null
    #removeLayerBtn = null
    #layerListEl = null
    #drawing = false
    #resizeObserver = null
    #boundPointerDown = null
    #boundPointerMove = null
    #boundPointerUp = null
    #boundPointerCancel = null

    onConnected () {
        this.#buildDOM()
        this.#engine = new PaintEngine(this.#canvas)
        this.#wireBrushControls()
        this.#wireToolButtons()
        this.#wireLayerControls()
        this.#wireDrawing()
        this.#observeResize()
        this.#updateBrush()
        this.#renderLayers()
    }


    onDisconnected () {
        this.#resizeObserver?.disconnect()
        this.#canvas.removeEventListener('pointerdown', this.#boundPointerDown)
        this.#canvas.removeEventListener('pointermove', this.#boundPointerMove)
        this.#canvas.removeEventListener('pointerup', this.#boundPointerUp)
        this.#canvas.removeEventListener('pointercancel', this.#boundPointerCancel)
        this.#engine?.dispose()
        this.#engine = null
    }


    get engine () {
        return this.#engine
    }


    get brush () {
        return this.#engine.brush
    }


    setBrush (params) {
        this.#engine.setBrush(params)
    }


    addLayer () {
        const index = this.#engine.addLayer()
        this.#engine.activeLayerIndex = index
        this.#renderLayers()
        return index
    }


    removeLayer (index) {
        this.#engine.removeLayer(index)
        this.#renderLayers()
    }


    clear () {
        this.#engine.clear()
        this.#emitChange()
    }


    #buildDOM () {
        this.#canvas = createElement('canvas')

        this.#colorInput = createElement('input', {type: 'color', value: '#000000'})

        this.#sizeInput = createElement('input', {type: 'range', min: '1', max: '100', value: '20'})
        this.#hardnessInput = createElement('input', {type: 'range', min: '0', max: '100', value: '80'})
        this.#opacityInput = createElement('input', {type: 'range', min: '1', max: '100', value: '100'})
        this.#flowInput = createElement('input', {type: 'range', min: '1', max: '100', value: '80'})
        this.#smoothingInput = createElement('input', {type: 'range', min: '0', max: '90', value: '90'})

        this.#eraserBtn = createElement('button', {text: 'Eraser'})
        this.#smudgeBtn = createElement('button', {text: 'Smudge'})
        this.#clearBtn = createElement('button', {text: 'Clear'})

        const controls = createElement('div', {class: 'controls'})
        controls.appendChild(this.#colorInput)
        controls.appendChild(buildLabel('Size', this.#sizeInput))
        controls.appendChild(buildLabel('Hardness', this.#hardnessInput))
        controls.appendChild(buildLabel('Opacity', this.#opacityInput))
        controls.appendChild(buildLabel('Flow', this.#flowInput))
        controls.appendChild(buildLabel('Smooth', this.#smoothingInput))
        controls.appendChild(this.#eraserBtn)
        controls.appendChild(this.#smudgeBtn)
        controls.appendChild(this.#clearBtn)

        this.#addLayerBtn = createElement('button', {text: '+', title: 'Add layer'})
        this.#removeLayerBtn = createElement('button', {html: '&minus;', title: 'Remove layer'})
        this.#layerListEl = createElement('div', {class: 'layer-list'})

        const headerActions = createElement('div', {class: 'layer-panel-actions'})
        headerActions.appendChild(this.#addLayerBtn)
        headerActions.appendChild(this.#removeLayerBtn)

        const header = createElement('div', {class: 'layer-panel-header'})
        header.appendChild(createElement('span', {text: 'Layers'}))
        header.appendChild(headerActions)

        const layerPanel = createElement('div', {class: 'layer-panel'})
        layerPanel.appendChild(header)
        layerPanel.appendChild(this.#layerListEl)

        this.shadowRoot.appendChild(controls)
        this.shadowRoot.appendChild(layerPanel)
        this.shadowRoot.appendChild(this.#canvas)
    }


    #wireBrushControls () {
        const update = () => this.#updateBrush()
        this.#colorInput.addEventListener('input', update)
        this.#sizeInput.addEventListener('input', update)
        this.#hardnessInput.addEventListener('input', update)
        this.#opacityInput.addEventListener('input', update)
        this.#flowInput.addEventListener('input', update)
        this.#smoothingInput.addEventListener('input', update)
    }


    #wireToolButtons () {
        this.#eraserBtn.addEventListener('click', () => {
            const active = !this.#engine.brush.eraser
            this.#engine.setBrush({eraser: active, smudge: false})
            this.#eraserBtn.classList.toggle('active', active)
            this.#smudgeBtn.classList.remove('active')
        })

        this.#smudgeBtn.addEventListener('click', () => {
            const active = !this.#engine.brush.smudge
            this.#engine.setBrush({smudge: active, eraser: false})
            this.#smudgeBtn.classList.toggle('active', active)
            this.#eraserBtn.classList.remove('active')
        })

        this.#clearBtn.addEventListener('click', () => this.clear())
    }


    #wireLayerControls () {
        this.#addLayerBtn.addEventListener('click', () => {
            this.addLayer()
            this.#emitChange()
        })

        this.#removeLayerBtn.addEventListener('click', () => {
            this.removeLayer(this.#engine.activeLayerIndex)
            this.#emitChange()
        })
    }


    #wireDrawing () {
        this.#boundPointerDown = (e) => {
            if (e.target !== this.#canvas) {
                return
            }
            this.#drawing = true
            this.#canvas.setPointerCapture(e.pointerId)
            this.#engine.beginStroke(e.offsetX, e.offsetY, e.pressure || 0.5)
            this.dispatchEvent(new CustomEvent('stroke-start'))
        }

        this.#boundPointerMove = (e) => {
            if (!this.#drawing) {
                return
            }
            const events = e.getCoalescedEvents?.() || [e]
            for (const ev of events) {
                this.#engine.continueStroke(ev.offsetX, ev.offsetY, ev.pressure || 0.5)
            }
        }

        this.#boundPointerUp = () => {
            if (!this.#drawing) {
                return
            }
            this.#drawing = false
            this.#engine.endStroke()
            this.dispatchEvent(new CustomEvent('stroke-end'))
            this.#emitChange()
        }

        this.#boundPointerCancel = () => {
            this.#drawing = false
            this.#engine.endStroke()
        }

        this.#canvas.addEventListener('pointerdown', this.#boundPointerDown)
        this.#canvas.addEventListener('pointermove', this.#boundPointerMove)
        this.#canvas.addEventListener('pointerup', this.#boundPointerUp)
        this.#canvas.addEventListener('pointercancel', this.#boundPointerCancel)
    }


    #observeResize () {
        this.#resizeObserver = new ResizeObserver(() => this.#handleResize())
        this.#resizeObserver.observe(this)
        this.#handleResize()
    }


    #handleResize () {
        const rect = this.getBoundingClientRect()
        if (rect.width === 0 || rect.height === 0) {
            return
        }
        this.#engine.resize(rect.width, rect.height)
    }


    #updateBrush () {
        this.#engine.setBrush({
            color: hexToRgb(this.#colorInput.value),
            size: Number(this.#sizeInput.value),
            hardness: Number(this.#hardnessInput.value) / 100,
            opacity: Number(this.#opacityInput.value) / 100,
            flow: Number(this.#flowInput.value) / 100,
            smoothing: Number(this.#smoothingInput.value) / 100
        })
    }


    #renderLayers () {
        this.#layerListEl.innerHTML = ''
        for (let i = this.#engine.layerCount - 1; i >= 0; i--) {
            this.#layerListEl.appendChild(this.#buildLayerItem(i))
        }
    }


    #buildLayerItem (index) {
        const info = this.#engine.getLayerInfo(index)
        const isActive = index === this.#engine.activeLayerIndex
        const item = createElement('div', {
            class: 'layer-item' + (isActive ? ' active' : '')
        })

        const checkbox = createElement('input', {type: 'checkbox', checked: info.visible})
        checkbox.addEventListener('change', () => {
            this.#engine.setLayerVisible(index, checkbox.checked)
            this.#emitChange()
        })

        const name = createElement('span', {class: 'layer-name', text: info.name})

        const opSlider = createElement('input', {
            type: 'range',
            min: '0',
            max: '100',
            value: String(Math.round(info.opacity * 100))
        })
        opSlider.addEventListener('input', () => {
            this.#engine.setLayerOpacity(index, Number(opSlider.value) / 100)
            this.#emitChange()
        })

        item.addEventListener('click', (e) => {
            if (e.target === checkbox || e.target === opSlider) {
                return
            }
            this.#engine.activeLayerIndex = index
            this.#renderLayers()
        })

        item.appendChild(checkbox)
        item.appendChild(name)
        item.appendChild(opSlider)
        return item
    }


    #emitChange () {
        this.dispatchEvent(new CustomEvent('change'))
    }

}


function buildLabel (text, input) {
    const label = createElement('label', {text: text + ' '})
    label.appendChild(input)
    return label
}


function hexToRgb (hex) {
    const r = parseInt(hex.slice(1, 3), 16) / 255
    const g = parseInt(hex.slice(3, 5), 16) / 255
    const b = parseInt(hex.slice(5, 7), 16) / 255
    return [r, g, b, 1]
}


customElements.define('painter-view', PainterView)
