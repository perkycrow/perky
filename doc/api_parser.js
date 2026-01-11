import * as acorn from 'acorn'
import {dedentSource} from './utils/dedent.js'


export function parseSourceFile (source, filePath = null) {
    const ast = acorn.parse(source, {
        ecmaVersion: 'latest',
        sourceType: 'module',
        locations: true
    })

    const result = {
        file: filePath,
        classes: [],
        functions: [],
        exports: []
    }

    for (const node of ast.body) {
        processNode(node, source, result)
    }

    return result
}


function processNode (node, source, result) {
    if (node.type === 'ExportDefaultDeclaration') {
        processDefaultExport(node, source, result)
    } else if (node.type === 'ExportNamedDeclaration') {
        processNamedExport(node, source, result)
    } else if (node.type === 'ClassDeclaration') {
        result.classes.push(parseClass(node, source))
    } else if (node.type === 'FunctionDeclaration') {
        result.functions.push(parseFunction(node, source))
    }
}


function processDefaultExport (node, source, result) {
    if (node.declaration.type === 'ClassDeclaration') {
        const classInfo = parseClass(node.declaration, source)
        classInfo.isDefault = true
        result.classes.push(classInfo)
    } else if (node.declaration.type === 'FunctionDeclaration') {
        const fnInfo = parseFunction(node.declaration, source)
        fnInfo.isDefault = true
        result.functions.push(fnInfo)
    }
}


function processNamedExport (node, source, result) {
    const decl = node.declaration

    if (!decl) {
        return
    }

    if (decl.type === 'ClassDeclaration') {
        result.classes.push(parseClass(decl, source))
    } else if (decl.type === 'FunctionDeclaration') {
        result.functions.push(parseFunction(decl, source))
    } else if (decl.type === 'VariableDeclaration') {
        for (const varDecl of decl.declarations) {
            result.exports.push({
                name: varDecl.id.name,
                kind: 'variable',
                line: node.loc.start.line,
                source: extractSource(source, node)
            })
        }
    }
}


function parseClass (node, source) {
    const classInfo = {
        name: node.id?.name || 'Anonymous',
        line: node.loc.start.line,
        extends: node.superClass?.name || null,
        statics: [],
        methods: [],
        getters: [],
        setters: [],
        constructor: null
    }

    for (const member of node.body.body) {
        if (isPrivate(member)) {
            continue
        }

        const memberInfo = parseMember(member, source)

        if (memberInfo) {
            addMemberToClass(classInfo, member, memberInfo)
        }
    }

    return classInfo
}


function addMemberToClass (classInfo, member, memberInfo) {
    const target = getMemberTarget(classInfo, member)

    if (target) {
        target.push(memberInfo)
    } else if (member.kind === 'constructor') {
        classInfo.constructor = memberInfo
    }
}


function getMemberTarget (classInfo, member) {
    if (member.static) {
        return classInfo.statics
    }

    if (member.kind === 'get') {
        return classInfo.getters
    }

    if (member.kind === 'set') {
        return classInfo.setters
    }

    if (member.kind === 'method') {
        return classInfo.methods
    }

    return null
}


function parseMember (member, source) {
    const name = getMemberName(member)

    if (!name) {
        return null
    }

    const base = {
        name,
        line: member.loc.start.line,
        source: extractSource(source, member)
    }

    if (member.type === 'PropertyDefinition') {
        return {
            ...base,
            kind: 'property',
            value: member.value ? extractSource(source, member.value) : null
        }
    }

    if (member.type === 'MethodDefinition') {
        return {
            ...base,
            kind: member.kind === 'constructor' ? 'constructor' : 'method',
            params: extractParams(member.value)
        }
    }

    return base
}


function parseFunction (node, source) {
    return {
        name: node.id?.name || 'anonymous',
        line: node.loc.start.line,
        params: extractParams(node),
        source: extractSource(source, node)
    }
}


function isPrivate (member) {
    if (member.key?.type === 'PrivateIdentifier') {
        return true
    }

    const name = getMemberName(member)

    return name && name.startsWith('#')
}


function getMemberName (member) {
    if (member.key?.type === 'Identifier') {
        return member.key.name
    }

    if (member.key?.type === 'PrivateIdentifier') {
        return '#' + member.key.name
    }

    if (member.key?.type === 'Literal') {
        return String(member.key.value)
    }

    return null
}


function extractParams (fnNode) {
    if (!fnNode.params) {
        return []
    }

    return fnNode.params.map(param => {
        if (param.type === 'Identifier') {
            return param.name
        }

        if (param.type === 'AssignmentPattern') {
            return param.left.name + ' = ...'
        }

        if (param.type === 'RestElement') {
            return '...' + param.argument.name
        }

        if (param.type === 'ObjectPattern') {
            return '{...}'
        }

        if (param.type === 'ArrayPattern') {
            return '[...]'
        }

        return '?'
    })
}


function extractSource (source, node) {
    const raw = source.slice(node.start, node.end)
    return dedentSource(raw)
}


export function getApiForFile (source, filePath = null) {
    const parsed = parseSourceFile(source, filePath)

    if (parsed.classes.length === 1) {
        return {
            type: 'class',
            file: filePath,
            ...parsed.classes[0]
        }
    }

    if (parsed.classes.length > 1) {
        return {
            type: 'module',
            file: filePath,
            classes: parsed.classes,
            functions: parsed.functions,
            exports: parsed.exports
        }
    }

    if (parsed.functions.length > 0 || parsed.exports.length > 0) {
        return {
            type: 'module',
            file: filePath,
            functions: parsed.functions,
            exports: parsed.exports
        }
    }

    return null
}
