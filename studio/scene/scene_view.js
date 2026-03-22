import EditorComponent from '../../editor/editor_component.js'
import {createElement, adoptStyleSheets} from '../../application/dom_utils.js'
import '../../editor/layout/app_layout.js'
import '../../editor/number_input.js'
import {ICONS} from '../../editor/devtools/devtools_icons.js'
import PerkyStore from '../../io/perky_store.js'
import Stage from '../../game/stage.js'
import World from '../../game/world.js'
import RenderSystem from '../../render/render_system.js'
import {sceneViewStyles} from './scene_view.styles.js'


const GRID_COLOR = 'rgba(255, 255, 255, 0.06)'
const AXIS_COLOR = 'rgba(255, 255, 255, 0.15)'
const CAMERA_FRAME_COLOR = 'rgba(255, 255, 255, 0.3)'
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
    #store = new PerkyStore()
    #dirty = false
    #autoSaveTimer = null
    #boundBeforeUnload = null
    #stage = null
    #renderSystem = null

    onConnected () {
        adoptStyleSheets(this.shadowRoot, sceneViewStyles)
        this.#buildDOM()
        this.#boundBeforeUnload = () => this.#flushSave()
        window.addEventListener('beforeunload', this.#boundBeforeUnload)

        if (this.#context) {
            this.#initStage()
            this.#updateTree()
        }

        this.#scheduleRender()
    }


    onDisconnected () {
        window.removeEventListener('beforeunload', this.#boundBeforeUnload)
        clearTimeout(this.#autoSaveTimer)
        this.#flushSave()
        cancelAnimationFrame(this.#animFrame)
        this.#stage?.stop()
        this.#renderSystem?.dismount()
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


    get camera () {
        return this.#renderSystem?.getCamera('main')
    }


    #initStage () {
        const {manifest, textureSystem, wiring} = this.#context

        if (!wiring || !this.#renderSystem) {
            return
        }

        const camera = this.camera

        const gameProxy = {
            getSource: (id) => manifest.getSource(id),
            getSpritesheet: (id) => textureSystem.getSpritesheet(id),
            getRegion: (id) => textureSystem.getRegion(id),
            getLayer: (name) => this.#renderSystem.getLayer(name),
            createLayer: (...args) => this.#renderSystem.createLayer(...args),
            textureSystem,
            camera
        }

        this.#stage = new Stage({game: gameProxy})
        const world = this.#stage.create(World, {$bind: 'world'})

        wiring.registerViews(this.#stage)
        this.#stage.start()

        this.#renderSystem.getLayer('game').setContent(this.#stage.viewsGroup)

        for (const entry of this.#entities) {
            const EntityClass = wiring.get('entities', entry.type)

            if (!EntityClass) {
                continue
            }

            entry.worldEntity = world.create(EntityClass, {x: entry.x, y: entry.y, $id: entry.$id})
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

        this.#renderSystem = new RenderSystem({
            cameras: {
                main: {unitsInView: {width: 26, height: 15}}
            },
            layers: [
                {name: 'game', type: 'canvas', camera: 'main', backgroundColor: 'transparent'},
                {name: 'overlay', type: 'canvas', camera: 'main', backgroundColor: 'transparent', autoRender: false}
            ]
        })
        this.#renderSystem.mount(viewport)
        this.#renderSystem.on('resize', () => this.#scheduleRender())
        requestAnimationFrame(() => this.#renderSystem.resizeToContainer())

        this.#setupInputEvents(viewport)
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

            const deleteBtn = createElement('button', {class: 'delete-btn', text: 'Delete'})
            deleteBtn.addEventListener('click', () => this.#deleteSelectedEntity())
            this.#propsPanel.appendChild(deleteBtn)
        } else {
            this.#propsPanel.appendChild(createElement('div', {
                class: 'empty-message',
                text: 'Select an entity'
            }))
        }

        this.#treeEl = createElement('div', {class: 'scene-tree'})
        this.#propsPanel.appendChild(this.#treeEl)
        this.#updateTree()
        this.#buildPalette()
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

        const entry = this.#entities[this.#selectedIndex]
        entry[prop] = value

        if (entry.worldEntity) {
            entry.worldEntity[prop] = value
        }

        this.#markDirty()
        this.#scheduleRender()
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


    #buildPalette () {
        const wiring = this.#context?.wiring
        if (!wiring) {
            return
        }

        const paletteEl = createElement('div', {class: 'scene-tree'})
        paletteEl.appendChild(createElement('div', {class: 'panel-title', text: 'Add Entity'}))

        const entityClasses = wiring.getAll('entities')

        for (const name of Object.keys(entityClasses)) {
            const item = createElement('div', {class: 'tree-item palette-item', text: '+ ' + name})

            item.addEventListener('click', () => this.#addEntity(name))
            paletteEl.appendChild(item)
        }

        this.#propsPanel.appendChild(paletteEl)
    }


    #addEntity (type) {
        const wiring = this.#context?.wiring
        const EntityClass = wiring?.get('entities', type)

        if (!EntityClass || !this.#stage?.world) {
            return
        }

        const cam = this.camera
        const x = roundHalf(cam.x)
        const y = roundHalf(cam.y)

        const entry = {type, x, y, index: this.#entities.length}
        entry.worldEntity = this.#stage.world.create(EntityClass, {x, y})

        this.#entities.push(entry)
        this.#selectedIndex = this.#entities.length - 1
        this.#markDirty()
        this.#buildPropsPanel()
        this.#scheduleRender()
    }


    #deleteSelectedEntity () {
        if (this.#selectedIndex < 0) {
            return
        }

        const entry = this.#entities[this.#selectedIndex]

        if (entry.worldEntity && this.#stage?.world) {
            this.#stage.world.removeChild(entry.worldEntity.$id)
        }

        this.#entities.splice(this.#selectedIndex, 1)
        this.#selectedIndex = -1
        this.#markDirty()
        this.#buildPropsPanel()
        this.#scheduleRender()
    }


    #selectEntity (index) {
        this.#selectedIndex = index
        this.#buildPropsPanel()
        this.#scheduleRender()
    }


    #setupInputEvents (viewport) {
        viewport.addEventListener('pointerdown', (e) => this.#onPointerDown(e))
        viewport.addEventListener('pointermove', (e) => this.#onPointerMove(e))
        viewport.addEventListener('pointerup', () => this.#onPointerUp())
        viewport.addEventListener('wheel', (e) => this.#onWheel(e))
        viewport.addEventListener('contextmenu', (e) => e.preventDefault())
    }


    #onPointerDown (e) {
        const cam = this.camera

        if (e.button === 1 || e.button === 2) {
            this.#startPan(e, cam)
            return
        }

        const world = cam.screenToWorld(e.offsetX, e.offsetY)
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
            e.target.setPointerCapture(e.pointerId)
        } else {
            this.#selectEntity(-1)
        }
    }


    #startPan (e, cam) {
        this.#drag = {
            startScreenX: e.offsetX,
            startScreenY: e.offsetY,
            startCameraX: cam.x,
            startCameraY: cam.y,
            panning: true
        }
        e.target.setPointerCapture(e.pointerId)
        e.preventDefault()
    }


    #onPointerMove (e) {
        if (!this.#drag) {
            return
        }

        const cam = this.camera

        if (this.#drag.panning) {
            const ppu = cam.pixelsPerUnit
            cam.x = this.#drag.startCameraX - (e.offsetX - this.#drag.startScreenX) / ppu
            cam.y = this.#drag.startCameraY + (e.offsetY - this.#drag.startScreenY) / ppu
        } else {
            const world = cam.screenToWorld(e.offsetX, e.offsetY)
            const dx = world.x - this.#drag.startWorldX
            const dy = world.y - this.#drag.startWorldY
            const entry = this.#entities[this.#selectedIndex]
            entry.x = roundHalf(this.#drag.startEntityX + dx)
            entry.y = roundHalf(this.#drag.startEntityY + dy)

            if (entry.worldEntity) {
                entry.worldEntity.x = entry.x
                entry.worldEntity.y = entry.y
            }

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
        const cam = this.camera
        const factor = e.deltaY > 0 ? 0.9 : 1.1
        cam.setZoom(clamp(cam.zoom * factor, 0.3, 5))
        this.#scheduleRender()
    }


    #pickEntity (worldX, worldY) {
        const hits = this.#pickAllEntities(worldX, worldY)

        if (hits.length === 0) {
            return -1
        }

        hits.sort((a, b) => a.area - b.area)
        return hits[0].index
    }


    #pickAllEntities (worldX, worldY) {
        const hits = []

        for (let i = 0; i < this.#entities.length; i++) {
            const entry = this.#entities[i]
            const bounds = this.#getEntryBounds(entry)

            if (worldX >= bounds.minX && worldX <= bounds.maxX &&
                worldY >= bounds.minY && worldY <= bounds.maxY) {
                hits.push({index: i, area: bounds.width * bounds.height, entry})
            }
        }

        return hits
    }


    #getEntryBounds (entry) {
        if (!entry.worldEntity || !this.#stage) {
            const halfSize = ENTITY_SIZE / 2
            return {
                minX: entry.x - halfSize,
                minY: entry.y - halfSize,
                maxX: entry.x + halfSize,
                maxY: entry.y + halfSize
            }
        }

        const views = this.#stage.getViews(entry.worldEntity)
        const root = views[0]?.root

        if (root?.getBounds) {
            root.updateWorldMatrix(true)
            return root.getBounds()
        }

        const halfSize = ENTITY_SIZE / 2
        return {
            minX: entry.x - halfSize,
            minY: entry.y - halfSize,
            maxX: entry.x + halfSize,
            maxY: entry.y + halfSize
        }
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
            this.#stage.syncViews()
        }

        this.#renderSystem?.render()
        this.#renderOverlay()
    }


    #renderOverlay () {
        const overlayLayer = this.#renderSystem?.getLayer('overlay')

        if (!overlayLayer) {
            return
        }

        const renderer = overlayLayer.renderer
        const ctx = renderer.ctx
        const cam = this.camera
        const ppu = cam.pixelsPerUnit

        ctx.clearRect(0, 0, renderer.canvas.width, renderer.canvas.height)

        ctx.save()
        cam.applyToContext(ctx, renderer.pixelRatio)

        const lineWidth = 1 / ppu

        this.#renderGrid(ctx, cam, lineWidth)
        this.#renderCameraFrame(ctx, lineWidth)
        this.#renderSelectionHighlight(ctx, lineWidth)
        this.#renderLabels(ctx, ppu)

        ctx.restore()
    }


    #renderGrid (ctx, cam, lineWidth) { // eslint-disable-line local/class-methods-use-this -- clean
        const topLeft = cam.screenToWorld(0, 0)
        const bottomRight = cam.screenToWorld(cam.viewportWidth, cam.viewportHeight)

        const startX = Math.floor(topLeft.x)
        const endX = Math.ceil(bottomRight.x)
        const startY = Math.floor(bottomRight.y)
        const endY = Math.ceil(topLeft.y)
        const bigNumber = 10000

        ctx.strokeStyle = GRID_COLOR
        ctx.lineWidth = lineWidth

        for (let x = startX; x <= endX; x++) {
            ctx.beginPath()
            ctx.moveTo(x, -bigNumber)
            ctx.lineTo(x, bigNumber)
            ctx.stroke()
        }

        for (let y = startY; y <= endY; y++) {
            ctx.beginPath()
            ctx.moveTo(-bigNumber, y)
            ctx.lineTo(bigNumber, y)
            ctx.stroke()
        }

        ctx.strokeStyle = AXIS_COLOR
        ctx.lineWidth = lineWidth

        ctx.beginPath()
        ctx.moveTo(0, -bigNumber)
        ctx.lineTo(0, bigNumber)
        ctx.stroke()

        ctx.beginPath()
        ctx.moveTo(-bigNumber, 0)
        ctx.lineTo(bigNumber, 0)
        ctx.stroke()
    }


    #renderCameraFrame (ctx, lineWidth) {
        const gameCamera = this.#context?.studioConfig?.camera

        if (!gameCamera) {
            return
        }

        const halfW = gameCamera.width / 2
        const halfH = gameCamera.height / 2

        ctx.strokeStyle = CAMERA_FRAME_COLOR
        ctx.lineWidth = lineWidth
        ctx.setLineDash([lineWidth * 6, lineWidth * 4])
        ctx.strokeRect(-halfW, -halfH, gameCamera.width, gameCamera.height)
        ctx.setLineDash([])
    }


    #renderSelectionHighlight (ctx, lineWidth) {
        if (this.#selectedIndex < 0) {
            return
        }

        const entry = this.#entities[this.#selectedIndex]
        const bounds = this.#getEntryBounds(entry)

        ctx.strokeStyle = SELECTED_BORDER
        ctx.lineWidth = lineWidth * 2
        ctx.setLineDash([lineWidth * 4, lineWidth * 4])
        ctx.strokeRect(bounds.minX, bounds.minY, bounds.maxX - bounds.minX, bounds.maxY - bounds.minY)
        ctx.setLineDash([])
    }


    #renderLabels (ctx, ppu) {
        ctx.save()

        for (const entity of this.#entities) {
            const label = entity.$id || entity.type
            const fontSize = 11 / ppu

            ctx.fillStyle = LABEL_COLOR
            ctx.font = `${fontSize}px -apple-system, BlinkMacSystemFont, sans-serif`
            ctx.textAlign = 'center'

            ctx.save()
            ctx.translate(entity.x, entity.y - ENTITY_SIZE / 2 - fontSize * 1.2)
            ctx.scale(1, -1)
            ctx.fillText(label, 0, 0)
            ctx.restore()
        }

        ctx.restore()
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
