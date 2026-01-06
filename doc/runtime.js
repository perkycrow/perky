import logger from '../core/logger.js'


let currentBlocks = null
let currentSetup = null


export function doc (title, options, fn) {
    const opts = typeof options === 'function' ? {} : options
    const callback = typeof options === 'function' ? options : fn

    const docData = {
        title,
        options: opts,
        blocks: []
    }

    currentBlocks = docData.blocks
    currentSetup = null
    callback()
    currentBlocks = null
    currentSetup = null

    return docData
}


export function section (title, fn) {
    if (!currentBlocks) {
        throw new Error('section() must be called inside doc()')
    }

    const sectionData = {
        type: 'section',
        title,
        blocks: [],
        setup: null
    }

    const parentBlocks = currentBlocks
    const parentSetup = currentSetup

    currentBlocks = sectionData.blocks
    currentSetup = null
    fn()
    sectionData.setup = currentSetup

    currentBlocks = parentBlocks
    currentSetup = parentSetup

    currentBlocks.push(sectionData)
}


export function setup (fn) {
    if (!currentBlocks) {
        throw new Error('setup() must be called inside doc() or section()')
    }

    currentSetup = {
        source: extractFunctionBody(fn),
        fn
    }
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


export function container (options, fn) {
    if (!currentBlocks) {
        throw new Error('container() must be called inside doc()')
    }

    const opts = typeof options === 'function' ? {} : options
    const callback = typeof options === 'function' ? options : fn

    currentBlocks.push({
        type: 'container',
        width: opts.width || 400,
        height: opts.height || 300,
        title: opts.title || null,
        source: extractFunctionBody(callback),
        fn: callback
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
