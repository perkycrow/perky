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

    test('reports nested complexity correctly', () => {
        ruleTester.run('nested-complexity', nestedComplexity, {
            valid: [

                // Sequence of conditions without nesting = complexity 1
                {
                    code: `
                        function test(params) {
                            const a = params.a || 'default'
                            const b = params.b || 'default'
                            const c = params.c || 'default'
                            const d = params.d || 'default'
                        }
                    `,
                    options: [4]
                },

                // Simple if = complexity 1
                {
                    code: `
                        function test(a) {
                            if (a) {
                                return true
                            }
                            return false
                        }
                    `,
                    options: [4]
                },

                // Two sequential ifs = complexity 1 (not nested)
                {
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
                },

                // Nested if = complexity 2
                {
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
                },

                // Condition with && = complexity 2
                {
                    code: `
                        function test(a, b) {
                            if (a && b) {
                                return true
                            }
                            return false
                        }
                    `,
                    options: [2]
                },

                // for + if = complexity 2
                {
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
                }
            ],

            invalid: [

                // Triple nesting = complexity 3, max 2
                {
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
                },

                // for + if + if = complexity 3, max 2
                {
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
                },

                // Complex nested condition
                {
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
                },

                // Switch with nested if
                {
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
                }
            ]
        })
    })

})
