import {describe, test, expect} from 'vitest'


describe('discovery', () => {

    test('module exists', async () => {
        const module = await import('./discovery.js')
        expect(module).toBeDefined()
    })

})
