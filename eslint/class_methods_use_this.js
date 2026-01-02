function isMethodEmpty (node) {
    const body = node.value?.body

    return body && body.type === 'BlockStatement' && body.body.length === 0
}


export default {
    meta: {
        type: 'suggestion',
        docs: {
            description: 'Enforce that class methods use this, except for empty methods',
            category: 'Best Practices',
            recommended: false
        },
        schema: [{
            type: 'object',
            properties: {
                exceptMethods: {
                    type: 'array',
                    items: {type: 'string'}
                }
            },
            additionalProperties: false
        }]
    },

    create (context) {
        const options = context.options[0] || {}
        const exceptMethods = new Set(options.exceptMethods || [])
        let currentMethodState = null

        function markThisUsed () {
            if (currentMethodState) {
                currentMethodState.usesThis = true
            }
        }

        return {
            MethodDefinition (node) {
                if (node.static || node.kind === 'constructor') {
                    currentMethodState = null

                    return
                }

                currentMethodState = {usesThis: false}
            },

            ThisExpression: markThisUsed,
            Super: markThisUsed,

            'MethodDefinition:exit' (node) {
                if (!currentMethodState) {
                    return
                }

                const methodName = node.key.name || node.key.value

                if (exceptMethods.has(methodName)) {
                    currentMethodState = null

                    return
                }

                if (isMethodEmpty(node)) {
                    currentMethodState = null

                    return
                }

                if (!currentMethodState.usesThis) {
                    context.report({
                        node,
                        message: "Expected 'this' to be used by class method '{{name}}'.",
                        data: {name: methodName}
                    })
                }

                currentMethodState = null
            }
        }
    }
}
