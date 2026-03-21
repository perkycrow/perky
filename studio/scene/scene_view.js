import EditorComponent from '../../editor/editor_component.js'
import {createElement, adoptStyleSheets} from '../../application/dom_utils.js'
import '../../editor/layout/app_layout.js'
import '../../editor/number_input.js'
import {ICONS} from '../../editor/devtools/devtools_icons.js'
import {sceneViewStyles} from './scene_view.styles.js'


const GRID_COLOR = 'rgba(255, 255, 255, 0.06)'
const AXIS_COLOR = 'rgba(255, 255, 255, 0.15)'
const ENTITY_COLOR = 'rgba(100, 180, 255, 0.3)'
const ENTITY_BORDER = 'rgba(100, 180, 255, 0.8)'
const SELECTED_COLOR = 'rgba(255, 200, 80, 0.3)'
const SELECTED_BORDER = 'rgba(255, 200, 80, 1)'
const LABEL_COLOR = '#c8d8e8'
const ENTITY_SIZE = 1


export default class SceneView extends EditorComponent {

    #context = null
    #sceneConfig = null
    #entities = []
    #selectedIndex = -1
    #canvas = null
    #ctx = null
    #containerEl = null
    #appLayout = null
    #propsPanel = null
    #treeEl = null
    #drag = null
    #camera = {x: 0, y: 0, zoom: 40}
    #animFrame = null
    #boundResize = null

    onConnected () {
        adoptStyleSheets(this.shadowRoot, sceneViewStyles)
        this.#buildDOM()
        this.#boundResize = () => this.#resizeCanvas()
        window.addEventListener('resize', this.#boundResize)
        this.#resizeCanvas()
        this.#scheduleRender()
    }


    onDisconnected () {
        window.removeEventListener('resize', this.#boundResize)
        cancelAnimationFrame(this.#animFrame)
    }


    setContext ({manifest, textureSystem, studioConfig, scenes, sceneId}) {
        this.#context = {manifest, textureSystem, studioConfig}

        if (sceneId && scenes[sceneId]) {
            this.#sceneConfig = scenes[sceneId]
            this.#entities = (this.#sceneConfig.entities || []).map((entry, index) => ({
                ...entry,
                x: entry.x ?? 0,
                y: entry.y ?? 0,
                index
            }))
        }

        if (this.isConnected) {
            this.#updateTree()
            this.#scheduleRender()
        }
    }


