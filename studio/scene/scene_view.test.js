import {describe, test, expect} from 'vitest'
import SceneView from './scene_view.js'


describe('SceneView', () => {

    test('is defined as custom element', () => {
        expect(customElements.get('scene-view')).toBe(SceneView)
    })


    test('setContext accepts context before connection', () => {
        const view = new SceneView()

        view.setContext({
            manifest: {getAssetsByType: () => [], getSource: () => null},
            textureSystem: {getSpritesheet: () => null, getRegion: () => null},
            studioConfig: {},
            scenes: {level1: {entities: [{type: 'Player', x: 3, y: 5}]}},
            sceneId: 'level1',
            wiring: null
        })

        expect(view).toBeInstanceOf(SceneView)
    })


    test('setContext handles missing sceneId', () => {
        const view = new SceneView()

        view.setContext({
            manifest: {getAssetsByType: () => [], getSource: () => null},
            textureSystem: {getSpritesheet: () => null, getRegion: () => null},
            studioConfig: {},
            scenes: {},
            sceneId: null,
            wiring: null
        })

        expect(view).toBeInstanceOf(SceneView)
    })


    test('setContext handles sceneId not found in scenes', () => {
        const view = new SceneView()

        view.setContext({
            manifest: {getAssetsByType: () => [], getSource: () => null},
            textureSystem: {getSpritesheet: () => null, getRegion: () => null},
            studioConfig: {},
            scenes: {},
            sceneId: 'unknown',
            wiring: null
        })

        expect(view).toBeInstanceOf(SceneView)
    })

})
