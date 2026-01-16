import ToolWindow from './tool_window.js'


export default class ToolManager {

    #registry = new Map()
    #instances = new Map()
    #container = null
    #nextZIndex = 1000
    #nextInstanceId = 1

    #nextX = 20
    #nextY = 20
    #cascadeOffset = 30


    constructor (container = document.body) {
        this.#container = container
    }


    register (ToolClass) {
        if (!ToolClass.toolId) {
            throw new Error('Tool must have a static toolId')
        }
        this.#registry.set(ToolClass.toolId, ToolClass)
    }


    unregister (toolId) {
        this.#registry.delete(toolId)
    }


    open (toolId, params = {}) {
        const ToolClass = this.#registry.get(toolId)

        if (!ToolClass) {
            console.warn(`Tool "${toolId}" not found in registry`)
            return null
        }

        const instanceId = `${toolId}-${this.#nextInstanceId++}`

        const windowEl = new ToolWindow()
        windowEl.setTitle(ToolClass.toolName || toolId)
        windowEl.setPosition(this.#nextX, this.#nextY)

        const width = ToolClass.defaultWidth || 400
        const height = ToolClass.defaultHeight || 300
        windowEl.setSize(width, height)

        const resizable = ToolClass.resizable !== false
        windowEl.setResizable(resizable)

        this.#advanceCascade()

        const toolEl = new ToolClass()
        toolEl.setParams?.(params)

        windowEl.appendChild(toolEl)

        windowEl.addEventListener('close', () => {
            this.#handleClose(instanceId)
        })

        windowEl.addEventListener('focus', () => {
            this.#bringToFront(instanceId)
        })

        this.#container.appendChild(windowEl)

        this.#instances.set(instanceId, {window: windowEl, tool: toolEl})

        this.#bringToFront(instanceId)

        toolEl.onOpen?.()

        return instanceId
    }


    close (instanceId) {
        const instance = this.#instances.get(instanceId)
        if (!instance) {
            return
        }

        instance.tool.onClose?.()
        instance.window.remove()
        this.#instances.delete(instanceId)
    }


    closeAll (toolId = null) {
        for (const [instanceId] of this.#instances) {
            if (toolId === null || instanceId.startsWith(toolId + '-')) {
                this.close(instanceId)
            }
        }
    }


    get (instanceId) {
        const instance = this.#instances.get(instanceId)
        return instance?.tool || null
    }


    listTools () {
        return Array.from(this.#registry.entries()).map(([id, Tool]) => ({
            id,
            name: Tool.toolName || id,
            icon: Tool.toolIcon || '🔧'
        }))
    }


    listInstances () {
        return Array.from(this.#instances.keys())
    }


    has (toolId) {
        return this.#registry.has(toolId)
    }


    isOpen (instanceId) {
        return this.#instances.has(instanceId)
    }


    #handleClose (instanceId) {
        const instance = this.#instances.get(instanceId)
        if (instance) {
            instance.tool.onClose?.()
            this.#instances.delete(instanceId)
        }
    }


    #bringToFront (instanceId) {
        const instance = this.#instances.get(instanceId)
        if (instance) {
            this.#nextZIndex++
            instance.window.style.zIndex = this.#nextZIndex
        }
    }


    #advanceCascade () {
        this.#nextX += this.#cascadeOffset
        this.#nextY += this.#cascadeOffset

        if (this.#nextX > 400) {
            this.#nextX = 100
            this.#nextY = 100
        }
    }

}
