import pluralizeLib from '../libs/pluralize'


export function getUrlExt (url) {
    let withoutArgs = url.split('?').shift()
    return withoutArgs.split('.').pop().toLowerCase()
}



export function formatNumber (number) {
    return number.toLocaleString(undefined, {})
}


export function numberToRoman (number) {
    let roman = ''
    let i

    let romanNumList = {
        M: 1000,
        CM: 900,
        D: 500,
        CD: 400,
        C: 100,
        XC: 90,
        L: 50,
        XL: 40,
        X: 10,
        IX: 9,
        V: 5,
        IV: 4,
        I: 1
    }

    for (i in romanNumList) {
        while (number >= romanNumList[i]) {
            roman += i
            number -= romanNumList[i]
        }
    }

    return roman
}



export function compileText (text, data = {}) {
    let compiled = text

    Object.keys(data).forEach(key => {
        compiled = compiled.replace(new RegExp(`{{${key}}}`, 'g'), data[key])
    })

    return compiled
}


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


export function pluralize (word) {
    return pluralizeLib(word)
}


export function singularize (word) {
    return pluralizeLib.singular(word)
}
