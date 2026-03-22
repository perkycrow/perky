import {describe, test, expect} from 'vitest'
import {toolbarStyles} from './toolbar.styles.js'


describe('toolbarStyles', () => {

    test('exports a stylesheet', () => {
        expect(toolbarStyles).toBeDefined()
    })

})
