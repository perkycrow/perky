export default class DevToolsState extends EventTarget {

    #sidebarOpen = false
    #activeTool = null
    #spotlightOpen = false
    #loggerOpen = false
    #module = null
    #appManager = null


    get sidebarOpen () {
        return this.#sidebarOpen
    }


    get activeTool () {
        return this.#activeTool
    }


    get spotlightOpen () {
        return this.#spotlightOpen
    }


    get loggerOpen () {
        return this.#loggerOpen
    }


    get module () {
        return this.#module
    }


    get appManager () {
        return this.#appManager
    }


    openTool (toolId) {
        const wasOpen = this.#sidebarOpen
        const previousTool = this.#activeTool

        this.#activeTool = toolId
        this.#sidebarOpen = true

        if (previousTool !== toolId) {
            this.dispatchEvent(new CustomEvent('tool:change', {
                detail: {toolId, previousTool}
            }))
        }

        if (!wasOpen) {
            this.dispatchEvent(new CustomEvent('sidebar:open'))
        }
    }


    closeSidebar () {
        if (!this.#sidebarOpen) {
            return
        }

        this.#sidebarOpen = false
        this.dispatchEvent(new CustomEvent('sidebar:close'))
    }


    toggleSidebar () {
        if (this.#sidebarOpen) {
            this.closeSidebar()
        } else if (this.#activeTool) {
            this.openTool(this.#activeTool)
        }
    }


    toggleTool (toolId) {
        if (this.#sidebarOpen && this.#activeTool === toolId) {
            this.closeSidebar()
        } else {
            this.openTool(toolId)
        }
    }


    openSpotlight () {
        if (this.#spotlightOpen) {
            return
        }

        this.#spotlightOpen = true
        this.dispatchEvent(new CustomEvent('spotlight:open'))
    }


    closeSpotlight () {
        if (!this.#spotlightOpen) {
            return
        }

        this.#spotlightOpen = false
        this.dispatchEvent(new CustomEvent('spotlight:close'))
    }


    toggleSpotlight () {
        if (this.#spotlightOpen) {
            this.closeSpotlight()
        } else {
            this.openSpotlight()
        }
    }


    openLogger () {
        if (this.#loggerOpen) {
            return
        }

        this.#loggerOpen = true
        this.dispatchEvent(new CustomEvent('logger:open'))
    }


    closeLogger () {
        if (!this.#loggerOpen) {
            return
        }

        this.#loggerOpen = false
        this.dispatchEvent(new CustomEvent('logger:close'))
    }


    toggleLogger () {
        if (this.#loggerOpen) {
            this.closeLogger()
        } else {
            this.openLogger()
        }
    }


    setModule (module) {
        const previousModule = this.#module
        this.#module = module

        this.dispatchEvent(new CustomEvent('module:change', {
            detail: {module, previousModule}
        }))
    }


    setAppManager (appManager) {
        const previousAppManager = this.#appManager
        this.#appManager = appManager

        this.dispatchEvent(new CustomEvent('appmanager:change', {
            detail: {appManager, previousAppManager}
        }))
    }

}
