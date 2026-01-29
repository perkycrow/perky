import {describe, test, expect} from 'vitest'
import {applyOverrides} from './manifest_patcher.js'


describe('applyOverrides', () => {

    test('injects source into matching assets', () => {
        const manifestData = {
            config: {name: 'Test'},
            assets: {
                redAnimator: {type: 'animator', url: './red.json'},
                redSpritesheet: {type: 'spritesheet', url: './red_sheet.json'}
            }
        }

        const overrides = [
            {id: 'redAnimator', source: {spritesheet: 'redSpritesheet', animations: {}}},
            {id: 'redSpritesheet', source: {data: {frames: []}, images: []}}
        ]

        const result = applyOverrides(manifestData, overrides)

        expect(result.assets.redAnimator.source).toEqual({spritesheet: 'redSpritesheet', animations: {}})
        expect(result.assets.redSpritesheet.source).toEqual({data: {frames: []}, images: []})
    })


    test('preserves existing asset properties', () => {
        const manifestData = {
            assets: {
                redAnimator: {type: 'animator', url: './red.json', config: {foo: true}}
            }
        }

        const overrides = [{id: 'redAnimator', source: {animations: {}}}]
        const result = applyOverrides(manifestData, overrides)

        expect(result.assets.redAnimator.type).toBe('animator')
        expect(result.assets.redAnimator.url).toBe('./red.json')
        expect(result.assets.redAnimator.config).toEqual({foo: true})
        expect(result.assets.redAnimator.source).toEqual({animations: {}})
    })


    test('does not modify the original manifest data', () => {
        const manifestData = {
            config: {name: 'Test'},
            assets: {
                redAnimator: {type: 'animator', url: './red.json'}
            }
        }

        const overrides = [{id: 'redAnimator', source: {animations: {}}}]
        applyOverrides(manifestData, overrides)

        expect(manifestData.assets.redAnimator.source).toBeUndefined()
    })


    test('ignores overrides for non-existing assets', () => {
        const manifestData = {
            assets: {
                redAnimator: {type: 'animator', url: './red.json'}
            }
        }

        const overrides = [
            {id: 'blueAnimator', source: {animations: {}}}
        ]

        const result = applyOverrides(manifestData, overrides)

        expect(result.assets.blueAnimator).toBeUndefined()
        expect(result.assets.redAnimator.source).toBeUndefined()
    })


    test('preserves config and other top-level manifest fields', () => {
        const manifestData = {
            config: {name: 'Test', audio: {volume: 1}},
            assets: {
                redAnimator: {type: 'animator', url: './red.json'}
            }
        }

        const overrides = [{id: 'redAnimator', source: {animations: {}}}]
        const result = applyOverrides(manifestData, overrides)

        expect(result.config).toEqual({name: 'Test', audio: {volume: 1}})
    })


    test('handles empty overrides', () => {
        const manifestData = {
            assets: {redAnimator: {type: 'animator', url: './red.json'}}
        }

        const result = applyOverrides(manifestData, [])

        expect(result.assets.redAnimator).toEqual({type: 'animator', url: './red.json'})
    })

})


