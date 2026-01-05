import logger from '../core/logger.js'


let currentBlocks = null


export function doc (title, options, fn) {
    const opts = typeof options === 'function' ? {} : options
    const callback = typeof options === 'function' ? options : fn

    const docData = {
        title,
        options: opts,
        blocks: []
    }

    currentBlocks = docData.blocks
    callback()
    currentBlocks = null

    return docData
}


export function text (content) {
    if (!currentBlocks) {
        throw new Error('text() must be called inside doc()')
    }

    currentBlocks.push({
        type: 'text',
        content: dedent(content)
    })
}


export function code (title, fn) {
    if (!currentBlocks) {
        throw new Error('code() must be called inside doc()')
    }

    currentBlocks.push({
        type: 'code',
        title,
        source: extractFunctionBody(fn)
    })
}


export function action (title, fn) {
    if (!currentBlocks) {
        throw new Error('action() must be called inside doc()')
    }

    currentBlocks.push({
        type: 'action',
        title,
        source: extractFunctionBody(fn),
        fn
    })
}


function extractFunctionBody (fn) {
    const source = fn.toString()

    const arrowMatch = source.match(/^\s*\(?[^)]*\)?\s*=>\s*\{([\s\S]*)\}\s*$/)
    if (arrowMatch) {
        return dedent(arrowMatch[1])
    }

    const functionMatch = source.match(/^function\s*\w*\s*\([^)]*\)\s*\{([\s\S]*)\}\s*$/)
    if (functionMatch) {
        return dedent(functionMatch[1])
    }

    const arrowExpressionMatch = source.match(/^\s*\(?[^)]*\)?\s*=>\s*(.+)$/)
    if (arrowExpressionMatch) {
        return arrowExpressionMatch[1].trim()
    }

    return source
}


function dedent (str) {
    let lines = str.split('\n')

    while (lines.length > 0 && lines[0].trim() === '') {
        lines.shift()
    }
    while (lines.length > 0 && lines[lines.length - 1].trim() === '') {
        lines.pop()
    }

    if (lines.length === 0) {
        return ''
    }

    const nonEmptyLines = lines.filter(line => line.trim())
    if (nonEmptyLines.length === 0) {
        return lines.join('\n')
    }

    const minIndent = Math.min(
        ...nonEmptyLines.map(line => {
            const match = line.match(/^(\s*)/)
            return match ? match[1].length : 0
        })
    )

    if (minIndent === 0) {
        return lines.join('\n')
    }

    return lines.map(line => line.slice(minIndent)).join('\n')
}


export {logger}
