import {test, expect, beforeEach, afterEach} from 'vitest'
import './asset_browser_view.js'


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


test('constructor', () => {
    expect(view.appLayout).not.toBeNull()
})


test('hasContext false by default', () => {
    expect(view.hasContext()).toBe(false)
})


test('listActions', () => {
    expect(view.listActions()).toEqual([])
})
