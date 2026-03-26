import StudioTool from '../studio_tool.js'
import {createElement} from '../../application/dom_utils.js'
import '../../editor/properties_panel.js'
import '../../editor/layout/side_drawer.js'
import Stage from '../../game/stage.js'
import World from '../../game/world.js'
import RenderSystem from '../../render/render_system.js'
import SpriteEntityView from '../../game/sprite_entity_view.js'
import Entity from '../../game/entity.js'
import Group2D from '../../render/group_2d.js'
import {sceneViewStyles} from './scene_view.styles.js'


const GRID_COLOR = 'rgba(255, 255, 255, 0.06)'
const AXIS_COLOR = 'rgba(255, 255, 255, 0.15)'
const CAMERA_FRAME_COLOR = 'rgba(255, 255, 255, 0.3)'
const SELECTED_BORDER = 'rgba(255, 200, 80, 1)'
const LABEL_COLOR = '#c8d8e8'
const ENTITY_SIZE = 1


export default class SceneView extends StudioTool {

    static actions = {
        undo: 'undoAction',
        redo: 'redoAction',
        copy: 'copySelectedEntity',
        paste: 'pasteEntity',
        duplicate: 'duplicateSelectedEntity',
        delete: 'deleteSelectedEntity'
    }

    static bindings = {
        undo: 'ctrl+z',
        redo: ['ctrl+shift+z', 'ctrl+y'],
        copy: 'ctrl+c',
        paste: 'ctrl+v',
        duplicate: 'ctrl+d',
        delete: ['Delete', 'Backspace']
    }

    #context = null
    #sceneId = null
    #entities = []
    #selectedIndex = -1
    #containerEl = null
    #propsPanel = null
    #propsDrawer = null
    #paletteDrawer = null
    #treeEl = null
    #drag = null
    #animFrame = null
    #stage = null
    #renderSystem = null
    #snapStep = 0.5
    #clipboard = null
    #pointers = new Map()

