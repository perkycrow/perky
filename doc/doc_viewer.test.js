import {describe, test, expect} from 'vitest'


describe('doc_viewer', () => {

    test('module exists', async () => {
        const module = await import('./doc_viewer.js')
        expect(module).toBeDefined()
    })

})
