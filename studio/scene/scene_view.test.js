import {describe, test, expect} from 'vitest'
import SceneView from './scene_view.js'


describe('SceneView', () => {

    test('is defined as custom element', () => {
        expect(customElements.get('scene-view')).toBe(SceneView)
    })

})
