import {describe, test, expect} from 'vitest'


describe('generate_pages', () => {

    test('module exists', async () => {
        const module = await import('./generate_pages.js')
        expect(module).toBeDefined()
    })

})
