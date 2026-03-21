import EditorComponent from '../../editor/editor_component.js'
import {createElement, adoptStyleSheets} from '../../application/dom_utils.js'
import '../../editor/layout/app_layout.js'
import '../../editor/number_input.js'
import {ICONS} from '../../editor/devtools/devtools_icons.js'
import PerkyStore from '../../io/perky_store.js'
import Stage from '../../game/stage.js'
import World from '../../game/world.js'
import WebGLRenderer from '../../render/webgl_renderer.js'
import {sceneViewStyles} from './scene_view.styles.js'


const GRID_COLOR = 'rgba(255, 255, 255, 0.06)'
const AXIS_COLOR = 'rgba(255, 255, 255, 0.15)'
const SELECTED_BORDER = 'rgba(255, 200, 80, 1)'
const LABEL_COLOR = '#c8d8e8'
const ENTITY_SIZE = 1


export default class SceneView extends EditorComponent {

    #context = null
    #sceneId = null
    #entities = []
    #selectedIndex = -1
    #containerEl = null
    #appLayout = null
    #propsPanel = null
    #treeEl = null
    #drag = null
    #animFrame = null
    #boundResize = null
    #store = new PerkyStore()
    #dirty = false
    #autoSaveTimer = null
    #boundBeforeUnload = null
    #stage = null
    #renderer = null
    #overlayCanvas = null
    #overlayCtx = null

