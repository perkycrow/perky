import pluralizeLib from './pluralize'


export function toCamelCase (string) {
    return string
        .replace(/[-_\s]([a-z])/g, (match, letter) => letter.toUpperCase())
        .replace(/^[A-Z]/, letter => letter.toLowerCase())
}


export function toPascalCase (string) {
    return toCamelCase(string).replace(/^[a-z]/, letter => letter.toUpperCase())
}


export function toSnakeCase (string) {
    return string
        .replace(/[-\s]/g, '_')
        .replace(/([A-Z])([A-Z][a-z])/g, '$1_$2')
        .replace(/([a-z])([A-Z])/g, '$1_$2')
        .toLowerCase()
        .replace(/^_/, '')
}


const idCounter = {}

export function uniqueId (collection, prefix) {
    if (!prefix) {
        prefix = collection
        collection = 'default'
    }

    if (!idCounter[collection]) {
        idCounter[collection] = {}
    }

    if (!idCounter[collection][prefix]) {
        idCounter[collection][prefix] = 0
    }

    const current = idCounter[collection][prefix]
    idCounter[collection][prefix]++

    return current === 0 ? prefix : `${prefix}_${current}`
}


export function resetUniqueId (collection, prefix) {
    if (prefix) {
        if (idCounter[collection]) {
            idCounter[collection][prefix] = 0
        }
    } else {
        idCounter[collection] = {}
    }
}


export function singularize (word) {
    return pluralizeLib.singular(word)
}


export function setDefaults (data, defaults) {
    return deepMerge(defaults, data)
}


export function getNestedValue (obj, path) {
    if (!path) {
        return obj
    }

    const parts = path.split('.')
    let current = obj

    for (const part of parts) {
        if (current === undefined || current === null) {
            return undefined
        }
        current = current[part]
    }

    return current
}


export function setNestedValue (obj, path, value) {
    const parts = path.split('.')
    let current = obj

    for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i]
        if (!current[part]) {
            current[part] = {}
        }
        current = current[part]
    }

    current[parts[parts.length - 1]] = value
    return obj
}


export function deepMerge (target, source) {
    if (!source) {
        return target
    }

    const sourceIsArray = Array.isArray(source)
    const targetIsArray = Array.isArray(target)

    if (sourceIsArray !== targetIsArray) {
        return cloneIfNeeded(source)
    }

    if (sourceIsArray) {
        return mergeArrays(target, source)
    }

    return mergeObject(target, source)
}


export function exportValue (value) { // eslint-disable-line complexity

    if (value && typeof value === 'object') {
        if (typeof value.export === 'function') {
            return value.export()
        }

        if (Array.isArray(value)) {
            return value.map(item => exportValue(item))
        }

        const result = {}
        for (const key in value) {
            if (value.hasOwnProperty(key)) {
                result[key] = exportValue(value[key])
            }
        }
        return result
    }

    return value
}


function isNonNullObject (value) {
    return Boolean(value) && typeof value === 'object'
}


function isSpecial (value) {
    const stringValue = Object.prototype.toString.call(value)
    return stringValue === '[object RegExp]' || stringValue === '[object Date]'
}


function isMergeableObject (value) {
    return isNonNullObject(value) && !isSpecial(value)
}


function emptyTarget (value) {
    return Array.isArray(value) ? [] : {}
}


function cloneIfNeeded (value, isMergeable = isMergeableObject) {
    return (isMergeable(value)) ? deepMerge(emptyTarget(value), value) : value
}


function mergeArrays (target, source) {
    return target.concat(source).map(element => cloneIfNeeded(element))
}


function getKeys (target) {
    const symbols = Object.getOwnPropertySymbols
        ? Object.getOwnPropertySymbols(target).filter(symbol =>
            Object.propertyIsEnumerable.call(target, symbol))
        : []
    return Object.keys(target).concat(symbols)
}


function mergeObject (target, source) {
    const destination = {}

    if (isMergeableObject(target)) {
        getKeys(target).forEach(key => {
            destination[key] = cloneIfNeeded(target[key])
        })
    }

    getKeys(source).forEach(key => {
        if ((key in target) && isMergeableObject(source[key])) {
            destination[key] = deepMerge(target[key], source[key])
        } else {
            destination[key] = cloneIfNeeded(source[key])
        }
    })

    return destination
}
