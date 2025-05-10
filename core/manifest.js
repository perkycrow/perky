import {setDefaults, getNestedValue, setNestedValue, singularize, deepMerge} from './utils'
import SourceDescriptorDescriptor from './source_descriptor'


export default class Manifest {

    constructor (data = {}) {
        this.data = setDefaults(data, {
            metadata: {},
            config: {},
            sourceDescriptors: {},
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
            sourceDescriptors: exportSourceDescriptors(this.data.sourceDescriptors),
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


    addSourceDescriptor (type, sourceDescriptor) {
        validateSourceDescriptorInput(type, sourceDescriptor)
        
        this.addSourceDescriptorType(type)
        
        sourceDescriptor = prepareSourceDescriptor(type, sourceDescriptor)

        this.data.sourceDescriptors[type][sourceDescriptor.id] = sourceDescriptor

        return sourceDescriptor
    }


    getSourceDescriptor (type, id) {
        if (!this.data.sourceDescriptors[type]) {
            return null
        }
        return this.data.sourceDescriptors[type][id] || null
    }


    getSourceDescriptorsByTag (tag) {
        if (!tag || typeof tag !== 'string') {
            return []
        }

        return getSourceDescriptorsByTag(tag, this.data.sourceDescriptors)
    }


    alias (key, value) {
        if (value === undefined) {
            return key ? this.data.aliases[key] : this.data.aliases
        }
        
        this.data.aliases[key] = value
        return this
    }

    addSourceDescriptorType (type) {
        if (!type || typeof type !== 'string') {
            throw new Error('SourceDescriptor type must be a non-empty string')
        }

        if (!this.data.sourceDescriptors[type]) {
            this.data.sourceDescriptors[type] = {}
        }

        return this.data.sourceDescriptors[type]
    }


    hasSourceDescriptorType (type) {
        return type in this.data.sourceDescriptors
    }


    getSourceDescriptorTypes () {
        return Object.keys(this.data.sourceDescriptors)
    }


    getSourceDescriptors (type) {
        return this.data.sourceDescriptors[type] || {}
    }

}



function validateSourceDescriptorInput (type, source) {
    if (!type || typeof type !== 'string') {
        throw new Error('SourceDescriptor type must be a non-empty string')
    }

    if (!source || typeof source !== 'object') {
        throw new Error('SourceDescriptor must be an object or SourceDescriptor instance')
    }
}


function prepareSourceDescriptor (type, sourceDescriptor) {
    if (!sourceDescriptor.type) {
        sourceDescriptor.type = singularize(type)
    }

    if (!(sourceDescriptor instanceof SourceDescriptorDescriptor)) {
        sourceDescriptor = new SourceDescriptorDescriptor(sourceDescriptor)
    }

    if (!sourceDescriptor.id) {
        throw new Error('SourceDescriptor must have an id')
    }

    return sourceDescriptor
}


function getSourceDescriptorsByTag (tag, sourceDescriptors) {
    const sourceDescriptorsByTag = []

    for (const type in sourceDescriptors) {
        const sourceCollection = sourceDescriptors[type]

        for (const id in sourceCollection) {
            const sourceDescriptor = sourceCollection[id]

            if (sourceDescriptor.hasTag(tag)) {
                sourceDescriptorsByTag.push(sourceDescriptor)
            }
        }
    }

    return sourceDescriptorsByTag
}


function exportSourceDescriptors (sourceDescriptors) {
    const exported = {}

    for (const type in sourceDescriptors) {
        const sourceList = sourceDescriptors[type]
        exported[type] = {}

        for (const id in sourceList) {
            const sourceDescriptor = sourceList[id]
            exported[type][id] = sourceDescriptor.export()
        }
    }

    return exported
}
