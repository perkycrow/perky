import Layer from './layer.js'
import {createElement} from '../application/dom_utils.js'


export default class HTMLLayer extends Layer {

    constructor (options = {}) {
        super(options)

        this.div = document.createElement('div')
        this.element = this.div

        this.applyStyles()

        if (options.content) {
            this.setContent(options.content)
        }

        if (options.className) {
            this.div.className = options.className
        }

        this.worldElements = []
        this.camera = options.camera ?? null
        this.autoUpdate = options.autoUpdate ?? true
        this.updateThreshold = options.updateThreshold ?? 0.5

        this.applyViewport()
    }


    applyStyles () {
        this.div.style.position = 'absolute'
        this.div.style.top = '0'
        this.div.style.left = '0'
        this.div.style.width = '100%'
        this.div.style.height = '100%'
        this.div.style.zIndex = this.zIndex
        this.div.style.opacity = this.opacity
        this.div.style.pointerEvents = this.pointerEvents
        this.div.style.display = this.visible ? 'block' : 'none'
    }


    setContent (content) {
        if (typeof content === 'string') {
            this.div.innerHTML = content
        } else if (content instanceof HTMLElement) {
            this.div.innerHTML = ''
            this.div.appendChild(content)
        }
        return this
    }


    addClass (className) {
        this.div.classList.add(className)
        return this
    }


    removeClass (className) {
        this.div.classList.remove(className)
        return this
    }


    setStyle (property, value) {
        this.div.style[property] = value
        return this
    }


    resize (width, height) {
        const vp = this.calculateViewport(width, height)
        this.div.style.width = `${vp.width}px`
        this.div.style.height = `${vp.height}px`
        this.applyViewport()
        return this
    }


    setCamera (camera) {
        this.camera = camera
        return this
    }


    createWorldElement (content, worldX, worldY, options = {}) { // eslint-disable-line complexity -- clean
        const el = createElement('div', {
            html: content,
            style: {
                position: 'absolute',
                pointerEvents: options.pointerEvents ?? 'auto',
                willChange: 'transform',
                left: '0',
                top: '0'
            }
        })

        const worldEl = {
            element: el,
            worldX,
            worldY,
            offsetX: options.offsetX ?? 0,
            offsetY: options.offsetY ?? 0,
            worldOffsetX: options.worldOffsetX ?? 0,
            worldOffsetY: options.worldOffsetY ?? 0,
            worldScaleX: options.worldScaleX ?? 1,
            worldScaleY: options.worldScaleY ?? 1,
            autoCenter: options.autoCenter ?? false,
            inheritTransform: options.inheritTransform ?? false,
            targetObject: options.targetObject ?? null,
            lastScreenX: null,
            lastScreenY: null,
            lastZoom: null,
            visible: true
        }

        this.div.appendChild(el)
        this.worldElements.push(worldEl)

        if (worldEl.autoCenter) {
            requestAnimationFrame(() => {
                const rect = el.getBoundingClientRect()
                if (this.camera) {
                    const ppu = this.camera.pixelsPerUnit
                    if (worldEl.autoCenter === true || worldEl.autoCenter === 'x') {
                        worldEl.worldOffsetX = -(rect.width / 2) / ppu
                    }
                    if (worldEl.autoCenter === true || worldEl.autoCenter === 'y') {
                        worldEl.worldOffsetY = (rect.height / 2) / ppu
                    }
                }
            })
        }

        return el
    }


    removeWorldElement (element) {
        const index = this.worldElements.findIndex(w => w.element === element)
        if (index !== -1) {
            this.worldElements.splice(index, 1)
            if (element.parentElement) {
                element.parentElement.removeChild(element)
            }
        }
        return this
    }


    updateElementWorldPosition (element, worldX, worldY) {
        const worldEl = this.worldElements.find(w => w.element === element)
        if (worldEl) {
            worldEl.worldX = worldX
            worldEl.worldY = worldY
        }
        return this
    }


    setElementTarget (element, targetObject) {
        const worldEl = this.worldElements.find(w => w.element === element)
        if (worldEl) {
            worldEl.targetObject = targetObject
        }
        return this
    }


    updateWorldElements (force = false) {
        if (!this.camera || this.worldElements.length === 0) {
            return this
        }

        const ctx = {
            camera: this.camera,
            ppu: this.camera.pixelsPerUnit,
            zoomChanged: force || this.worldElements.some(el => el.lastZoom !== this.camera.zoom),
            force,
            threshold: this.updateThreshold
        }

        this.worldElements.forEach(worldEl => {
            updateSingleWorldElement(worldEl, ctx)
        })

        return this
    }


