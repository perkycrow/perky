import {setDefaults, getNestedValue, setNestedValue, singularize, deepMerge} from './utils'
import Source from './source'


export default class Manifest {

    constructor (data = {}) {
        this.data = setDefaults(data, {
            metadata: {},
            config: {},
            sources: {},
            aliases: {}
        })
    }


    import (jsonData) {
        if (typeof jsonData === 'string') {
            try {
                this.data = JSON.parse(jsonData)
            } catch (error) {
                throw new Error(`Failed to parse manifest JSON: ${error.message}`)
            }
        } else if (jsonData && typeof jsonData === 'object') {
            this.data = jsonData
        } else {
            throw new Error('Invalid manifest data: must be a JSON string or object')
        }
        return this
    }


    export () {
        return deepMerge({}, {
            metadata: this.data.metadata,
            config: this.data.config,
            sources: exportSources(this.data.sources),
            aliases: this.data.aliases
        })
    }


    metadata (key, value) {
        if (value === undefined) {
            return key ? this.data.metadata[key] : this.data.metadata
        }
        
        this.data.metadata[key] = value
        return this
    }


    config (path, value) {
        if (value === undefined) {
            return getNestedValue(this.data.config, path)
        }

        setNestedValue(this.data.config, path, value)
        return this
    }


    addSource (type, source) {
        validateSourceInput(type, source)
        
        this.addSourceType(type)
        
        source = prepareSource(type, source)

        this.data.sources[type][source.id] = source

        return source
    }


    getSource (type, id) {
        if (!this.data.sources[type]) {
            return null
        }
        return this.data.sources[type][id] || null
    }


    getSourcesByTag (tag) {
        if (!tag || typeof tag !== 'string') {
            return []
        }

        return getSourcesByTag(tag, this.data.sources)
    }


    alias (key, value) {
        if (value === undefined) {
            return key ? this.data.aliases[key] : this.data.aliases
        }
        
        this.data.aliases[key] = value
        return this
    }

    addSourceType (type) {
        if (!type || typeof type !== 'string') {
            throw new Error('Source type must be a non-empty string')
        }

        if (!this.data.sources[type]) {
            this.data.sources[type] = {}
        }

        return this.data.sources[type]
    }


    hasSourceType (type) {
        return type in this.data.sources
    }


    getSourceTypes () {
        return Object.keys(this.data.sources)
    }


    getSources (type) {
        return this.data.sources[type] || {}
    }

}



function validateSourceInput (type, source) {
    if (!type || typeof type !== 'string') {
        throw new Error('Source type must be a non-empty string')
    }

    if (!source || typeof source !== 'object') {
        throw new Error('Source must be an object or Source instance')
    }
}


function prepareSource (type, source) {
    if (!source.type) {
        source.type = singularize(type)
    }

    if (!(source instanceof Source)) {
        source = new Source(source)
    }

    if (!source.id) {
        throw new Error('Source must have an id')
    }

    return source
}


function getSourcesByTag (tag, sources) {
    const sourcesByTag = []

    for (const type in sources) {
        const sourceCollection = sources[type]

        for (const id in sourceCollection) {
            const source = sourceCollection[id]

            if (source.hasTag(tag)) {
                sourcesByTag.push(source)
            }
        }
    }

    return sourcesByTag
}


function exportSources (sources) {
    const exported = {}

    for (const type in sources) {
        const sourceList = sources[type]
        exported[type] = {}

        for (const id in sourceList) {
            const source = sourceList[id]
            exported[type][id] = source.export()
        }
    }

    return exported
}
