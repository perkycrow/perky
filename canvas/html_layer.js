import Layer from './layer'


export default class HTMLLayer extends Layer {

    constructor (name, options = {}) {
        super(name, options)
        
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


    createWorldElement (content, worldX, worldY, options = {}) { // eslint-disable-line complexity
        const el = document.createElement('div')
        el.innerHTML = content
        el.style.position = 'absolute'
        el.style.pointerEvents = options.pointerEvents ?? 'auto'
        el.style.willChange = 'transform'
        el.style.left = '0'
        el.style.top = '0'
        
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
            autoCenter: options.autoCenter ?? false, // true, 'x', 'y', or false
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


    updateWorldElements (force = false) { // eslint-disable-line complexity
        if (!this.camera || this.worldElements.length === 0) {
            return this
        }
        
        // Camera now works in logical (CSS) coordinates, so ppu is already in CSS pixels
        const ppu = this.camera.pixelsPerUnit
        const zoomChanged = force || this.worldElements.some(el => el.lastZoom !== this.camera.zoom)

        this.worldElements.forEach(worldEl => { // eslint-disable-line complexity

            if (worldEl.targetObject) {
                worldEl.worldX = worldEl.targetObject.x
                worldEl.worldY = worldEl.targetObject.y
            }

            if (worldEl.autoCenter && zoomChanged) {
                const rect = worldEl.element.getBoundingClientRect()
                if (worldEl.autoCenter === true || worldEl.autoCenter === 'x') {
                    worldEl.worldOffsetX = -(rect.width / 2) / ppu
                }
                if (worldEl.autoCenter === true || worldEl.autoCenter === 'y') {
                    worldEl.worldOffsetY = (rect.height / 2) / ppu
                }
            }

            const screen = this.camera.worldToScreenCSS(worldEl.worldX, worldEl.worldY)

            const worldOffsetXPx = worldEl.worldOffsetX * ppu
            const worldOffsetYPx = -worldEl.worldOffsetY * ppu
            
            const finalX = screen.x + worldEl.offsetX + worldOffsetXPx
            const finalY = screen.y + worldEl.offsetY + worldOffsetYPx
            
            // Camera viewport is already in CSS coordinates
            const cssWidth = this.camera.viewportWidth
            const cssHeight = this.camera.viewportHeight
            
            const isVisible = (
                finalX >= -100 && finalX <= cssWidth + 100 &&
                finalY >= -100 && finalY <= cssHeight + 100
            )
            
            if (!isVisible) {
                if (worldEl.visible) {
                    worldEl.element.style.display = 'none'
                    worldEl.visible = false
                }
                worldEl.lastZoom = this.camera.zoom
                return
            }
            
            if (!force && worldEl.lastScreenX !== null) {
                const dx = Math.abs(finalX - worldEl.lastScreenX)
                const dy = Math.abs(finalY - worldEl.lastScreenY)
                if (dx < this.updateThreshold && dy < this.updateThreshold) {
                    worldEl.lastZoom = this.camera.zoom
                    return
                }
            }
            
            if (!worldEl.visible) {
                worldEl.element.style.display = 'block'
                worldEl.visible = true
            }

            let transformStr = `translate(${finalX}px, ${finalY}px)`

            let scaleX = worldEl.worldScaleX
            let scaleY = worldEl.worldScaleY
            let rotationDeg = 0
            let needsScale = false
            
            if (worldEl.inheritTransform && worldEl.targetObject) {
                const rotation = worldEl.targetObject.rotation || 0
                const targetScaleX = worldEl.targetObject.scaleX || 1
                const targetScaleY = worldEl.targetObject.scaleY || 1

                scaleX *= targetScaleX
                scaleY *= targetScaleY
                
                rotationDeg = -rotation * (180 / Math.PI)
                
                needsScale = true
            } else if (worldEl.worldScaleX !== 1 || worldEl.worldScaleY !== 1) {
                needsScale = true
            }

            if (rotationDeg !== 0) {
                transformStr += ` rotate(${rotationDeg}deg)`
            }

            if (needsScale) {
                transformStr += ` scale(${scaleX}, ${scaleY})`
            }
            
            worldEl.element.style.transform = transformStr
            worldEl.lastScreenX = finalX
            worldEl.lastScreenY = finalY
            worldEl.lastZoom = this.camera.zoom
        })
        
        return this
    }


    cssToWorldUnits (pixels) {
        if (!this.camera) {
            return 0
        }
        // Camera pixelsPerUnit is already in CSS coordinates
        const ppu = this.camera.pixelsPerUnit
        return pixels / ppu
    }


    worldUnitsToCss (units) {
        if (!this.camera) {
            return 0
        }
        // Camera pixelsPerUnit is already in CSS coordinates
        const ppu = this.camera.pixelsPerUnit
        return units * ppu
    }

}