    onDisconnected () {
        super.onDisconnected()
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
        this.#stage.register((e) => e.options?.texture, SpriteEntityView)
        this.#stage.start()

        this.#renderSystem.getLayer('game').setContent(this.#stage.viewsGroup)

        for (const entry of this.#entities) {
            const EntityClass = entry.type ? wiring.get('entities', entry.type) : null

            if (EntityClass) {
                entry.worldEntity = world.create(EntityClass, {x: entry.x, y: entry.y, $id: entry.$id})
            } else if (entry.texture) {
                entry.worldEntity = world.create(Entity, {
                    x: entry.x,
                    y: entry.y,
                    texture: entry.texture,
                    width: entry.width,
                    height: entry.height,
                    depth: entry.depth,
                    $tags: ['decor']
                })
            }
        }

        this.#stage.syncViews()
        this.#scheduleRender()
        requestAnimationFrame(() => this.#scheduleRender())
    }


    hasContext () {
        return Boolean(this.#context)
    }


    init () {
        if (!this.#context) {
            return
        }

        this.#initStage()
        this.#updateTree()
        this.#scheduleRender()
    }


    toolStyles () { // eslint-disable-line local/class-methods-use-this -- clean
        return [sceneViewStyles]
    }


    buildHeaderStart () {
        const fragment = document.createDocumentFragment()

        const undoBtn = createElement('button', {class: 'toolbar-btn', text: '\u21A9', title: 'Undo'})
        undoBtn.addEventListener('click', () => this.undoAction())
        fragment.appendChild(undoBtn)

        const redoBtn = createElement('button', {class: 'toolbar-btn', text: '\u21AA', title: 'Redo'})
        redoBtn.addEventListener('click', () => this.redoAction())
        fragment.appendChild(redoBtn)

        return fragment
    }


    buildHeaderEnd () {
        const container = createElement('div')

        const paletteBtn = createElement('button', {class: 'toolbar-btn', text: '\u2630', title: 'Toggle palette'})
        paletteBtn.addEventListener('click', () => this.#paletteDrawer?.toggle())
        container.appendChild(paletteBtn)

        const propsBtn = createElement('button', {class: 'toolbar-btn', text: '\u2699', title: 'Toggle properties'})
        propsBtn.addEventListener('click', () => this.#propsDrawer?.toggle())
        container.appendChild(propsBtn)

        const snapBtn = createElement('button', {class: 'toolbar-btn active', text: 'Snap 0.5', title: 'Toggle grid snap'})
        snapBtn.addEventListener('click', () => {
            if (this.#snapStep) {
                this.#snapStep = 0
                snapBtn.textContent = 'Snap Off'
                snapBtn.classList.remove('active')
            } else {
                this.#snapStep = 0.5
                snapBtn.textContent = 'Snap 0.5'
                snapBtn.classList.add('active')
            }
        })
        container.appendChild(snapBtn)

        const previewBtn = createElement('button', {class: 'toolbar-btn', text: '\u25B6 Preview', title: 'Preview in game'})
        previewBtn.addEventListener('click', () => this.#openPreview())
        container.appendChild(previewBtn)

        return container
    }


    buildContent () {
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

        this.#propsDrawer = createElement('side-drawer', {attrs: {position: 'right'}})
        this.#propsPanel = document.createElement('properties-panel')
        this.#propsDrawer.appendChild(this.#propsPanel)
        this.#containerEl.appendChild(this.#propsDrawer)

        this.#paletteDrawer = createElement('side-drawer', {attrs: {position: 'left'}})
        this.#containerEl.appendChild(this.#paletteDrawer)

        this.#buildPropsPanel()

        return this.#containerEl
    }


    #buildPropsPanel () {
        this.#propsPanel.clear()
        this.#propsPanel.addTitle('Properties')

        if (this.#selectedIndex >= 0) {
            const entity = this.#entities[this.#selectedIndex]
            this.#propsPanel.addNumber('x', entity.x, (v) => this.#updateEntityProp('x', v))
            this.#propsPanel.addNumber('y', entity.y, (v) => this.#updateEntityProp('y', v))
            this.#propsPanel.addNumber('depth', entity.depth ?? 0, (v) => this.#updateEntityProp('depth', v))

            if (entity.texture) {
                this.#propsPanel.addNumber('width', entity.width ?? 2, (v) => this.#updateEntityProp('width', v))
                this.#propsPanel.addNumber('height', entity.height ?? 2, (v) => this.#updateEntityProp('height', v))
            }

            this.#propsPanel.addButton('Delete', () => this.deleteSelectedEntity(), 'danger')
        } else {
            this.#propsPanel.addMessage('Select an entity')
        }

        this.#buildPaletteDrawer()
    }


    #buildPaletteDrawer () {
        if (!this.#paletteDrawer) {
            return
        }

        this.#paletteDrawer.innerHTML = ''

        this.#treeEl = createElement('div', {class: 'scene-tree'})
        this.#paletteDrawer.appendChild(this.#treeEl)
        this.#updateTree()
        this.#buildPalette()
    }


    #updateEntityProp (prop, value) {
        if (this.#selectedIndex < 0) {
            return
        }

        const entry = this.#entities[this.#selectedIndex]
        entry[prop] = value

        if (entry.worldEntity) {
            if (prop === 'x' || prop === 'y') {
                entry.worldEntity[prop] = value
            } else {
                entry.worldEntity.options[prop] = value
            }
        }

        this.markDirty()
        this.#scheduleRender()
    }


    autoSave () {
        if (!this.#sceneId) {
            return
        }

        const config = this.#buildSceneConfig()
        const blob = new Blob([JSON.stringify(config, null, 4)], {type: 'application/json'})

        this.store.save(this.#sceneId, {
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
                text: entity.$id || entity.type || entity.texture
            })

            item.addEventListener('click', () => {
                this.#selectEntity(i)
            })

            this.#treeEl.appendChild(item)
        }
    }


