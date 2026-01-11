import * as acorn from 'acorn'
import Auditor from '../auditor.js'
import {gray} from '../format.js'


export default class PrivacyAuditor extends Auditor {

    static $name = 'Privacy'
    static $category = 'privacy'
    static $canFix = false
    static $hint = 'Use # for real privacy, extract to module-level function, or just remove the _'

    analyze (content) { // eslint-disable-line local/class-methods-use-this -- clean
        const ast = parseContent(content)

        if (!ast) {
            return []
        }

        return findUnderscoreMembers(ast)
    }


    formatIssue (issue) { // eslint-disable-line local/class-methods-use-this -- clean
        return `${gray(`L${issue.line}:`)} ${issue.type}: ${issue.name}`
    }

}


function parseContent (content) {
    try {
        return acorn.parse(content, {
            ecmaVersion: 'latest',
            sourceType: 'module',
            locations: true
        })
    } catch {
        return null
    }
}


function isUnderscorePrivate (name) {
    return name && name.startsWith('_') && !name.startsWith('__')
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


function checkClassMember (node, seen, issues) {
    if (node.type !== 'PropertyDefinition' && node.type !== 'MethodDefinition') {
        return
    }

    const name = node.key?.type === 'Identifier' ? node.key.name : null
    if (!isUnderscorePrivate(name)) {
        return
    }

    const key = `${node.loc.start.line}:${name}`
    if (seen.has(key)) {
        return
    }

    seen.add(key)
    issues.push({
        line: node.loc.start.line,
        type: node.type === 'MethodDefinition' ? 'method' : 'property',
        name
    })
}


function getThisPropertyName (node) {
    if (node.type !== 'AssignmentExpression') {
        return null
    }

    const left = node.left
    const isThisProperty = left?.type === 'MemberExpression' &&
        left.object?.type === 'ThisExpression' &&
        left.property?.type === 'Identifier'

    return isThisProperty ? left.property.name : null
}


function checkThisAssignment (node, seen, issues) {
    const name = getThisPropertyName(node)
    if (!isUnderscorePrivate(name)) {
        return
    }

    const key = `${node.loc.start.line}:${name}`
    if (seen.has(key)) {
        return
    }

    seen.add(key)
    issues.push({
        line: node.loc.start.line,
        type: 'this-property',
        name: `this.${name}`
    })
}


function findUnderscoreMembers (ast) {
    const issues = []
    const seen = new Set()

    walkNode(ast, (node) => {
        checkClassMember(node, seen, issues)
        checkThisAssignment(node, seen, issues)
    })

    return issues
}
