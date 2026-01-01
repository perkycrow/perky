import PerkyModule from '../core/perky_module'
import {setDefaults, getNestedValue, setNestedValue, deepMerge} from '../core/utils'
import Registry from '../core/registry'
import Asset from './asset'


export default class Manifest extends PerkyModule {

    static $category = 'manifest'
    static $lifecycle = false

    #data

    constructor (params = {}) {
        const {data = {}, ...moduleParams} = params

        super(moduleParams)

        this.#data = setDefaults(data, {
            config: {},
            assets: {}
        })

        this.assets = new Registry()
        this.assets.addIndex('type', asset => asset.type)
        this.assets.addIndex('tags', asset => asset.tags)

        this.#initAssets()
    }


    onInstall (host) {
        this.delegateTo(host, [
            'getConfig',
            'setConfig',
            'addAsset',
            'getAsset',
            'getAssets',
            'getAssetsByType',
            'getAssetsByTag',
            'getSource',
            'getAllAssets'
        ])

        this.delegateTo(host, {
            export: 'exportManifest',
            import: 'importManifest'
        })
    }


    import (jsonData) {
        if (typeof jsonData === 'string') {
            try {
                this.#data = JSON.parse(jsonData)
            } catch (error) {
                throw new Error(`Failed to parse manifest JSON: ${error.message}`)
            }
        } else if (jsonData && typeof jsonData === 'object') {
            this.#data = jsonData
        } else {
            throw new Error('Invalid manifest data: must be a JSON string or object')
        }

        this.assets.clear()
        this.#initAssets()

        return this
    }


    export () {
        return deepMerge({}, {
            config: this.#data.config,
            assets: this.#exportAssets()
        })
    }


    getConfig (path) {
        if (path === undefined) {
            return this.#data.config
        }

        return getNestedValue(this.#data.config, path)
    }


    setConfig (path, value) {
        setNestedValue(this.#data.config, path, value)
        return this
    }


    addAsset (assetData) {
        validateAssetInput(assetData)

        const asset = prepareAsset(assetData)

        this.assets.set(asset.id, asset)

        return asset
    }


    getAsset (id) {
        return this.assets.get(id) || null
    }


    getSource (id) {
        const asset = this.getAsset(id)

        if (!asset) {
            return null
        }

        return asset.source
    }


    getAssetsByType (type) {
        return this.assets.lookup('type', type)
    }


    getAssetsByTag (tag) {
        if (!tag || typeof tag !== 'string') {
            return []
        }

        return this.assets.lookup('tags', tag)
    }


    getAssets () {
        return this.assets.all
    }


    getAllAssets () {
        return this.assets.all
    }


    hasAsset (id) {
        return this.assets.has(id)
    }


    removeAsset (id) {
        return this.assets.delete(id)
    }


    #initAssets () {
        const {assets} = this.#data

        if (!assets || typeof assets !== 'object') {
            return
        }

        Object.entries(assets).forEach(([id, assetData]) => {
            if (!assetData.id) {
                assetData.id = id
            }

            const asset = prepareAsset(assetData)
            this.assets.set(asset.id, asset)
        })
    }


    #exportAssets () {
        const exported = {}

        for (const asset of this.assets.all) {
            exported[asset.id] = asset.export()
        }

        return exported
    }

}


function validateAssetInput (assetData) {
    if (!assetData || typeof assetData !== 'object') {
        throw new Error('Asset must be an object or Asset instance')
    }
}


function prepareAsset (assetData) {
    if (assetData instanceof Asset) {
        return assetData
    }

    const asset = new Asset(assetData)

    if (!asset.id) {
        throw new Error('Asset must have an id')
    }

    return asset
}