    #buildPalette () {
        const wiring = this.#context?.wiring
        const manifest = this.#context?.manifest

        const paletteEl = createElement('div', {class: 'scene-tree'})

        if (wiring) {
            paletteEl.appendChild(createElement('div', {class: 'panel-title', text: 'Add Entity'}))

            for (const name of Object.keys(wiring.getAll('entities'))) {
                const item = createElement('div', {class: 'tree-item palette-item', text: '+ ' + name})
                item.addEventListener('click', () => this.#addTypedEntity(name))
                paletteEl.appendChild(item)
            }
        }

        if (manifest) {
            paletteEl.appendChild(createElement('div', {class: 'panel-title', text: 'Add Sprite'}))

            const imageAssets = manifest.getAssetsByType('image')

            for (const asset of imageAssets) {
                const item = createElement('div', {class: 'tree-item palette-item', text: '+ ' + asset.id})
                item.addEventListener('click', () => this.#addSpriteEntity(asset.id))
                paletteEl.appendChild(item)
            }
        }

        const target = this.#paletteDrawer?.querySelector('.properties-panel') || this.#propsPanel
        target.appendChild(paletteEl)
    }


    #addEntity (entry) {
        const wiring = this.#context?.wiring
        const world = this.#stage?.world

        if (!world) {
            return
        }

        if (entry.type && !wiring?.get('entities', entry.type)) {
            return
        }

        this.history.execute({
            execute: () => {
                entry.worldEntity = createWorldEntity(world, entry, wiring)
                if (!this.#entities.includes(entry)) {
                    this.#entities.push(entry)
                }
                this.#selectedIndex = this.#entities.indexOf(entry)
            },
            undo: () => {
                removeWorldEntity(world, entry)
                const idx = this.#entities.indexOf(entry)
                if (idx >= 0) {
                    this.#entities.splice(idx, 1)
                }
                this.#selectedIndex = -1
            }
        })

        this.#afterHistoryAction()
    }


