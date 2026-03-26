import {describe, test, expect} from 'vitest'
import SceneView from './scene_view.js'
import Application from '../../application/application.js'


describe('SceneView', () => {

    test('extends Application', () => {
        expect(SceneView.prototype).toBeInstanceOf(Application)
    })


    test('setContext accepts context', () => {
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

})
