import {RuleTester} from 'eslint'
import nestedComplexity from './nested_complexity.js'


const ruleTester = new RuleTester({
    languageOptions: {
        ecmaVersion: 2022,
        sourceType: 'module'
    }
})

const tests = [
    {code: 'function f(a) { if (a) {} }', name: 'if (a)'},
    {code: 'function f(a, b) { if (a && b) {} }', name: 'if (a && b)'},
    {code: 'function f(a, b, c) { if (a && b && c) {} }', name: 'if (a && b && c)'},
    {code: 'function f(a, b, c) { if (a && (b && c)) {} }', name: 'if (a && (b && c))'},
    {code: 'function f(a, b) { if (a) { if (b) {} } }', name: 'nested if'}
]

for (const {code, name} of tests) {
    let complexity = 1
    while (complexity <= 10) {
        try {
            ruleTester.run('test', nestedComplexity, {
                valid: [{code, options: [complexity]}],
                invalid: []
            })
            break
        } catch (e) {
            complexity++
        }
    }
    console.log(`${name}: complexity = ${complexity}`)
}