    #addTypedEntity (type) {
        const cam = this.camera
        this.#addEntity({type, x: snapValue(cam.x, this.#snapStep), y: snapValue(cam.y, this.#snapStep)})
    }


    #addSpriteEntity (texture) {
        const cam = this.camera
        this.#addEntity({texture, x: snapValue(cam.x, this.#snapStep), y: snapValue(cam.y, this.#snapStep), width: 2, height: 2})
    }


    deleteSelectedEntity () {
        if (this.#selectedIndex < 0) {
            return
        }

        const entry = this.#entities[this.#selectedIndex]
        const idx = this.#selectedIndex
        const wiring = this.#context?.wiring
        const world = this.#stage?.world

        if (!world) {
            return
        }

        this.history.execute({
            execute: () => {
                removeWorldEntity(world, entry)
                const currentIdx = this.#entities.indexOf(entry)
                if (currentIdx >= 0) {
                    this.#entities.splice(currentIdx, 1)
                }
                this.#selectedIndex = -1
            },
            undo: () => {
                entry.worldEntity = createWorldEntity(world, entry, wiring)
                this.#entities.splice(idx, 0, entry)
                this.#selectedIndex = idx
            }
        })

        this.#afterHistoryAction()
    }


    copySelectedEntity () {
        const entry = this.#entities[this.#selectedIndex]
        const copy = {}

        for (const key of ENTITY_ENTRY_KEYS) {
            if (entry[key] !== undefined) {
                copy[key] = entry[key]
            }
        }

        this.#clipboard = copy
    }


    pasteEntity () {
        const cam = this.camera
        const entry = {
            ...this.#clipboard,
            x: snapValue(cam.x, this.#snapStep),
            y: snapValue(cam.y, this.#snapStep)
        }

        this.#addEntity(entry)
    }


    duplicateSelectedEntity () {
        const entry = this.#entities[this.#selectedIndex]
        const copy = {}

        for (const key of ENTITY_ENTRY_KEYS) {
            if (entry[key] !== undefined) {
                copy[key] = entry[key]
            }
        }

        copy.x = (copy.x ?? 0) + 1
        copy.y = (copy.y ?? 0) + 1
        this.#addEntity(copy)
    }


    #openPreview () {
        this.flushSave()
        const stageName = this.#sceneId?.replace(/Scene$/, '') || ''
        window.open(`../index.html?studio&stage=${stageName}`, '_blank')
    }


    #selectEntity (index) {
        this.#selectedIndex = index
        this.#buildPropsPanel()

        if (index >= 0 && this.#propsDrawer) {
            this.#propsDrawer.open()
        }
        this.#scheduleRender()
    }


    undoAction () {
        this.history.undo()
        this.#afterHistoryAction()
    }


    redoAction () {
        this.history.redo()
        this.#afterHistoryAction()
    }


    #afterHistoryAction () {
        this.markDirty()
        this.#buildPropsPanel()
        this.#scheduleRender()
    }


    #setupInputEvents (viewport) {
        viewport.addEventListener('pointerdown', (e) => this.#onPointerDown(e))
        viewport.addEventListener('pointermove', (e) => this.#onPointerMove(e))
        viewport.addEventListener('pointerup', (e) => this.#onPointerUp(e))
        viewport.addEventListener('pointercancel', (e) => this.#onPointerUp(e))
        viewport.addEventListener('wheel', (e) => this.#onWheel(e))
        viewport.addEventListener('contextmenu', (e) => e.preventDefault())
        viewport.style.touchAction = 'none'
    }


    #onPointerDown (e) {
        this.#pointers.set(e.pointerId, {x: e.offsetX, y: e.offsetY})

        if (this.#pointers.size === 2) {
            this.#drag = null
            this.#startPinch()
            return
        }

        if (this.#pointers.size > 2) {
            return
        }

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


    #startPinch () {
        const points = [...this.#pointers.values()]
        const cam = this.camera

        this.#drag = {
            pinching: true,
            startDist: pointerDistance(points[0], points[1]),
            startMidX: (points[0].x + points[1].x) / 2,
            startMidY: (points[0].y + points[1].y) / 2,
            startZoom: cam.zoom,
            startCameraX: cam.x,
            startCameraY: cam.y
        }
    }


    #onPointerMove (e) {
        this.#pointers.set(e.pointerId, {x: e.offsetX, y: e.offsetY})

        if (this.#drag?.pinching && this.#pointers.size === 2) {
            this.#handlePinchMove()
            return
        }

        if (!this.#drag || this.#drag.pinching) {
            return
        }

        const cam = this.camera

        if (this.#drag.panning) {
            const ppu = cam.pixelsPerUnit
            cam.x = this.#drag.startCameraX - (e.offsetX - this.#drag.startScreenX) / ppu
            cam.y = this.#drag.startCameraY + (e.offsetY - this.#drag.startScreenY) / ppu
        } else {
            this.#handleEntityDrag(e)
        }

        this.#scheduleRender()
    }


    #handleEntityDrag (e) {
        const cam = this.camera
        const world = cam.screenToWorld(e.offsetX, e.offsetY)
        const dx = world.x - this.#drag.startWorldX
        const dy = world.y - this.#drag.startWorldY
        const entry = this.#entities[this.#selectedIndex]
        entry.x = snapValue(this.#drag.startEntityX + dx, this.#snapStep)
        entry.y = snapValue(this.#drag.startEntityY + dy, this.#snapStep)

        if (entry.worldEntity) {
            entry.worldEntity.x = entry.x
            entry.worldEntity.y = entry.y
        }

        this.markDirty()
        this.#buildPropsPanel()
    }


    #handlePinchMove () {
        const points = [...this.#pointers.values()]
        const cam = this.camera
        const dist = pointerDistance(points[0], points[1])
        const scale = dist / this.#drag.startDist
        const midX = (points[0].x + points[1].x) / 2
        const midY = (points[0].y + points[1].y) / 2

        cam.zoom = clamp(this.#drag.startZoom * scale, 0.1, 10)

        const ppu = cam.pixelsPerUnit
        cam.x = this.#drag.startCameraX - (midX - this.#drag.startMidX) / ppu
        cam.y = this.#drag.startCameraY + (midY - this.#drag.startMidY) / ppu

        this.#scheduleRender()
    }


    #onPointerUp (e) {
        this.#pointers.delete(e.pointerId)

        if (this.#drag?.pinching) {
            this.#drag = null
            return
        }

        if (this.#drag && !this.#drag.panning && this.#selectedIndex >= 0) {
            this.#pushMoveCommand()
        }

        this.#drag = null
    }


    #pushMoveCommand () {
        const entry = this.#entities[this.#selectedIndex]
        const startX = this.#drag.startEntityX
        const startY = this.#drag.startEntityY
        const endX = entry.x
        const endY = entry.y

        if (startX === endX && startY === endY) {
            return
        }

        this.history.push({
            execute () {
                entry.x = endX
                entry.y = endY
                if (entry.worldEntity) {
                    entry.worldEntity.x = endX
                    entry.worldEntity.y = endY
                }
            },
            undo () {
                entry.x = startX
                entry.y = startY
                if (entry.worldEntity) {
                    entry.worldEntity.x = startX
                    entry.worldEntity.y = startY
                }
            }
        })
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
            return defaultBounds(entry.x, entry.y)
        }

        const views = this.#stage.getViews(entry.worldEntity)
        const root = views[0]?.root

        if (root) {
            root.updateWorldMatrix(true)
            const bounds = root instanceof Group2D ? root.getBounds() : root.getWorldBounds()
            bounds.width = bounds.maxX - bounds.minX
            bounds.height = bounds.maxY - bounds.minY
            return bounds
        }

        return defaultBounds(entry.x, entry.y)
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

        renderGrid(ctx, cam, lineWidth)
        this.#renderCameraFrame(ctx, lineWidth)
        this.#renderSelectionHighlight(ctx, lineWidth)
        this.#renderLabels(ctx, ppu)

        ctx.restore()
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
            const label = entity.$id || entity.type || entity.texture
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


function snapValue (value, step) {
    if (!step) {
        return value
    }
    return Math.round(value / step) * step
}


function clamp (value, min, max) {
    return Math.min(max, Math.max(min, value))
}


function pointerDistance (a, b) {
    const dx = a.x - b.x
    const dy = a.y - b.y
    return Math.sqrt(dx * dx + dy * dy)
}


const ENTITY_ENTRY_KEYS = ['type', 'texture', '$id', 'x', 'y', 'width', 'height', 'depth']


function buildEntityEntry (entity) {
    const entry = {}

    for (const key of ENTITY_ENTRY_KEYS) {
        const value = entity[key]

        if (value !== undefined && value !== null && value !== 0) {
            entry[key] = value
        }
    }

    return entry
}


function defaultBounds (x, y) {
    const halfSize = ENTITY_SIZE / 2
    return {
        minX: x - halfSize,
        minY: y - halfSize,
        maxX: x + halfSize,
        maxY: y + halfSize,
        width: ENTITY_SIZE,
        height: ENTITY_SIZE
    }
}


function createWorldEntity (world, entry, wiring) {
    const EntityClass = entry.type ? wiring?.get('entities', entry.type) : null

    if (EntityClass) {
        return world.create(EntityClass, {x: entry.x, y: entry.y, $id: entry.$id})
    }

    if (entry.texture) {
        return world.create(Entity, {
            x: entry.x,
            y: entry.y,
            texture: entry.texture,
            width: entry.width,
            height: entry.height,
            depth: entry.depth,
            $tags: ['decor']
        })
    }

    return null
}


function removeWorldEntity (world, entry) {
    if (entry.worldEntity) {
        world.removeChild(entry.worldEntity.$id)
        entry.worldEntity = null
    }
}


function renderGrid (ctx, cam, lineWidth) {
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


customElements.define('scene-view', SceneView)
