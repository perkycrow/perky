import {describe, expect, test} from 'vitest'
import {removeUnusedDirective} from './directives.js'


describe('removeUnusedDirective', () => {

    test('removes inline eslint-disable-line', () => {
        const content = 'const x = 1 // eslint-disable-line no-unused-vars'
        const result = removeUnusedDirective(content, 1)

        expect(result).toBe('const x = 1')
    })


    test('removes standalone eslint-disable-next-line', () => {
        const content = '// eslint-disable-next-line no-unused-vars\nconst x = 1'
        const result = removeUnusedDirective(content, 1)

        expect(result).toBe('const x = 1')
    })


    test('removes block eslint-disable', () => {
        const content = '/* eslint-disable no-unused-vars */\nconst x = 1'
        const result = removeUnusedDirective(content, 1)

        expect(result).toBe('const x = 1')
    })


    test('handles invalid line number', () => {
        const content = 'const x = 1'
        expect(removeUnusedDirective(content, 0)).toBe(content)
        expect(removeUnusedDirective(content, 10)).toBe(content)
    })


    test('preserves content when no directive found', () => {
        const content = 'const x = 1\nconst y = 2'
        const result = removeUnusedDirective(content, 1)

        expect(result).toBe(content)
    })

})
