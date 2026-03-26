import {test, expect, beforeEach} from 'vitest'
import AssetBrowserView from './asset_browser_view.js'


let view


beforeEach(() => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    view = new AssetBrowserView()
    view.mount(container)
    view.start()
})


test('constructor', () => {
    expect(view.appLayout).not.toBeNull()
})


test('listActions', () => {
    expect(view.listActions()).toEqual([])
})
