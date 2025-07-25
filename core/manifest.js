import {setDefaults, getNestedValue, setNestedValue, singularize, deepMerge} from './utils'
import SourceDescriptorDescriptor from './source_descriptor'


export default class Manifest {

    #data

    constructor (data = {}) {
        this.#data = setDefaults(data, {
            metadata: {},
            config: {},
            sourceDescriptors: {},
            aliases: {}
        })

        this.#initSourceDescriptors()
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
        return this
    }


    export () {
        return deepMerge({}, {
            metadata: this.#data.metadata,
            config: this.#data.config,
            sourceDescriptors: exportSourceDescriptors(this.#data.sourceDescriptors),
            aliases: this.#data.aliases
        })
    }


    metadata (key, value) {
        if (value === undefined) {
            return key ? this.#data.metadata[key] : this.#data.metadata
        }
        
        this.#data.metadata[key] = value
        return this
    }


    config (path, value) {
        if (value === undefined) {
            if (path === undefined) {
                return this.#data.config
            }

            return getNestedValue(this.#data.config, path)
        }

        setNestedValue(this.#data.config, path, value)
        return this
    }


    addSourceDescriptor (type, sourceDescriptor) {
        validateSourceDescriptorInput(type, sourceDescriptor)
        
        this.addSourceDescriptorType(type)
        
        sourceDescriptor = prepareSourceDescriptor(type, sourceDescriptor)

        this.#data.sourceDescriptors[type][sourceDescriptor.id] = sourceDescriptor

        return sourceDescriptor
    }


    getSourceDescriptor (type, id) {
        if (!this.#data.sourceDescriptors[type]) {
            return null
        }
        return this.#data.sourceDescriptors[type][id] || null
    }


    getSource (type, id) {
        const sourceDescriptor = this.getSourceDescriptor(type, id)

        if (!sourceDescriptor) {
            return null
        }

        return sourceDescriptor.source
    }


    getSourceDescriptorsByTag (tag) {
        if (!tag || typeof tag !== 'string') {
            return []
        }

        return getSourceDescriptorsByTag(tag, this.#data.sourceDescriptors)
    }


    alias (key, value) {
        if (value === undefined) {
            return key ? this.#data.aliases[key] : this.#data.aliases
        }
        
        this.#data.aliases[key] = value
        return this
    }


    addSourceDescriptorType (type) {
        if (!type || typeof type !== 'string') {
            throw new Error('SourceDescriptor type must be a non-empty string')
        }

        if (!this.#data.sourceDescriptors[type]) {
            this.#data.sourceDescriptors[type] = {}
        }

        return this.#data.sourceDescriptors[type]
    }


    hasSourceDescriptorType (type) {
        return type in this.#data.sourceDescriptors
    }


    getSourceDescriptorTypes () {
        return Object.keys(this.#data.sourceDescriptors)
    }


    getSourceDescriptors (type) {
        return this.#data.sourceDescriptors[type] || {}
    }


    getSourceDescriptorsByType (type) {
        const descriptors = this.getSourceDescriptors(type)
        return Object.values(descriptors)
    }


    getAllSourceDescriptors () {
        const allDescriptors = []
        for (const descriptorType in this.#data.sourceDescriptors) {
            const descriptors = this.#data.sourceDescriptors[descriptorType]
            allDescriptors.push(...Object.values(descriptors))
        }
        return allDescriptors
    }


    #initSourceDescriptors () {
        const {sourceDescriptors} = this.#data

        Object.entries(sourceDescriptors).forEach(([type, descriptors]) => {
            Object.entries(descriptors).forEach(([id, descriptor]) => {
                if (!descriptor.id) {
                    descriptor.id = id
                }

                sourceDescriptors[type][id] = prepareSourceDescriptor(type, descriptor)
            })
        })
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
