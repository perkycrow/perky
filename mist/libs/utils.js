export function deepMerge (objectA, objectB) {
    const result = {}

    for (const key in objectA) {
        result[key] = objectA[key]
    }

    for (const key in objectB) {
        result[key] = mergedProperty(result, objectB[key], key)
    }

    return result
}


function mergedProperty (result, newValue, key) {
    if (key in result) {
        if (Array.isArray(result[key])) {
            if (Array.isArray(newValue)) {
                return mergeArrays(result[key], newValue)
            }
        } else if (typeof result[key] === 'object' && typeof newValue === 'object' && !Array.isArray(newValue)) {
            return deepMerge(result[key], newValue)
        }
    }
    return newValue
}


function mergeArrays (arrayA, arrayB) {
    const result = arrayA.slice()
    for (let i = 0; i < arrayB.length; i++) {
        if (result.indexOf(arrayB[i]) === -1) {
            result.push(arrayB[i])
        }
    }
    return result
}