    cssToWorldUnits (pixels) {
        if (!this.camera) {
            return 0
        }


        const ppu = this.camera.pixelsPerUnit
        return pixels / ppu
    }


    worldUnitsToCss (units) {
        if (!this.camera) {
            return 0
        }


        const ppu = this.camera.pixelsPerUnit
        return units * ppu
    }

}


function syncTargetPosition (worldEl) {
    if (worldEl.targetObject) {
        worldEl.worldX = worldEl.targetObject.x
        worldEl.worldY = worldEl.targetObject.y
    }
}


function updateAutoCenter (worldEl, ppu) {
    const rect = worldEl.element.getBoundingClientRect()
    if (worldEl.autoCenter === true || worldEl.autoCenter === 'x') {
        worldEl.worldOffsetX = -(rect.width / 2) / ppu
    }
    if (worldEl.autoCenter === true || worldEl.autoCenter === 'y') {
        worldEl.worldOffsetY = (rect.height / 2) / ppu
    }
}


function computeFinalPosition (worldEl, camera, ppu) {
    const screen = camera.worldToScreenCSS(worldEl.worldX, worldEl.worldY)
    const worldOffsetXPx = worldEl.worldOffsetX * ppu
    const worldOffsetYPx = -worldEl.worldOffsetY * ppu
    return {
        x: screen.x + worldEl.offsetX + worldOffsetXPx,
        y: screen.y + worldEl.offsetY + worldOffsetYPx
    }
}


function isElementVisible (finalX, finalY, camera) {
    return (
        finalX >= -100 && finalX <= camera.viewportWidth + 100 &&
        finalY >= -100 && finalY <= camera.viewportHeight + 100
    )
}


function shouldSkipUpdate (worldEl, final, force, threshold) {
    if (force || worldEl.lastScreenX === null) {
        return false
    }
    const dx = Math.abs(final.x - worldEl.lastScreenX)
    const dy = Math.abs(final.y - worldEl.lastScreenY)
    return dx < threshold && dy < threshold
}


function setElementVisibility (worldEl, visible) {
    if (worldEl.visible !== visible) {
        worldEl.element.style.display = visible ? 'block' : 'none'
        worldEl.visible = visible
    }
}


function shouldInheritTransform (worldEl) {
    return worldEl.inheritTransform && worldEl.targetObject
}


function computeTransformScale (worldEl) {
    let scaleX = worldEl.worldScaleX
    let scaleY = worldEl.worldScaleY
    let rotationDeg = 0

    if (shouldInheritTransform(worldEl)) {
        scaleX *= worldEl.targetObject.scaleX || 1
        scaleY *= worldEl.targetObject.scaleY || 1
        rotationDeg = -(worldEl.targetObject.rotation || 0) * (180 / Math.PI)
    }

    return {scaleX, scaleY, rotationDeg, needsScale: scaleX !== 1 || scaleY !== 1}
}


function buildTransformString (finalX, finalY, transform) {
    let str = `translate(${finalX}px, ${finalY}px)`
    if (transform.rotationDeg !== 0) {
        str += ` rotate(${transform.rotationDeg}deg)`
    }
    if (transform.needsScale) {
        str += ` scale(${transform.scaleX}, ${transform.scaleY})`
    }
    return str
}


function updateSingleWorldElement (worldEl, ctx) {
    syncTargetPosition(worldEl)

    if (worldEl.autoCenter && ctx.zoomChanged) {
        updateAutoCenter(worldEl, ctx.ppu)
    }

    const final = computeFinalPosition(worldEl, ctx.camera, ctx.ppu)

    if (!isElementVisible(final.x, final.y, ctx.camera)) {
        setElementVisibility(worldEl, false)
        worldEl.lastZoom = ctx.camera.zoom
        return
    }

    if (shouldSkipUpdate(worldEl, final, ctx.force, ctx.threshold)) {
        worldEl.lastZoom = ctx.camera.zoom
        return
    }

    setElementVisibility(worldEl, true)

    const transform = computeTransformScale(worldEl)
    worldEl.element.style.transform = buildTransformString(final.x, final.y, transform)
    worldEl.lastScreenX = final.x
    worldEl.lastScreenY = final.y
    worldEl.lastZoom = ctx.camera.zoom
}
