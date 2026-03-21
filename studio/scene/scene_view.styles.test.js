import {describe, test, expect} from 'vitest'
import {sceneViewStyles} from './scene_view.styles.js'


describe('sceneViewStyles', () => {

    test('exports a stylesheet', () => {
        expect(sceneViewStyles).toBeDefined()
    })

})
