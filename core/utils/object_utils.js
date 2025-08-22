export function filterKeys (object, keys = []) {
    return keys.reduce((filtered, key) => {
        if (key in object) {
            filtered[key] = object[key]
        }
        return filtered
    }, {})
}


export function sum (numbers) {
    return numbers.reduce((previous, current) => previous + current, 0)
}


export function pluck (array, key) {
    return array.map(item => item[key])
}


export function compact (array) {
    return array.filter(element => element !== null && typeof element !== 'undefined')
}


export function isNonNullObject (value) {
    return Boolean(value) && typeof value === 'object'
}


export function isSpecial (value) {
    const stringValue = Object.prototype.toString.call(value)
    return stringValue === '[object RegExp]' || stringValue === '[object Date]'
}


export function isMergeableObject (value) {
    return isNonNullObject(value) && !isSpecial(value)
}


export function emptyTarget (value) {
    return Array.isArray(value) ? [] : {}
}


export function cloneIfNeeded (value, isMergeable = isMergeableObject) {
    return (isMergeable(value)) ? deepMerge(emptyTarget(value), value) : value
}


export function mergeArrays (target, source) {
    return target.concat(source).map(element => cloneIfNeeded(element))
}


export function getKeys (target) {
    const symbols = Object.getOwnPropertySymbols 
        ? Object.getOwnPropertySymbols(target).filter(symbol => 
            Object.propertyIsEnumerable.call(target, symbol)) 
        : []
    return Object.keys(target).concat(symbols)
}


export function mergeObject (target, source) {
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


