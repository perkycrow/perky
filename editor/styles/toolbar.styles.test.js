import {describe, test, expect} from 'vitest'
import {toolbarStyles, toolbarStylesRaw} from './toolbar.styles.js'


describe('toolbarStyles', () => {

    test('exports a stylesheet', () => {
        expect(toolbarStyles).toBeInstanceOf(CSSStyleSheet)
    })

    test('toolbarStylesRaw is a string', () => {
        expect(typeof toolbarStylesRaw).toBe('string')
    })

})
