import Registry from './registry'
import Plugin from './plugin'


export default class PluginRegistry extends Registry {

    #engine

    constructor (engine) {
        super()
        this.#engine = engine
        this.#initEvents()
    }


    get engine () {
        return this.#engine
    }


    install (pluginName, plugin) {
        if (!(plugin instanceof Plugin)) {
            console.warn(`Attempted to install non-plugin object: ${pluginName}`)
            return false
        }

        if (this.has(pluginName)) {
            console.warn(`Plugin ${pluginName} already installed`)
            return false
        }

        if (!plugin.install(this.#engine)) {
            console.warn(`Failed to install plugin: ${pluginName}`)
            return false
        }

        this.set(pluginName, plugin)
        this.#engine.emit('plugin:installed', pluginName, plugin)

        return true
    }


    uninstall (pluginName) {
        if (!this.has(pluginName)) {
            return false
        }

        const plugin = this.get(pluginName)
        
        if (!plugin.uninstall()) {
            console.warn(`Failed to uninstall plugin: ${pluginName}`)
            return false
        }

        this.delete(pluginName)
        this.#engine.emit('plugin:uninstalled', pluginName, plugin)

        return true
    }


    isInstalled (pluginName) {
        return this.has(pluginName)
    }


    getPlugin (pluginName) {
        return this.get(pluginName)
    }


    getAllPlugins () {
        return Array.from(this.values())
    }


    getPluginNames () {
        return Array.from(this.keys())
    }


    #initEvents () {
        this.on('clear', () => {
            this.getAllPlugins().forEach(plugin => plugin.uninstall())
        })
    }

}
