import {describe, test, expect} from 'vitest'
import {SMAA_AREA_TEXTURE, SMAA_SEARCH_TEXTURE} from './smaa_lookup_textures.js'


describe('SMAA_AREA_TEXTURE', () => {

    test('is a string', () => {
        expect(typeof SMAA_AREA_TEXTURE).toBe('string')
    })


    test('is a data URL', () => {
        expect(SMAA_AREA_TEXTURE.startsWith('data:image/png;base64,')).toBe(true)
    })


    test('contains base64 encoded data', () => {
        const base64Part = SMAA_AREA_TEXTURE.replace('data:image/png;base64,', '')
        expect(base64Part.length).toBeGreaterThan(0)
    })

})


describe('SMAA_SEARCH_TEXTURE', () => {

    test('is a string', () => {
        expect(typeof SMAA_SEARCH_TEXTURE).toBe('string')
    })


    test('is a data URL', () => {
        expect(SMAA_SEARCH_TEXTURE.startsWith('data:image/png;base64,')).toBe(true)
    })


    test('contains base64 encoded data', () => {
        const base64Part = SMAA_SEARCH_TEXTURE.replace('data:image/png;base64,', '')
        expect(base64Part.length).toBeGreaterThan(0)
    })

})
