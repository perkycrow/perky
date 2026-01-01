
export function tokenize (input) { // eslint-disable-line complexity -- clean
    const args = []
    let current = ''
    let depth = 0
    let inString = false
    let stringChar = null

    for (const char of input) {
        if (!inString && (char === '"' || char === "'")) {
            inString = true
            stringChar = char
            current += char
        } else if (inString && char === stringChar) {
            inString = false
            stringChar = null
            current += char
        } else if (!inString && (char === '{' || char === '[')) {
            depth++
            current += char
        } else if (!inString && (char === '}' || char === ']')) {
            depth--
            current += char
        } else if (!inString && depth === 0 && char === ',') {
            args.push(current.trim())
            current = ''
        } else {
            current += char
        }
    }

    if (current.trim()) {
        args.push(current.trim())
    }

    return args.map(smartParse)
}


export function smartParse (value) { // eslint-disable-line complexity -- clean
    if (!value) {
        return undefined
    }

    if (value === 'true') {
        return true
    }

    if (value === 'false') {
        return false
    }

    if (value === 'null') {
        return null
    }

    if (value === 'undefined') {
        return undefined
    }

    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
        return value.slice(1, -1)
    }

    if (value.startsWith('{') || value.startsWith('[')) {
        try {
            return parseRelaxedJSON(value)
        } catch {
            return value
        }
    }

    const num = Number(value)
    if (!isNaN(num) && value !== '') {
        return num
    }

    return value
}


function parseRelaxedJSON (value) {
    return new Function(`return (${value})`)()
}


export function parseCommand (input) {
    const trimmed = input.trim()
    const spaceIndex = trimmed.indexOf(' ')

    if (spaceIndex === -1) {
        return {command: trimmed, args: []}
    }

    const command = trimmed.slice(0, spaceIndex)
    const argsString = trimmed.slice(spaceIndex + 1)

    return {command, args: tokenize(argsString)}
}