    #buildDOM () {
        this.#appLayout = createElement('app-layout', {
            attrs: {'no-menu': '', 'no-close': '', 'no-footer': ''}
        })

        const headerStart = createElement('div', {
            class: 'header-controls',
            attrs: {slot: 'header-start'}
        })

        const backBtn = createElement('button', {
            class: 'toolbar-btn',
            html: ICONS.chevronLeft,
            title: 'Back to hub'
        })
        backBtn.addEventListener('click', () => {
            window.location.href = 'index.html'
        })
        headerStart.appendChild(backBtn)
        this.#appLayout.appendChild(headerStart)

        this.#containerEl = createElement('div', {class: 'scene-container'})

        const viewport = createElement('div', {class: 'viewport'})
        this.#canvas = document.createElement('canvas')
        this.#ctx = this.#canvas.getContext('2d')
        this.#setupCanvasEvents()
        viewport.appendChild(this.#canvas)
        this.#containerEl.appendChild(viewport)

        this.#propsPanel = createElement('div', {class: 'properties-panel'})
        this.#buildPropsPanel()
        this.#containerEl.appendChild(this.#propsPanel)

        this.#appLayout.appendChild(this.#containerEl)
        this.shadowRoot.appendChild(this.#appLayout)
    }


    #buildPropsPanel () {
        this.#propsPanel.innerHTML = ''

        this.#propsPanel.appendChild(createElement('div', {
            class: 'panel-title',
            text: 'Properties'
        }))

        if (this.#selectedIndex >= 0) {
            const entity = this.#entities[this.#selectedIndex]
            this.#addPropInput('x', entity.x, (v) => this.#updateEntityProp('x', v))
            this.#addPropInput('y', entity.y, (v) => this.#updateEntityProp('y', v))
        } else {
            this.#propsPanel.appendChild(createElement('div', {
                class: 'empty-message',
                text: 'Select an entity'
            }))
        }

        this.#treeEl = createElement('div', {class: 'scene-tree'})
        this.#propsPanel.appendChild(this.#treeEl)
        this.#updateTree()
    }


    #addPropInput (label, value, onChange) {
        const row = createElement('div', {class: 'prop-row'})
        row.appendChild(createElement('span', {class: 'prop-label', text: label}))

        const input = createElement('input', {
            class: 'prop-input',
            attrs: {type: 'number', step: '0.5', value: String(value)}
        })

        input.addEventListener('change', () => {
            onChange(parseFloat(input.value) || 0)
        })

        row.appendChild(input)
        this.#propsPanel.appendChild(row)
    }


    #updateEntityProp (prop, value) {
        if (this.#selectedIndex < 0) {
            return
        }

        this.#entities[this.#selectedIndex][prop] = value
        this.#scheduleRender()
    }


    #updateTree () {
        if (!this.#treeEl) {
            return
        }

        this.#treeEl.innerHTML = ''
        this.#treeEl.appendChild(createElement('div', {
            class: 'panel-title',
            text: 'Scene Tree'
        }))

        for (let i = 0; i < this.#entities.length; i++) {
            const entity = this.#entities[i]
            const item = createElement('div', {
                class: `tree-item${i === this.#selectedIndex ? ' selected' : ''}`,
                text: entity.$id || entity.type
            })

            item.addEventListener('click', () => {
                this.#selectEntity(i)
            })

            this.#treeEl.appendChild(item)
        }
    }


    #selectEntity (index) {
        this.#selectedIndex = index
        this.#buildPropsPanel()
        this.#scheduleRender()
    }


    #setupCanvasEvents () {
        this.#canvas.addEventListener('pointerdown', (e) => this.#onPointerDown(e))
        this.#canvas.addEventListener('pointermove', (e) => this.#onPointerMove(e))
        this.#canvas.addEventListener('pointerup', () => this.#onPointerUp())
        this.#canvas.addEventListener('wheel', (e) => this.#onWheel(e))
    }


    #onPointerDown (e) {
        const world = this.#screenToWorld(e.offsetX, e.offsetY)
        const hit = this.#pickEntity(world.x, world.y)

        if (hit >= 0) {
            this.#selectEntity(hit)
            const entity = this.#entities[hit]
            this.#drag = {
                startWorldX: world.x,
                startWorldY: world.y,
                startEntityX: entity.x,
                startEntityY: entity.y
            }
            this.#canvas.setPointerCapture(e.pointerId)
        } else {
            this.#selectEntity(-1)
            this.#drag = {
                startWorldX: world.x,
                startWorldY: world.y,
                startCameraX: this.#camera.x,
                startCameraY: this.#camera.y,
                panning: true
            }
            this.#canvas.setPointerCapture(e.pointerId)
        }
    }


    #onPointerMove (e) {
        if (!this.#drag) {
            return
        }

        const world = this.#screenToWorld(e.offsetX, e.offsetY)

        if (this.#drag.panning) {
            const dx = world.x - this.#drag.startWorldX
            const dy = world.y - this.#drag.startWorldY
            this.#camera.x = this.#drag.startCameraX - dx
            this.#camera.y = this.#drag.startCameraY - dy
        } else {
            const dx = world.x - this.#drag.startWorldX
            const dy = world.y - this.#drag.startWorldY
            this.#entities[this.#selectedIndex].x = roundHalf(this.#drag.startEntityX + dx)
            this.#entities[this.#selectedIndex].y = roundHalf(this.#drag.startEntityY + dy)
            this.#buildPropsPanel()
        }

        this.#scheduleRender()
    }


    #onPointerUp () {
        this.#drag = null
    }


    #onWheel (e) {
        e.preventDefault()
        const factor = e.deltaY > 0 ? 0.9 : 1.1
        this.#camera.zoom = clamp(this.#camera.zoom * factor, 10, 200)
        this.#scheduleRender()
    }


    #pickEntity (worldX, worldY) {
        const halfSize = ENTITY_SIZE / 2

        for (let i = this.#entities.length - 1; i >= 0; i--) {
            const entity = this.#entities[i]
            if (worldX >= entity.x - halfSize && worldX <= entity.x + halfSize &&
                worldY >= entity.y - halfSize && worldY <= entity.y + halfSize) {
                return i
            }
        }

        return -1
    }


    #screenToWorld (screenX, screenY) {
        const w = this.#canvas.width
        const h = this.#canvas.height
        const zoom = this.#camera.zoom

        return {
            x: (screenX - w / 2) / zoom + this.#camera.x,
            y: -(screenY - h / 2) / zoom + this.#camera.y
        }
    }


    #worldToScreen (worldX, worldY) {
        const w = this.#canvas.width
        const h = this.#canvas.height
        const zoom = this.#camera.zoom

        return {
            x: (worldX - this.#camera.x) * zoom + w / 2,
            y: -(worldY - this.#camera.y) * zoom + h / 2
        }
    }


    #resizeCanvas () {
        if (!this.#canvas) {
            return
        }

        const viewport = this.#canvas.parentElement
        if (!viewport) {
            return
        }

        this.#canvas.width = viewport.clientWidth
        this.#canvas.height = viewport.clientHeight
        this.#scheduleRender()
    }


    #scheduleRender () {
        if (this.#animFrame) {
            return
        }

        this.#animFrame = requestAnimationFrame(() => {
            this.#animFrame = null
            this.#renderFrame()
        })
    }


    #renderFrame () {
        const ctx = this.#ctx
        const w = this.#canvas.width
        const h = this.#canvas.height

        ctx.clearRect(0, 0, w, h)

        this.#renderGrid()

        for (let i = 0; i < this.#entities.length; i++) {
            this.#renderEntity(i)
        }
    }


    #renderGrid () {
        const ctx = this.#ctx
        const w = this.#canvas.width
        const h = this.#canvas.height

        const topLeft = this.#screenToWorld(0, 0)
        const bottomRight = this.#screenToWorld(w, h)

        const startX = Math.floor(topLeft.x)
        const endX = Math.ceil(bottomRight.x)
        const startY = Math.floor(bottomRight.y)
        const endY = Math.ceil(topLeft.y)

        ctx.strokeStyle = GRID_COLOR
        ctx.lineWidth = 1

        for (let x = startX; x <= endX; x++) {
            const screen = this.#worldToScreen(x, 0)
            ctx.beginPath()
            ctx.moveTo(Math.round(screen.x) + 0.5, 0)
            ctx.lineTo(Math.round(screen.x) + 0.5, h)
            ctx.stroke()
        }

        for (let y = startY; y <= endY; y++) {
            const screen = this.#worldToScreen(0, y)
            ctx.beginPath()
            ctx.moveTo(0, Math.round(screen.y) + 0.5)
            ctx.lineTo(w, Math.round(screen.y) + 0.5)
            ctx.stroke()
        }

        ctx.strokeStyle = AXIS_COLOR
        ctx.lineWidth = 1

        const originScreen = this.#worldToScreen(0, 0)
        ctx.beginPath()
        ctx.moveTo(Math.round(originScreen.x) + 0.5, 0)
        ctx.lineTo(Math.round(originScreen.x) + 0.5, h)
        ctx.stroke()

        ctx.beginPath()
        ctx.moveTo(0, Math.round(originScreen.y) + 0.5)
        ctx.lineTo(w, Math.round(originScreen.y) + 0.5)
        ctx.stroke()
    }


    #renderEntity (index) {
        const ctx = this.#ctx
        const entity = this.#entities[index]
        const isSelected = index === this.#selectedIndex
        const zoom = this.#camera.zoom
        const size = ENTITY_SIZE * zoom

        const screen = this.#worldToScreen(entity.x, entity.y)

        ctx.fillStyle = isSelected ? SELECTED_COLOR : ENTITY_COLOR
        ctx.strokeStyle = isSelected ? SELECTED_BORDER : ENTITY_BORDER
        ctx.lineWidth = isSelected ? 2 : 1
        ctx.fillRect(screen.x - size / 2, screen.y - size / 2, size, size)
        ctx.strokeRect(screen.x - size / 2, screen.y - size / 2, size, size)

        const label = entity.$id || entity.type
        ctx.fillStyle = LABEL_COLOR
        ctx.font = '11px -apple-system, BlinkMacSystemFont, sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText(label, screen.x, screen.y + size / 2 + 14)
    }

}


customElements.define('scene-view', SceneView)


function roundHalf (value) {
    return Math.round(value * 2) / 2
}


function clamp (value, min, max) {
    return Math.min(max, Math.max(min, value))
}
