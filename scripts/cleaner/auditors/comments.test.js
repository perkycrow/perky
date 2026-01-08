import {describe, expect, test} from 'vitest'
import {isUrlComment, cleanFileContent} from './comments.js'


describe('isUrlComment', () => {

    test('detects http URL', () => {
        expect(isUrlComment('const url = "http:')).toBe(true)
    })


    test('detects https URL', () => {
        expect(isUrlComment('const url = "https:')).toBe(true)
    })


    test('does not match regular text', () => {
        expect(isUrlComment('const x = 1')).toBe(false)
        expect(isUrlComment('')).toBe(false)
    })

})


describe('cleanFileContent', () => {

    test('removes single-line comments', () => {
        const content = 'const x = 1 // this is a comment'
        const {result, comments} = cleanFileContent(content)

        expect(result).toBe('const x = 1')
        expect(comments).toHaveLength(1)
        expect(comments[0].type).toBe('single-line')
    })


    test('removes multi-line comments', () => {
        const content = 'const x = 1 /* comment */ + 2'
        const {result, comments} = cleanFileContent(content)

        expect(result).toBe('const x = 1  + 2')
        expect(comments).toHaveLength(1)
        expect(comments[0].type).toBe('multi-line')
    })


    test('preserves eslint directives', () => {
        const content = 'const x = 1 // eslint-disable-line no-unused-vars'
        const {result, comments} = cleanFileContent(content)

        expect(result).toBe(content)
        expect(comments).toHaveLength(0)
    })


    test('preserves comments inside strings', () => {
        const content = 'const x = "hello // world"'
        const {result, comments} = cleanFileContent(content)

        expect(result).toBe(content)
        expect(comments).toHaveLength(0)
    })


    test('preserves comments inside multiline template literals', () => {
        const content = `const shader = \`
    // === Effect ===
    color = vec4(1.0);
    // === End Effect ===\``
        const {result, comments} = cleanFileContent(content)

        expect(result).toBe(content)
        expect(comments).toHaveLength(0)
    })


    test('preserves URL comments', () => {
        const content = 'const url = "https://example.com"'
        const {result, comments} = cleanFileContent(content)

        expect(result).toBe(content)
        expect(comments).toHaveLength(0)
    })


    test('normalizes excessive blank lines', () => {
        const content = 'line1\n\n\n\n\nline2'
        const {result} = cleanFileContent(content)

        expect(result).toBe('line1\n\n\nline2')
    })


    test('removes whitespace-only lines', () => {
        const content = 'line1\n   \nline2'
        const {result} = cleanFileContent(content)

        expect(result).toBe('line1\n\nline2')
    })


    test('handles file with no comments', () => {
        const content = 'const x = 1\nconst y = 2'
        const {result, comments, modified} = cleanFileContent(content)

        expect(result).toBe(content)
        expect(comments).toHaveLength(0)
        expect(modified).toBe(false)
    })


    test('sets modified to true when comments removed', () => {
        const content = 'const x = 1 // comment'
        const {modified} = cleanFileContent(content)

        expect(modified).toBe(true)
    })


    test('removes multiple comments in single pass', () => {
        const content = `function example () {
    const x = 1
    // First comment
    const y = 2

    // Second comment
    const z = 3

    // Third comment
    return x + y + z
}`
        const {result, comments} = cleanFileContent(content)

        expect(comments).toHaveLength(3)
        expect(comments[0].text).toBe('//First comment')
        expect(comments[1].text).toBe('//Second comment')
        expect(comments[2].text).toBe('//Third comment')
        expect(result).not.toContain('// First comment')
        expect(result).not.toContain('// Second comment')
        expect(result).not.toContain('// Third comment')
    })


    test('removes all comments after first comment with slash', () => {
        const content = `const container = document.createElement('div')
container.className = 'filters-container'

// First comment to remove
const searchContainer = document.createElement('div')
searchContainer.className = 'search-container'

// Second comment to remove
const searchBar = document.createElement('input')
searchBar.type = 'text'

// Third comment to remove
const clearButton = document.createElement('button')`

        const {result, comments} = cleanFileContent(content)

        expect(comments).toHaveLength(3)
        expect(result).not.toContain('// First comment')
        expect(result).not.toContain('// Second comment')
        expect(result).not.toContain('// Third comment')
    })

})
