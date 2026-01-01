import {describe, expect, test} from 'vitest'
import {hasJsExtension} from './imports.js'


describe('hasJsExtension', () => {

    test('detects .js extension', () => {
        expect(hasJsExtension('./utils.js')).toBe(true)
        expect(hasJsExtension('../core/module.js')).toBe(true)
    })


    test('detects .json extension', () => {
        expect(hasJsExtension('./config.json')).toBe(true)
        expect(hasJsExtension('../data/settings.json')).toBe(true)
    })


    test('detects .css extension', () => {
        expect(hasJsExtension('./styles.css')).toBe(true)
        expect(hasJsExtension('../ui/theme.css')).toBe(true)
    })


    test('returns false for paths without extension', () => {
        expect(hasJsExtension('./utils')).toBe(false)
        expect(hasJsExtension('../core/module')).toBe(false)
    })


    test('returns false for other extensions', () => {
        expect(hasJsExtension('./file.ts')).toBe(false)
        expect(hasJsExtension('./file.jsx')).toBe(false)
        expect(hasJsExtension('./file.mjs')).toBe(false)
    })

})
