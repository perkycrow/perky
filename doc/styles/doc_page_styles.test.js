import {describe, test, expect} from 'vitest'
import {DOC_PAGE_STYLES} from './doc_page_styles.js'


describe('doc_page_styles', () => {

    test('exports styles string', () => {
        expect(typeof DOC_PAGE_STYLES).toBe('string')
    })


    test('contains essential class definitions', () => {
        expect(DOC_PAGE_STYLES).toContain('.doc-page')
        expect(DOC_PAGE_STYLES).toContain('.doc-header')
        expect(DOC_PAGE_STYLES).toContain('.doc-content')
    })

})
