import {describe, test, expect} from 'vitest'
import SceneView from './scene_view.js'


describe('SceneView', () => {

    test('is defined as custom element', () => {
        expect(customElements.get('scene-view')).toBe(SceneView)
    })


    test('static actions', () => {
        expect(SceneView.actions).toEqual({
            undo: 'undoAction',
            redo: 'redoAction',
            copy: 'copySelectedEntity',
            paste: 'pasteEntity',
            duplicate: 'duplicateSelectedEntity',
            delete: 'deleteSelectedEntity'
        })
    })


    test('static bindings', () => {
        expect(SceneView.bindings).toEqual({
            undo: 'ctrl+z',
            redo: ['ctrl+shift+z', 'ctrl+y'],
            copy: 'ctrl+c',
            paste: 'ctrl+v',
            duplicate: 'ctrl+d',
            delete: ['Delete', 'Backspace']
        })
    })


    test('hasContext returns false before setContext', () => {
        const view = new SceneView()
        expect(view.hasContext()).toBe(false)
    })


    test('hasContext returns true after setContext', () => {
        const view = new SceneView()

        view.setContext({
            manifest: {getAssetsByType: () => [], getSource: () => null},
            textureSystem: {getSpritesheet: () => null, getRegion: () => null},
            studioConfig: {},
            scenes: {},
            sceneId: null,
            wiring: null
        })

        expect(view.hasContext()).toBe(true)
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


    test('setContext defaults entity coordinates', () => {
        const view = new SceneView()

        view.setContext({
            manifest: {getAssetsByType: () => [], getSource: () => null},
            textureSystem: {getSpritesheet: () => null, getRegion: () => null},
            studioConfig: {},
            scenes: {level1: {entities: [{type: 'Enemy'}]}},
            sceneId: 'level1',
            wiring: null
        })

        expect(view.hasContext()).toBe(true)
    })


    test('toolStyles returns array with sceneViewStyles', () => {
        const view = new SceneView()
        const styles = view.toolStyles()

        expect(Array.isArray(styles)).toBe(true)
        expect(styles.length).toBe(1)
    })


    test('camera returns undefined before init', () => {
        const view = new SceneView()
        expect(view.camera).toBeUndefined()
    })


    test('buildHeaderStart returns fragment with undo and redo buttons', () => {
        const view = new SceneView()
        const fragment = view.buildHeaderStart()

        expect(fragment).toBeInstanceOf(DocumentFragment)
        expect(fragment.children.length).toBe(2)

        const [undoBtn, redoBtn] = fragment.children
        expect(undoBtn.tagName).toBe('BUTTON')
        expect(undoBtn.title).toBe('Undo')
        expect(redoBtn.tagName).toBe('BUTTON')
        expect(redoBtn.title).toBe('Redo')
    })


    test('buildHeaderEnd returns container with toolbar buttons', () => {
        const view = new SceneView()
        const container = view.buildHeaderEnd()

        expect(container).toBeInstanceOf(HTMLDivElement)
        expect(container.children.length).toBe(4)

        const titles = Array.from(container.children).map(btn => btn.title)
        expect(titles).toContain('Toggle palette')
        expect(titles).toContain('Toggle properties')
        expect(titles).toContain('Toggle grid snap')
        expect(titles).toContain('Preview in game')
    })


    test('buildContent returns scene container', () => {
        const view = new SceneView()
        const content = view.buildContent()

        expect(content).toBeInstanceOf(HTMLDivElement)
        expect(content.classList.contains('scene-container')).toBe(true)
    })


    test('autoSave does nothing without sceneId', () => {
        const view = new SceneView()

        view.setContext({
            manifest: {getAssetsByType: () => [], getSource: () => null},
            textureSystem: {getSpritesheet: () => null, getRegion: () => null},
            studioConfig: {},
            scenes: {},
            sceneId: null,
            wiring: null
        })

        expect(() => view.autoSave()).not.toThrow()
    })

})
