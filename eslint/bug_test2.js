import {RuleTester} from 'eslint'
import nestedComplexity from './nested_complexity.js'


const ruleTester = new RuleTester({
    languageOptions: {
        ecmaVersion: 2022,
        sourceType: 'module'
    }
})

const tests = [
    {
        code: `function f(a, b, c, d, e, f) {
            if (a && (b && c)) {}
            if (d && (e && f)) {}
        }`,
        name: 'Two sequential nested logicals - should be 2 each'
    }
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
