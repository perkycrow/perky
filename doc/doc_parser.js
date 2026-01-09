import fs from 'fs'
import {parse} from 'acorn'
import {dedent} from './utils/dedent.js'


export function parseDocFile (filePath) {
    const source = fs.readFileSync(filePath, 'utf-8')
    return extractBlocks(source)
}


function extractBlocks (source) {
    const blocks = []
    const blockTypes = ['code', 'action', 'container']
    let setupIndex = 0

    let ast
    try {
        ast = parse(source, {
            ecmaVersion: 'latest',
            sourceType: 'module',
            locations: true
        })
    } catch {
        return blocks
    }

    walkNode(ast, (node) => {
        const block = extractBlock(node, source, blockTypes)
        if (block) {
            blocks.push(block)
        }

        const setupBlock = extractSetupBlock(node, source, setupIndex)
        if (setupBlock) {
            blocks.push(setupBlock)
            setupIndex++
        }
    })

    return blocks
}


function extractBlock (node, source, blockTypes) {
    if (node.type !== 'CallExpression') {
        return null
    }

    const callee = node.callee
    if (callee.type !== 'Identifier' || !blockTypes.includes(callee.name)) {
        return null
    }

    const args = node.arguments
    if (args.length < 2) {
        return null
    }

    const title = extractTitle(args[0])
    if (!title) {
        return null
    }

    const callbackArg = args[1]
    if (callbackArg.type !== 'ArrowFunctionExpression' && callbackArg.type !== 'FunctionExpression') {
        return null
    }

    const body = callbackArg.body
    if (body.type !== 'BlockStatement') {
        return null
    }

    return {
        type: callee.name,
        title,
        source: extractBlockBody(source, body.start, body.end)
    }
}


function extractTitle (titleArg) {
    if (titleArg.type === 'Literal' && typeof titleArg.value === 'string') {
        return titleArg.value
    }

    if (titleArg.type === 'ObjectExpression') {
        const titleProp = titleArg.properties.find(
            p => p.key?.name === 'title' || p.key?.value === 'title'
        )
        if (titleProp?.value?.type === 'Literal') {
            return titleProp.value.value
        }
    }

    return null
}


function walkNode (node, callback) {
    if (!node || typeof node !== 'object') {
        return
    }

    callback(node)

    for (const key of Object.keys(node)) {
        const child = node[key]

        if (Array.isArray(child)) {
            for (const item of child) {
                walkNode(item, callback)
            }
        } else if (child && typeof child === 'object' && child.type) {
            walkNode(child, callback)
        }
    }
}


function extractSetupBlock (node, source, index) {
    if (node.type !== 'CallExpression') {
        return null
    }

    const callee = node.callee
    if (callee.type !== 'Identifier' || callee.name !== 'setup') {
        return null
    }

    const args = node.arguments
    if (args.length < 1) {
        return null
    }

    const callbackArg = args[0]
    if (callbackArg.type !== 'ArrowFunctionExpression' && callbackArg.type !== 'FunctionExpression') {
        return null
    }

    const body = callbackArg.body
    if (body.type !== 'BlockStatement') {
        return null
    }

    return {
        type: 'setup',
        index,
        source: extractBlockBody(source, body.start, body.end)
    }
}


function extractBlockBody (source, start, end) {
    const inner = source.slice(start + 1, end - 1)
    const filtered = inner.split('\n')
        .filter(line => !line.trim().startsWith('ctx.setApp('))
        .join('\n')
    return dedent(filtered)
}
