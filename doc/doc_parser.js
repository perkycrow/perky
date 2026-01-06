import fs from 'fs'
import {parse} from 'acorn'


export function parseDocFile (filePath) {
    const source = fs.readFileSync(filePath, 'utf-8')
    return extractBlocks(source)
}


function extractBlocks (source) {
    const blocks = []
    const blockTypes = ['code', 'action', 'container']

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
        if (node.type !== 'CallExpression') {
            return
        }

        const callee = node.callee
        if (callee.type !== 'Identifier' || !blockTypes.includes(callee.name)) {
            return
        }

        const args = node.arguments
        if (args.length < 2) {
            return
        }

        const titleArg = args[0]
        if (titleArg.type !== 'Literal' || typeof titleArg.value !== 'string') {
            return
        }

        const callbackArg = args[1]
        if (callbackArg.type !== 'ArrowFunctionExpression' && callbackArg.type !== 'FunctionExpression') {
            return
        }

        const body = callbackArg.body
        if (body.type !== 'BlockStatement') {
            return
        }

        const bodySource = extractBlockBody(source, body.start, body.end)

        blocks.push({
            type: callee.name,
            title: titleArg.value,
            source: bodySource
        })
    })

    return blocks
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


function extractBlockBody (source, start, end) {
    const inner = source.slice(start + 1, end - 1)
    return dedent(inner)
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
