import * as acorn from 'acorn'
import Auditor from '../auditor.js'
import {gray} from '../../format.js'


const MIN_OPERATIONS = 1

const SUPPORTED_PROPS = new Set([
    'className', 'id', 'textContent', 'innerHTML', 'style',
    'href', 'src', 'alt', 'title', 'value', 'type', 'name', 'placeholder'
])
const SUPPORTED_METHODS = new Set(['setAttribute'])


export default class DomUtilsUsageAuditor extends Auditor {

    static $name = 'DOM Utils Usage'
    static $category = 'dom_utils_usage'
    static $canFix = false
    static $hint = `Refactor with dom_utils.js:

    // Before
    const el = document.createElement('div')
    el.className = 'container'
    el.id = 'main'
    el.style.left = '10px'
    el.setAttribute('data-x', '1')

    // After
    import {createElement} from 'application/dom_utils.js'
    const el = createElement('div', {
        class: 'container',
        id: 'main',
        style: {left: '10px'},
        attrs: {'data-x': '1'}
    })`

    analyze (content) { // eslint-disable-line local/class-methods-use-this -- clean
        const ast = parseContent(content)

        if (!ast) {
            return []
        }

        return findVerbosePatterns(ast)
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


function findVerbosePatterns (ast) {
    const issues = []

    for (let i = 0; i < ast.body.length; i++) {
        const node = ast.body[i]

        const createResult = checkCreateElementSequence(ast.body, i)
        if (createResult) {
            issues.push(createResult.issue)
            i += createResult.skip
            continue
        }

        const setAttrResult = checkSetAttributeSequence(ast.body, i)
        if (setAttrResult) {
            issues.push(setAttrResult.issue)
            i += setAttrResult.skip
            continue
        }

        issues.push(...scanNodeBody(node))
    }

    return issues
}


function scanNodeBody (node) {
    if (node.type === 'ExportDefaultDeclaration' && node.declaration?.type === 'ClassDeclaration') {
        return scanClassBody(node.declaration.body)
    }

    if (node.type === 'ClassDeclaration') {
        return scanClassBody(node.body)
    }

    if (node.type === 'FunctionDeclaration' && node.body?.body) {
        return scanBlockStatements(node.body.body)
    }

    return []
}


function scanClassBody (classBody) {
    const issues = []

    for (const member of classBody.body) {
        if (member.type === 'MethodDefinition' && member.value?.body?.body) {
            issues.push(...scanBlockStatements(member.value.body.body))
        }
    }

    return issues
}


function scanBlockStatements (statements) {
    const issues = []

    for (let i = 0; i < statements.length; i++) {
        const result = checkCreateElementSequence(statements, i)
        if (result) {
            issues.push(result.issue)
            i += result.skip
            continue
        }

        const setAttrResult = checkSetAttributeSequence(statements, i)
        if (setAttrResult) {
            issues.push(setAttrResult.issue)
            i += setAttrResult.skip
            continue
        }

        issues.push(...scanNestedBlocks(statements[i]))
    }

    return issues
}


const LOOP_TYPES = new Set(['ForStatement', 'ForOfStatement', 'ForInStatement', 'WhileStatement'])


function scanNestedBlocks (node) {
    if (node.type === 'IfStatement') {
        return scanIfStatement(node)
    }

    if (LOOP_TYPES.has(node.type) && node.body?.body) {
        return scanBlockStatements(node.body.body)
    }

    return []
}


function scanIfStatement (node) {
    const issues = []

    if (node.consequent?.body) {
        issues.push(...scanBlockStatements(node.consequent.body))
    }
    if (node.alternate?.body) {
        issues.push(...scanBlockStatements(node.alternate.body))
    }

    return issues
}


function checkCreateElementSequence (statements, startIndex) {
    const node = statements[startIndex]
    const createInfo = extractCreateElementInfo(node)

    if (!createInfo) {
        return null
    }

    const {targetName, initNode} = createInfo
    const {supportedOps, totalOps} = collectOperations(statements, startIndex, targetName)

    if (supportedOps.length >= MIN_OPERATIONS) {
        const line = node.loc.start.line
        const opList = supportedOps.join(', ')
        const issue = `${gray(`L${line}:`)} createElement('${getTagName(initNode)}') + ${supportedOps.length} ops: ${opList}`
        return {issue, skip: totalOps}
    }

    return null
}


function extractCreateElementInfo (node) {
    if (node.type === 'VariableDeclaration') {
        return extractFromVariableDeclaration(node)
    }

    if (node.type === 'ExpressionStatement' && node.expression.type === 'AssignmentExpression') {
        return extractFromAssignment(node.expression)
    }

    return null
}


function extractFromVariableDeclaration (node) {
    const declarator = node.declarations[0]

    if (!declarator || declarator.id.type !== 'Identifier') {
        return null
    }

    if (!isDocumentCreateElement(declarator.init)) {
        return null
    }

    return {targetName: declarator.id.name, initNode: declarator.init}
}


function extractFromAssignment (expr) {
    if (!isDocumentCreateElement(expr.right)) {
        return null
    }

    const targetName = getTargetString(expr.left)
    if (!targetName) {
        return null
    }

    return {targetName, initNode: expr.right}
}


function collectOperations (statements, startIndex, targetName) {
    const supportedOps = []
    let totalOps = 0

    for (let j = startIndex + 1; j < statements.length; j++) {
        const nextNode = statements[j]
        const op = getOperationOnTarget(nextNode, targetName)

        if (!op) {
            break
        }

        totalOps++
        if (op.supported) {
            supportedOps.push(op.name)
        }
    }

    return {supportedOps, totalOps}
}


function checkSetAttributeSequence (statements, startIndex) {
    const node = statements[startIndex]

    if (!isSetAttributeCall(node)) {
        return null
    }

    const targetName = getCallTarget(node)
    if (!targetName) {
        return null
    }

    const line = node.loc.start.line
    const attrs = [getAttributeName(node)]
    let count = 1

    for (let j = startIndex + 1; j < statements.length; j++) {
        const nextNode = statements[j]

        if (isSetAttributeCall(nextNode) && getCallTarget(nextNode) === targetName) {
            attrs.push(getAttributeName(nextNode))
            count++
        } else {
            break
        }
    }

    if (count >= MIN_OPERATIONS) {
        const issue = `${gray(`L${line}:`)} ${targetName}.setAttribute() x${count}: ${attrs.join(', ')}`
        return {issue, skip: count - 1}
    }

    return null
}


function isDocumentCreateElement (node) {
    if (!node || node.type !== 'CallExpression') {
        return false
    }

    const callee = node.callee
    if (callee.type !== 'MemberExpression') {
        return false
    }

    const obj = callee.object
    const prop = callee.property

    return obj.type === 'Identifier' &&
           obj.name === 'document' &&
           prop.type === 'Identifier' &&
           prop.name === 'createElement'
}


function getTagName (callNode) {
    const arg = callNode.arguments[0]
    if (arg?.type === 'Literal') {
        return arg.value
    }
    return '?'
}


function getOperationOnTarget (node, targetName) {
    if (node.type !== 'ExpressionStatement') {
        return null
    }

    const expr = node.expression
    return getAssignmentOp(expr, targetName) || getCallOp(expr, targetName)
}


function getAssignmentOp (expr, targetName) {
    if (expr.type !== 'AssignmentExpression' || expr.left.type !== 'MemberExpression') {
        return null
    }

    const obj = expr.left.object


    if (getTargetString(obj) === targetName) {
        const prop = expr.left.property
        const propName = prop.type === 'Identifier' ? prop.name : '?'
        return {name: `.${propName}`, supported: SUPPORTED_PROPS.has(propName)}
    }


    if (obj.type === 'MemberExpression' &&
        getTargetString(obj.object) === targetName &&
        obj.property.type === 'Identifier' &&
        obj.property.name === 'style') {
        const styleProp = expr.left.property
        const propName = styleProp.type === 'Identifier' ? styleProp.name : '?'
        return {name: `.style.${propName}`, supported: true}
    }

    return null
}


function getCallOp (expr, targetName) {
    if (expr.type !== 'CallExpression' || expr.callee.type !== 'MemberExpression') {
        return null
    }

    const obj = expr.callee.object
    if (getTargetString(obj) !== targetName) {
        return null
    }

    const prop = expr.callee.property
    const methodName = prop.type === 'Identifier' ? prop.name : '?'
    return {name: `.${methodName}()`, supported: SUPPORTED_METHODS.has(methodName)}
}


function isSetAttributeCall (node) {
    if (node.type !== 'ExpressionStatement') {
        return false
    }

    const expr = node.expression
    if (expr.type !== 'CallExpression' || expr.callee.type !== 'MemberExpression') {
        return false
    }

    const prop = expr.callee.property
    return prop.type === 'Identifier' && prop.name === 'setAttribute'
}


function getCallTarget (node) {
    const obj = node.expression.callee.object

    if (obj.type === 'Identifier') {
        return obj.name
    }

    if (obj.type === 'MemberExpression' && obj.object.type === 'ThisExpression') {
        const prop = obj.property
        return `this.${prop.type === 'Identifier' ? prop.name : '?'}`
    }

    return null
}


function getAttributeName (node) {
    const arg = node.expression.arguments[0]
    if (arg?.type === 'Literal') {
        return arg.value
    }
    return '?'
}


function getTargetString (node) {
    if (node.type === 'Identifier') {
        return node.name
    }

    if (node.type === 'MemberExpression' && node.object.type === 'ThisExpression') {
        const prop = node.property
        if (prop.type === 'PrivateIdentifier') {
            return `this.#${prop.name}`
        }
        if (prop.type === 'Identifier') {
            return `this.${prop.name}`
        }
    }

    return null
}
