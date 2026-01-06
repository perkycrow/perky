import * as acorn from 'acorn'


export function parseTestFile (source, filePath = null) {
    const ast = acorn.parse(source, {
        ecmaVersion: 'latest',
        sourceType: 'module',
        locations: true
    })

    const result = {
        file: filePath,
        describes: []
    }

    for (const node of ast.body) {
        if (isDescribeCall(node)) {
            result.describes.push(parseDescribe(node, source))
        }
    }

    return result
}


function isDescribeCall (node) {
    if (node.type !== 'ExpressionStatement') {
        return false
    }

    const expr = node.expression

    if (expr.type !== 'CallExpression') {
        return false
    }

    return expr.callee.type === 'Identifier' && expr.callee.name === 'describe'
}


function isTestCall (node) {
    if (node.type !== 'ExpressionStatement') {
        return false
    }

    const expr = node.expression

    if (expr.type !== 'CallExpression') {
        return false
    }

    const name = expr.callee.name

    return expr.callee.type === 'Identifier' && (name === 'test' || name === 'it')
}


function isBeforeEachCall (node) {
    if (node.type !== 'ExpressionStatement') {
        return false
    }

    const expr = node.expression

    if (expr.type !== 'CallExpression') {
        return false
    }

    return expr.callee.type === 'Identifier' && expr.callee.name === 'beforeEach'
}


function isAfterEachCall (node) {
    if (node.type !== 'ExpressionStatement') {
        return false
    }

    const expr = node.expression

    if (expr.type !== 'CallExpression') {
        return false
    }

    return expr.callee.type === 'Identifier' && expr.callee.name === 'afterEach'
}


function parseDescribe (node, source) {
    const expr = node.expression
    const args = expr.arguments
    const title = getCallTitle(args[0], source)
    const callback = args[1]

    const describe = {
        title,
        line: node.loc.start.line,
        beforeEach: null,
        afterEach: null,
        tests: [],
        describes: []
    }

    if (callback && callback.type === 'ArrowFunctionExpression') {
        parseDescribeBody(callback.body, source, describe)
    }

    return describe
}


function getCallTitle (arg, source) {
    if (!arg) {
        return 'Unknown'
    }

    if (arg.type === 'Literal') {
        return String(arg.value)
    }

    if (arg.type === 'Identifier') {
        return arg.name
    }

    return source.slice(arg.start, arg.end)
}


function parseDescribeBody (body, source, describe) {
    if (body.type !== 'BlockStatement') {
        return
    }

    for (const statement of body.body) {
        if (isDescribeCall(statement)) {
            describe.describes.push(parseDescribe(statement, source))
        } else if (isTestCall(statement)) {
            describe.tests.push(parseTest(statement, source))
        } else if (isBeforeEachCall(statement)) {
            describe.beforeEach = parseHook(statement, source)
        } else if (isAfterEachCall(statement)) {
            describe.afterEach = parseHook(statement, source)
        }
    }
}


function parseTest (node, source) {
    const expr = node.expression
    const args = expr.arguments
    const title = getCallTitle(args[0], source)
    const callback = args[1]

    return {
        title,
        line: node.loc.start.line,
        source: callback ? extractFunctionBody(callback, source) : null
    }
}


function parseHook (node, source) {
    const expr = node.expression
    const callback = expr.arguments[0]

    return {
        line: node.loc.start.line,
        source: callback ? extractFunctionBody(callback, source) : null
    }
}


function extractFunctionBody (fn, source) {
    if (fn.type === 'ArrowFunctionExpression' || fn.type === 'FunctionExpression') {
        const body = fn.body

        if (body.type === 'BlockStatement') {
            const inner = source.slice(body.start + 1, body.end - 1)
            return dedentSource(inner.trim())
        }

        return source.slice(body.start, body.end)
    }

    return null
}


function dedentSource (code) {
    const lines = code.split('\n')

    if (lines.length <= 1) {
        return code
    }

    const restLines = lines.slice(1).filter(line => line.trim().length > 0)

    if (restLines.length === 0) {
        return code
    }

    const minIndent = restLines.reduce((min, line) => {
        const match = line.match(/^(\s*)/)
        const indent = match ? match[1].length : 0
        return Math.min(min, indent)
    }, Infinity)

    if (minIndent === 0 || minIndent === Infinity) {
        return code
    }

    return [lines[0], ...lines.slice(1).map(line => line.slice(minIndent))].join('\n')
}


export function getTestsForFile (source, filePath = null) {
    const parsed = parseTestFile(source, filePath)

    if (parsed.describes.length === 0) {
        return null
    }

    return {
        file: filePath,
        describes: parsed.describes
    }
}
