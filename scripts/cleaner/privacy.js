import fs from 'fs'
import path from 'path'
import * as acorn from 'acorn'
import {findJsFiles} from './utils.js'
import {header, success, hint, listItem, divider, gray} from './format.js'


const EXCLUDED_PATTERNS = [
    /^scripts\/cleaner\//
]


function isExcludedForPrivacy (relativePath) {
    return EXCLUDED_PATTERNS.some(pattern => pattern.test(relativePath))
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


function scanFiles (rootDir) {
    const files = findJsFiles(rootDir)
    const filesWithIssues = []
    let totalIssues = 0

    for (const filePath of files) {
        const relativePath = path.relative(rootDir, filePath)

        if (isExcludedForPrivacy(relativePath)) {
            continue
        }

        const content = fs.readFileSync(filePath, 'utf-8')
        const ast = parseContent(content)

        if (!ast) {
            continue
        }

        const issues = findUnderscoreMembers(ast)

        if (issues.length > 0) {
            filesWithIssues.push({path: relativePath, issues})
            totalIssues += issues.length
        }
    }

    return {filesWithIssues, totalIssues}
}


function printResults (filesWithIssues) {
    for (const file of filesWithIssues) {
        listItem(file.path, file.issues.length)
        for (const issue of file.issues) {
            console.log(`      ${gray(`L${issue.line}:`)} ${issue.type}: ${issue.name}`)
        }
    }
}


export function auditPrivacy (rootDir) {
    header('Underscore Privacy Convention')

    const {filesWithIssues, totalIssues} = scanFiles(rootDir)

    if (filesWithIssues.length === 0) {
        success('No underscore-prefixed members found')
        return {issueCount: 0}
    }

    hint('Use # for real privacy, extract to module-level function, or just remove the _')
    divider()
    printResults(filesWithIssues)

    return {issueCount: totalIssues}
}
