import {test, expect, beforeEach, afterEach, vi} from 'vitest'
import AssetBrowserView from './asset_browser_view.js'


if (typeof globalThis.ImageBitmap === 'undefined') {
    globalThis.ImageBitmap = class ImageBitmap {}
}


let view
let container


beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    view = document.createElement('asset-browser-view')
    container.appendChild(view)
})


afterEach(() => {
    container.remove()
})


test('AssetBrowserView', () => {
    expect(AssetBrowserView).toBeDefined()
    expect(view).toBeInstanceOf(AssetBrowserView)
})


test('constructor', () => {
    expect(view.appLayout).not.toBeNull()
})


test('hasContext false by default', () => {
    expect(view.hasContext()).toBe(false)
})


test('listActions', () => {
    expect(view.listActions()).toEqual([])
})


test('setContext', () => {
    const mockManifest = {listAssets: vi.fn(() => [])}
    expect(() => view.setContext({manifest: mockManifest, textureSystem: {}})).not.toThrow()
})


test('init does not throw', () => {
    expect(() => view.init()).not.toThrow()
})


test('init renders assets when context set', () => {
    view.buildContent()
    const mockManifest = {
        listAssets: vi.fn(() => [{id: 'test', type: 'image'}]),
        getSource: vi.fn(() => null)
    }
    view.setContext({manifest: mockManifest, textureSystem: {}})
    view.init()
    expect(mockManifest.listAssets).toHaveBeenCalled()
})


test('toolStyles returns array with stylesheet', () => {
    const styles = view.toolStyles()
    expect(Array.isArray(styles)).toBe(true)
    expect(styles.length).toBe(1)
})


test('buildContent returns container element', () => {
    const content = view.buildContent()
    expect(content).toBeInstanceOf(HTMLElement)
    expect(content.classList.contains('browser-container')).toBe(true)
})


test('buildContent creates search input and grid', () => {
    const content = view.buildContent()
    const searchInput = content.querySelector('.search-input')
    const grid = content.querySelector('.asset-grid')
    expect(searchInput).not.toBeNull()
    expect(grid).not.toBeNull()
})
