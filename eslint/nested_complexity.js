const COMPLEXITY_NODES = new Set([
    'IfStatement',
    'ConditionalExpression',
    'SwitchCase',
    'ForStatement',
    'ForInStatement',
    'ForOfStatement',
    'WhileStatement',
    'DoWhileStatement',
    'CatchClause'
])

const LOGICAL_OPERATORS = new Set(['&&', '||', '??'])

function isLogicalExpression (node) {
    return node.type === 'LogicalExpression' && LOGICAL_OPERATORS.has(node.operator)
}


function countLogicalDepth (node, depth = 0) {
    if (!isLogicalExpression(node)) {
        return depth
    }

    const leftDepth = countLogicalDepth(node.left, depth + 1)
    const rightDepth = countLogicalDepth(node.right, depth + 1)

    return Math.max(leftDepth, rightDepth)
}


function getConditionDepth (node) {
    const condition = getCondition(node)

    if (condition && isLogicalExpression(condition)) {
        return countLogicalDepth(condition)
    }

    return 1
}


const NODES_WITH_TEST_CONDITION = new Set([
    'IfStatement',
    'ConditionalExpression',
    'WhileStatement',
    'DoWhileStatement',
    'ForStatement'
])


function getCondition (node) {
    return NODES_WITH_TEST_CONDITION.has(node.type) ? node.test : null
}


export default {
    meta: {
        type: 'suggestion',
        docs: {
            description: 'Measures complexity by path depth rather than cumulative count',
            category: 'Best Practices',
            recommended: false
        },
        schema: [{
            type: 'integer',
            minimum: 1,
            default: 4
        }]
    },

    create (context) {
        const maxDepth = context.options[0] || 4
        const functionStack = []

        function enterFunction () {
            functionStack.push({
                maxComplexity: 0,
                currentDepth: 0
            })
        }

        function exitFunction (node) {
            const state = functionStack.pop()

            if (state && state.maxComplexity > maxDepth) {
                context.report({
                    node,
                    message: 'Nested complexity of {{complexity}} exceeds maximum allowed of {{max}}.',
                    data: {
                        complexity: state.maxComplexity,
                        max: maxDepth
                    }
                })
            }
        }

        function enterComplexityNode (node) {
            if (functionStack.length === 0) {
                return
            }

            const state = functionStack[functionStack.length - 1]
            const conditionDepth = getConditionDepth(node)

            state.currentDepth += conditionDepth
            state.maxComplexity = Math.max(state.maxComplexity, state.currentDepth)
        }

        function exitComplexityNode () {
            if (functionStack.length === 0) {
                return
            }

            const state = functionStack[functionStack.length - 1]

            state.currentDepth -= 1
        }

        const visitors = {
            FunctionDeclaration: enterFunction,
            FunctionExpression: enterFunction,
            ArrowFunctionExpression: enterFunction,
            'FunctionDeclaration:exit': exitFunction,
            'FunctionExpression:exit': exitFunction,
            'ArrowFunctionExpression:exit': exitFunction
        }

        for (const nodeType of COMPLEXITY_NODES) {
            visitors[nodeType] = enterComplexityNode
            visitors[`${nodeType}:exit`] = exitComplexityNode
        }

        return visitors
    }
}
