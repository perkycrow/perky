import {describe, it, expect} from 'vitest'
import {RuleTester} from 'eslint'
import rule from './class_methods_use_this.js'


const ruleTester = new RuleTester({
    languageOptions: {
        ecmaVersion: 2022,
        sourceType: 'module'
    }
})


describe('class-methods-use-this', () => {
    it('should pass valid cases and fail invalid cases', () => {
        expect(() => {
            ruleTester.run('class-methods-use-this', rule, {
                valid: [
                    {
                        code: 'class A { foo() { return this.bar } }'
                    },
                    {
                        code: 'class A { foo() { } }'
                    },
                    {
                        code: 'class A { constructor() { console.log("init") } }'
                    },
                    {
                        code: 'class A { static foo() { return 42 } }'
                    },
                    {
                        code: 'class A { onInit() { } onDestroy() { } }'
                    },
                    {
                        code: 'class A { foo() { return 42 } }',
                        options: [{exceptMethods: ['foo']}]
                    }
                ],

                invalid: [
                    {
                        code: 'class A { foo() { return 42 } }',
                        errors: [{message: "Expected 'this' to be used by class method 'foo'."}]
                    },
                    {
                        code: 'class A { foo() { console.log("test") } }',
                        errors: [{message: "Expected 'this' to be used by class method 'foo'."}]
                    }
                ]
            })
        }).not.toThrow()
    })
})