    onConnected () {
        adoptStyleSheets(this.shadowRoot, sceneViewStyles)
        this.#buildDOM()
        this.#boundResize = () => this.#resizeCanvas()
        window.addEventListener('resize', this.#boundResize)
        this.#boundBeforeUnload = () => this.#flushSave()
        window.addEventListener('beforeunload', this.#boundBeforeUnload)
        this.#resizeCanvas()
        this.#scheduleRender()
    }


    onDisconnected () {
        window.removeEventListener('resize', this.#boundResize)
        window.removeEventListener('beforeunload', this.#boundBeforeUnload)
        clearTimeout(this.#autoSaveTimer)
        this.#flushSave()
        cancelAnimationFrame(this.#animFrame)
        this.#stage?.stop()
    }


    setContext ({manifest, textureSystem, studioConfig, scenes, sceneId, wiring}) {
        this.#context = {manifest, textureSystem, studioConfig, wiring}
        this.#sceneId = sceneId || null

        if (sceneId && scenes[sceneId]) {
            const config = scenes[sceneId]
            this.#entities = (config.entities || []).map((entry, index) => ({
                ...entry,
                x: entry.x ?? 0,
                y: entry.y ?? 0,
                index
            }))
        }

        this.#initStage()

        if (this.isConnected) {
            this.#updateTree()
            this.#scheduleRender()
        }
    }


    #initStage () {
        const {manifest, textureSystem, wiring} = this.#context

        if (!wiring) {
            return
        }

        const gameProxy = {
            getSource: (id) => manifest.getSource(id),
            getSpritesheet: (id) => textureSystem.getSpritesheet(id),
            getRegion: (id) => textureSystem.getRegion(id),
            getLayer: () => null,
            createLayer: () => null,
            textureSystem,
            camera: null
        }

        this.#stage = new Stage({game: gameProxy})
        const world = this.#stage.create(World, {$bind: 'world'})

        wiring.registerViews(this.#stage)
        this.#stage.start()

        for (const entry of this.#entities) {
            const EntityClass = wiring.get('entities', entry.type)

            if (!EntityClass) {
                continue
            }

            world.create(EntityClass, {x: entry.x, y: entry.y, $id: entry.$id})
        }

        this.#stage.syncViews()
        this.#scheduleRender()
        requestAnimationFrame(() => this.#scheduleRender())
    }


    #rebuildStage () {
        if (this.#stage) {
            this.#stage.stop()
            this.#stage = null
        }

        this.#initStage()
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

        this.#renderer = new WebGLRenderer({
            canvas: document.createElement('canvas'),
            enableCulling: false,
            enableDebugGizmos: false
        })
        this.#renderer.camera.setUnitsInView({width: 26, height: 15})
        viewport.appendChild(this.#renderer.canvas)

        this.#overlayCanvas = document.createElement('canvas')
        this.#overlayCanvas.style.cssText = 'position:absolute;top:0;left:0;pointer-events:none'
        this.#overlayCtx = this.#overlayCanvas.getContext('2d')
        viewport.appendChild(this.#overlayCanvas)

        this.#setupCanvasEvents()
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
        this.#syncEntityPositions()
        this.#markDirty()
        this.#scheduleRender()
    }


    #syncEntityPositions () {
        if (!this.#stage?.world) {
            return
        }

        for (const worldEntity of this.#stage.world.entities) {
            const entry = this.#entities.find(e => e.type === worldEntity.constructor.name)

            if (entry) {
                worldEntity.x = entry.x
                worldEntity.y = entry.y
            }
        }

        this.#stage.syncViews()
    }


    #markDirty () {
        this.#dirty = true
        clearTimeout(this.#autoSaveTimer)
        this.#autoSaveTimer = setTimeout(() => this.#autoSave(), 2000)
    }


    #flushSave () {
        if (this.#dirty) {
            clearTimeout(this.#autoSaveTimer)
            this.#autoSave()
        }
    }


    async #autoSave () {
        if (!this.#dirty || !this.#sceneId) {
            return
        }

        this.#dirty = false

        const config = this.#buildSceneConfig()
        const blob = new Blob([JSON.stringify(config, null, 4)], {type: 'application/json'})

        await this.#store.save(this.#sceneId, {
            type: 'scene',
            name: this.#sceneId,
            files: [{name: `${this.#sceneId}.json`, blob}]
        })
    }


    #buildSceneConfig () {
        return {
            entities: this.#entities.map(buildEntityEntry)
        }
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
        const canvas = this.#renderer.canvas
        canvas.addEventListener('pointerdown', (e) => this.#onPointerDown(e))
        canvas.addEventListener('pointermove', (e) => this.#onPointerMove(e))
        canvas.addEventListener('pointerup', () => this.#onPointerUp())
        canvas.addEventListener('wheel', (e) => this.#onWheel(e))
    }


    #onPointerDown (e) {
        const world = this.#screenToWorld(e.offsetX, e.offsetY)
        const hit = this.#pickEntity(world.x, world.y)
        const canvas = this.#renderer.canvas

        if (hit >= 0) {
            this.#selectEntity(hit)
            const entity = this.#entities[hit]
            this.#drag = {
                startWorldX: world.x,
                startWorldY: world.y,
                startEntityX: entity.x,
                startEntityY: entity.y
            }
            canvas.setPointerCapture(e.pointerId)
        } else {
            this.#selectEntity(-1)
            const cam = this.#renderer.camera
            this.#drag = {
                startWorldX: world.x,
                startWorldY: world.y,
                startScreenX: e.offsetX,
                startScreenY: e.offsetY,
                startCameraX: cam.x,
                startCameraY: cam.y,
                panning: true
            }
            canvas.setPointerCapture(e.pointerId)
        }
    }


    #onPointerMove (e) {
        if (!this.#drag) {
            return
        }

        const world = this.#screenToWorld(e.offsetX, e.offsetY)

        if (this.#drag.panning) {
            const cam = this.#renderer.camera
            const ppu = cam.pixelsPerUnit
            cam.x = this.#drag.startCameraX - (e.offsetX - this.#drag.startScreenX) / ppu
            cam.y = this.#drag.startCameraY + (e.offsetY - this.#drag.startScreenY) / ppu
        } else {
            const dx = world.x - this.#drag.startWorldX
            const dy = world.y - this.#drag.startWorldY
            this.#entities[this.#selectedIndex].x = roundHalf(this.#drag.startEntityX + dx)
            this.#entities[this.#selectedIndex].y = roundHalf(this.#drag.startEntityY + dy)
            this.#syncEntityPositions()
            this.#markDirty()
            this.#buildPropsPanel()
        }

        this.#scheduleRender()
    }


    #onPointerUp () {
        this.#drag = null
    }


    #onWheel (e) {
        e.preventDefault()
        const cam = this.#renderer.camera
        const factor = e.deltaY > 0 ? 0.9 : 1.1
        const currentZoom = cam.zoom
        cam.setZoom(clamp(currentZoom * factor, 0.3, 5))
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
        return this.#renderer.camera.screenToWorld(screenX, screenY)
    }


    #resizeCanvas () {
        const viewport = this.#renderer?.canvas?.parentElement
        if (!viewport) {
            return
        }

        const w = viewport.clientWidth
        const h = viewport.clientHeight

        this.#renderer.resize(w, h)
        this.#overlayCanvas.width = w
        this.#overlayCanvas.height = h
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
        if (this.#stage) {
            this.#renderer.render(this.#stage.viewsGroup)
        }

        this.#renderOverlay()
    }


    #renderOverlay () {
        const ctx = this.#overlayCtx
        const w = this.#overlayCanvas.width
        const h = this.#overlayCanvas.height

        ctx.clearRect(0, 0, w, h)
        this.#renderGrid()
        this.#renderSelectionHighlight()
        this.#renderLabels()
    }


    #renderGrid () {
        const ctx = this.#overlayCtx
        const cam = this.#renderer.camera
        const w = this.#overlayCanvas.width
        const h = this.#overlayCanvas.height

        const topLeft = cam.screenToWorld(0, 0)
        const bottomRight = cam.screenToWorld(w, h)

        const startX = Math.floor(topLeft.x)
        const endX = Math.ceil(bottomRight.x)
        const startY = Math.floor(bottomRight.y)
        const endY = Math.ceil(topLeft.y)

        ctx.strokeStyle = GRID_COLOR
        ctx.lineWidth = 1

        for (let x = startX; x <= endX; x++) {
            const screen = cam.worldToScreen(x, 0)
            ctx.beginPath()
            ctx.moveTo(Math.round(screen.x) + 0.5, 0)
            ctx.lineTo(Math.round(screen.x) + 0.5, h)
            ctx.stroke()
        }

        for (let y = startY; y <= endY; y++) {
            const screen = cam.worldToScreen(0, y)
            ctx.beginPath()
            ctx.moveTo(0, Math.round(screen.y) + 0.5)
            ctx.lineTo(w, Math.round(screen.y) + 0.5)
            ctx.stroke()
        }

        ctx.strokeStyle = AXIS_COLOR
        ctx.lineWidth = 1

        const origin = cam.worldToScreen(0, 0)
        ctx.beginPath()
        ctx.moveTo(Math.round(origin.x) + 0.5, 0)
        ctx.lineTo(Math.round(origin.x) + 0.5, h)
        ctx.stroke()

        ctx.beginPath()
        ctx.moveTo(0, Math.round(origin.y) + 0.5)
        ctx.lineTo(w, Math.round(origin.y) + 0.5)
        ctx.stroke()
    }


    #renderSelectionHighlight () {
        if (this.#selectedIndex < 0) {
            return
        }

        const ctx = this.#overlayCtx
        const cam = this.#renderer.camera
        const entity = this.#entities[this.#selectedIndex]
        const ppu = cam.pixelsPerUnit
        const size = ENTITY_SIZE * ppu
        const screen = cam.worldToScreen(entity.x, entity.y)

        ctx.strokeStyle = SELECTED_BORDER
        ctx.lineWidth = 2
        ctx.setLineDash([4, 4])
        ctx.strokeRect(screen.x - size / 2, screen.y - size / 2, size, size)
        ctx.setLineDash([])
    }


    #renderLabels () {
        const ctx = this.#overlayCtx
        const cam = this.#renderer.camera
        const ppu = cam.pixelsPerUnit

        for (const entity of this.#entities) {
            const screen = cam.worldToScreen(entity.x, entity.y)
            const label = entity.$id || entity.type

            ctx.fillStyle = LABEL_COLOR
            ctx.font = '11px -apple-system, BlinkMacSystemFont, sans-serif'
            ctx.textAlign = 'center'
            ctx.fillText(label, screen.x, screen.y + (ENTITY_SIZE * ppu) / 2 + 14)
        }
    }

}


customElements.define('scene-view', SceneView)


function roundHalf (value) {
    return Math.round(value * 2) / 2
}


function clamp (value, min, max) {
    return Math.min(max, Math.max(min, value))
}


function buildEntityEntry (entity) {
    const entry = {type: entity.type}

    if (entity.$id) {
        entry.$id = entity.$id
    }

    if (entity.x !== 0) {
        entry.x = entity.x
    }

    if (entity.y !== 0) {
        entry.y = entity.y
    }

    return entry
}
