import {describe, test} from 'vitest'
import {RuleTester} from 'eslint'
import nestedComplexity from './nested_complexity.js'


const ruleTester = new RuleTester({
    languageOptions: {
        ecmaVersion: 2022,
        sourceType: 'module'
    }
})


describe('nested-complexity', () => {

    describe('valid cases', () => {

        test('sequence of conditions without nesting = complexity 1', () => {
            ruleTester.run('nested-complexity', nestedComplexity, {
                valid: [{
                    code: `
                        function test(params) {
                            const a = params.a || 'default'
                            const b = params.b || 'default'
                            const c = params.c || 'default'
                            const d = params.d || 'default'
                        }
                    `,
                    options: [4]
                }],
                invalid: []
            })
        })

        test('simple if = complexity 1', () => {
            ruleTester.run('nested-complexity', nestedComplexity, {
                valid: [{
                    code: `
                        function test(a) {
                            if (a) {
                                return true
                            }
                            return false
                        }
                    `,
                    options: [4]
                }],
                invalid: []
            })
        })

        test('two sequential ifs = complexity 1 (not nested)', () => {
            ruleTester.run('nested-complexity', nestedComplexity, {
                valid: [{
                    code: `
                        function test(a, b) {
                            if (a) {
                                return 'a'
                            }
                            if (b) {
                                return 'b'
                            }
                            return 'none'
                        }
                    `,
                    options: [4]
                }],
                invalid: []
            })
        })

        test('nested if = complexity 2', () => {
            ruleTester.run('nested-complexity', nestedComplexity, {
                valid: [{
                    code: `
                        function test(a, b) {
                            if (a) {
                                if (b) {
                                    return true
                                }
                            }
                            return false
                        }
                    `,
                    options: [2]
                }],
                invalid: []
            })
        })

        test('condition with && = complexity 2', () => {
            ruleTester.run('nested-complexity', nestedComplexity, {
                valid: [{
                    code: `
                        function test(a, b) {
                            if (a && b) {
                                return true
                            }
                            return false
                        }
                    `,
                    options: [2]
                }],
                invalid: []
            })
        })

        test('for + if = complexity 2', () => {
            ruleTester.run('nested-complexity', nestedComplexity, {
                valid: [{
                    code: `
                        function test(items) {
                            for (const item of items) {
                                if (item.active) {
                                    return item
                                }
                            }
                        }
                    `,
                    options: [2]
                }],
                invalid: []
            })
        })

        test('condition with || = complexity 2', () => {
            ruleTester.run('nested-complexity', nestedComplexity, {
                valid: [{
                    code: `
                        function test(a, b) {
                            if (a || b) {
                                return true
                            }
                            return false
                        }
                    `,
                    options: [2]
                }],
                invalid: []
            })
        })

        test('condition with ?? = complexity 2', () => {
            ruleTester.run('nested-complexity', nestedComplexity, {
                valid: [{
                    code: `
                        function test(a, b) {
                            if (a ?? b) {
                                return true
                            }
                            return false
                        }
                    `,
                    options: [2]
                }],
                invalid: []
            })
        })

        test('ternary expression = complexity 1', () => {
            ruleTester.run('nested-complexity', nestedComplexity, {
                valid: [{
                    code: `
                        function test(a) {
                            return a ? 'yes' : 'no'
                        }
                    `,
                    options: [1]
                }],
                invalid: []
            })
        })

        test('while loop + if = complexity 2', () => {
            ruleTester.run('nested-complexity', nestedComplexity, {
                valid: [{
                    code: `
                        function test(items) {
                            let i = 0
                            while (i < items.length) {
                                if (items[i].active) {
                                    return items[i]
                                }
                                i++
                            }
                        }
                    `,
                    options: [2]
                }],
                invalid: []
            })
        })

        test('do-while loop + if = complexity 2', () => {
            ruleTester.run('nested-complexity', nestedComplexity, {
                valid: [{
                    code: `
                        function test(items) {
                            let i = 0
                            do {
                                if (items[i].active) {
                                    return items[i]
                                }
                                i++
                            } while (i < items.length)
                        }
                    `,
                    options: [2]
                }],
                invalid: []
            })
        })

        test('try-catch with if = complexity 2', () => {
            ruleTester.run('nested-complexity', nestedComplexity, {
                valid: [{
                    code: `
                        function test(data) {
                            try {
                                return JSON.parse(data)
                            } catch (e) {
                                if (e instanceof SyntaxError) {
                                    return null
                                }
                                throw e
                            }
                        }
                    `,
                    options: [2]
                }],
                invalid: []
            })
        })

        test('for-in loop + if = complexity 2', () => {
            ruleTester.run('nested-complexity', nestedComplexity, {
                valid: [{
                    code: `
                        function test(obj) {
                            for (const key in obj) {
                                if (obj[key]) {
                                    return key
                                }
                            }
                        }
                    `,
                    options: [2]
                }],
                invalid: []
            })
        })

        test('arrow function with nesting', () => {
            ruleTester.run('nested-complexity', nestedComplexity, {
                valid: [{
                    code: `
                        const test = (a, b) => {
                            if (a) {
                                if (b) {
                                    return true
                                }
                            }
                            return false
                        }
                    `,
                    options: [2]
                }],
                invalid: []
            })
        })

        test('function expression with nesting', () => {
            ruleTester.run('nested-complexity', nestedComplexity, {
                valid: [{
                    code: `
                        const test = function(a, b) {
                            if (a) {
                                if (b) {
                                    return true
                                }
                            }
                            return false
                        }
                    `,
                    options: [2]
                }],
                invalid: []
            })
        })

        test('default max depth is 4', () => {
            ruleTester.run('nested-complexity', nestedComplexity, {
                valid: [{
                    code: `
                        function test(a, b, c, d) {
                            if (a) {
                                if (b) {
                                    if (c) {
                                        if (d) {
                                            return true
                                        }
                                    }
                                }
                            }
                        }
                    `
                }],
                invalid: []
            })
        })

    })

    describe('invalid cases', () => {

        test('triple nesting = complexity 3, max 2', () => {
            ruleTester.run('nested-complexity', nestedComplexity, {
                valid: [],
                invalid: [{
                    code: `
                        function test(a, b, c) {
                            if (a) {
                                if (b) {
                                    if (c) {
                                        return true
                                    }
                                }
                            }
                        }
                    `,
                    options: [2],
                    errors: [{
                        message: 'Nested complexity of 3 exceeds maximum allowed of 2.'
                    }]
                }]
            })
        })

        test('for + if + if = complexity 3, max 2', () => {
            ruleTester.run('nested-complexity', nestedComplexity, {
                valid: [],
                invalid: [{
                    code: `
                        function test(items) {
                            for (const item of items) {
                                if (item.active) {
                                    if (item.valid) {
                                        return item
                                    }
                                }
                            }
                        }
                    `,
                    options: [2],
                    errors: [{
                        message: 'Nested complexity of 3 exceeds maximum allowed of 2.'
                    }]
                }]
            })
        })

        test('complex nested condition', () => {
            ruleTester.run('nested-complexity', nestedComplexity, {
                valid: [],
                invalid: [{
                    code: `
                        function test(a, b, c) {
                            if (a && b) {
                                if (c) {
                                    return true
                                }
                            }
                        }
                    `,
                    options: [2],
                    errors: [{
                        message: 'Nested complexity of 3 exceeds maximum allowed of 2.'
                    }]
                }]
            })
        })

        test('switch with nested if', () => {
            ruleTester.run('nested-complexity', nestedComplexity, {
                valid: [],
                invalid: [{
                    code: `
                        function test(type, value) {
                            switch (type) {
                                case 'a':
                                    if (value) {
                                        if (value > 10) {
                                            return true
                                        }
                                    }
                                    break
                            }
                        }
                    `,
                    options: [2],
                    errors: [{
                        message: 'Nested complexity of 3 exceeds maximum allowed of 2.'
                    }]
                }]
            })
        })

        test('nested ternary exceeds max', () => {
            ruleTester.run('nested-complexity', nestedComplexity, {
                valid: [],
                invalid: [{
                    code: `
                        function test(a, b, c) {
                            return a ? (b ? (c ? 1 : 2) : 3) : 4
                        }
                    `,
                    options: [2],
                    errors: [{
                        message: 'Nested complexity of 3 exceeds maximum allowed of 2.'
                    }]
                }]
            })
        })

        test('while with nested while exceeds max', () => {
            ruleTester.run('nested-complexity', nestedComplexity, {
                valid: [],
                invalid: [{
                    code: `
                        function test(matrix) {
                            let i = 0
                            while (i < matrix.length) {
                                let j = 0
                                while (j < matrix[i].length) {
                                    if (matrix[i][j]) {
                                        return [i, j]
                                    }
                                    j++
                                }
                                i++
                            }
                        }
                    `,
                    options: [2],
                    errors: [{
                        message: 'Nested complexity of 3 exceeds maximum allowed of 2.'
                    }]
                }]
            })
        })

        test('arrow function exceeds max', () => {
            ruleTester.run('nested-complexity', nestedComplexity, {
                valid: [],
                invalid: [{
                    code: `
                        const test = (a, b, c) => {
                            if (a) {
                                if (b) {
                                    if (c) {
                                        return true
                                    }
                                }
                            }
                        }
                    `,
                    options: [2],
                    errors: [{
                        message: 'Nested complexity of 3 exceeds maximum allowed of 2.'
                    }]
                }]
            })
        })

        test('default max of 4 is exceeded at 5', () => {
            ruleTester.run('nested-complexity', nestedComplexity, {
                valid: [],
                invalid: [{
                    code: `
                        function test(a, b, c, d, e) {
                            if (a) {
                                if (b) {
                                    if (c) {
                                        if (d) {
                                            if (e) {
                                                return true
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    `,
                    errors: [{
                        message: 'Nested complexity of 5 exceeds maximum allowed of 4.'
                    }]
                }]
            })
        })

    })

})
