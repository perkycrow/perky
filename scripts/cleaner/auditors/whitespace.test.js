import {describe, expect, test} from 'vitest'
import {
    fixTrailingWhitespace,
    fixEofNewline,
    analyzeLineBreaks,
    fixLineBreaks,
    processContent
} from './whitespace.js'


describe('fixTrailingWhitespace', () => {

    test('removes trailing spaces', () => {
        const content = 'const x = 1   \nconst y = 2  '
        const {result, modified} = fixTrailingWhitespace(content)

        expect(result).toBe('const x = 1\nconst y = 2')
        expect(modified).toBe(true)
    })


    test('removes trailing tabs', () => {
        const content = 'const x = 1\t\t\nconst y = 2'
        const {result, modified} = fixTrailingWhitespace(content)

        expect(result).toBe('const x = 1\nconst y = 2')
        expect(modified).toBe(true)
    })


    test('does not modify content without trailing whitespace', () => {
        const content = 'const x = 1\nconst y = 2'
        const {result, modified} = fixTrailingWhitespace(content)

        expect(result).toBe(content)
        expect(modified).toBe(false)
    })


    test('preserves indentation', () => {
        const content = '    const x = 1  \n        const y = 2'
        const {result} = fixTrailingWhitespace(content)

        expect(result).toBe('    const x = 1\n        const y = 2')
    })

})


describe('fixEofNewline', () => {

    test('adds missing EOF newline', () => {
        const content = 'const x = 1'
        const {result, modified} = fixEofNewline(content)

        expect(result).toBe('const x = 1\n')
        expect(modified).toBe(true)
    })


    test('removes extra EOF newlines', () => {
        const content = 'const x = 1\n\n\n'
        const {result, modified} = fixEofNewline(content)

        expect(result).toBe('const x = 1\n')
        expect(modified).toBe(true)
    })


    test('does not modify content with single EOF newline', () => {
        const content = 'const x = 1\n'
        const {result, modified} = fixEofNewline(content)

        expect(result).toBe(content)
        expect(modified).toBe(false)
    })

})


describe('analyzeLineBreaks', () => {

    test('detects wrong gap after imports', () => {
        const content = `import foo from './foo.js'

function bar () {}
`
        const adjustments = analyzeLineBreaks(content)

        expect(adjustments).toHaveLength(1)
        expect(adjustments[0].context).toBe('after imports')
        expect(adjustments[0].currentGap).toBe(1)
        expect(adjustments[0].expectedGap).toBe(2)
    })


    test('accepts correct gap after imports', () => {
        const content = `import foo from './foo.js'


function bar () {}
`
        const adjustments = analyzeLineBreaks(content)

        expect(adjustments).toHaveLength(0)
    })


    test('detects wrong gap between functions', () => {
        const content = `function foo () {}

function bar () {}
`
        const adjustments = analyzeLineBreaks(content)

        expect(adjustments).toHaveLength(1)
        expect(adjustments[0].context).toBe('between function and function')
        expect(adjustments[0].currentGap).toBe(1)
        expect(adjustments[0].expectedGap).toBe(2)
    })


    test('detects wrong gap after class opening', () => {
        const content = `class Foo {


    bar () {}

}
`
        const adjustments = analyzeLineBreaks(content)

        expect(adjustments.some(a => a.context === 'after class opening')).toBe(true)
    })


    test('detects wrong gap before class closing', () => {
        const content = `class Foo {

    bar () {}


}
`
        const adjustments = analyzeLineBreaks(content)

        expect(adjustments.some(a => a.context === 'before class closing')).toBe(true)
    })


    test('detects wrong gap between methods', () => {
        const content = `class Foo {

    bar () {}

    baz () {}

}
`
        const adjustments = analyzeLineBreaks(content)

        expect(adjustments.some(a => a.context === 'between methods')).toBe(true)
    })


    test('handles parse errors gracefully', () => {
        const content = 'this is not valid javascript {'
        const adjustments = analyzeLineBreaks(content)

        expect(adjustments).toEqual([])
    })

})


describe('fixLineBreaks', () => {

    test('adds missing blank lines', () => {
        const content = 'line1\nline3'
        const adjustments = [{
            afterLine: 1,
            beforeLine: 2,
            currentGap: 0,
            expectedGap: 2,
            context: 'test'
        }]

        const {result, modified} = fixLineBreaks(content, adjustments)

        expect(result).toBe('line1\n\n\nline3')
        expect(modified).toBe(true)
    })


    test('removes extra blank lines', () => {
        const content = 'line1\n\n\n\n\nline6'
        const adjustments = [{
            afterLine: 1,
            beforeLine: 6,
            currentGap: 4,
            expectedGap: 2,
            context: 'test'
        }]

        const {result} = fixLineBreaks(content, adjustments)

        expect(result).toBe('line1\n\n\nline6')
    })


    test('returns unchanged content when no adjustments', () => {
        const content = 'line1\nline2'
        const {result, modified} = fixLineBreaks(content, [])

        expect(result).toBe(content)
        expect(modified).toBe(false)
    })

})


describe('processContent', () => {

    test('combines all fixes', () => {
        const content = 'const x = 1  '
        const {result, modified, issues} = processContent(content)

        expect(result).toBe('const x = 1\n')
        expect(modified).toBe(true)
        expect(issues).toContain('trailing whitespace')
        expect(issues).toContain('EOF newline')
    })


    test('returns unmodified for clean content', () => {
        const content = 'const x = 1\n'
        const {result, modified, issues} = processContent(content)

        expect(result).toBe(content)
        expect(modified).toBe(false)
        expect(issues).toHaveLength(0)
    })

})
