import {describe, test, expect, beforeEach, afterEach} from 'vitest'
import ManifestInspector from './manifest_inspector.js'


class MockManifest {

    constructor (config = {}, assets = []) {
        this._config = config
        this._assets = assets
    }


    getConfig () {
        return this._config
    }


    getAllAssets () {
        return this._assets
    }

}


describe('ManifestInspector', () => {

    let inspector
    let container


    beforeEach(() => {
        container = document.createElement('div')
        document.body.appendChild(container)

        inspector = document.createElement('manifest-inspector')
        container.appendChild(inspector)
    })


    afterEach(() => {
        container.remove()
    })


    describe('initialization', () => {

        test('extends HTMLElement', () => {
            expect(inspector).toBeInstanceOf(HTMLElement)
        })


        test('has shadow DOM', () => {
            expect(inspector.shadowRoot).not.toBeNull()
        })

    })


    describe('matches', () => {

        test('static matches method exists', () => {
            expect(typeof ManifestInspector.matches).toBe('function')
        })

    })


    describe('setModule', () => {

        test('stores the module', () => {
            const module = new MockManifest()
            inspector.setModule(module)
            expect(inspector.getModule()).toBe(module)
        })


        test('renders config and assets sections', () => {
            const module = new MockManifest({title: 'Game'}, [])
            inspector.setModule(module)

            const sections = inspector.shadowRoot.querySelectorAll('.section')
            expect(sections.length).toBe(2)
        })

    })


    describe('config section', () => {

        test('shows config section header', () => {
            const module = new MockManifest({}, [])
            inspector.setModule(module)

            const titles = inspector.shadowRoot.querySelectorAll('.section-title')
            const hasConfig = Array.from(titles).some(t => t.textContent.includes('Config'))
            expect(hasConfig).toBe(true)
        })


        test('shows config entry count', () => {
            const config = {title: 'Game', version: '1.0', author: 'Test'}
            const module = new MockManifest(config, [])
            inspector.setModule(module)

            const counts = inspector.shadowRoot.querySelectorAll('.section-count')
            const hasCount = Array.from(counts).some(c => c.textContent === '3')
            expect(hasCount).toBe(true)
        })


        test('shows empty message when no config', () => {
            const module = new MockManifest({}, [])
            inspector.setModule(module)

            const empty = inspector.shadowRoot.querySelector('.empty-message')
            expect(empty).not.toBeNull()
            expect(empty.textContent).toBe('No config defined')
        })


        test('renders config key-value pairs', () => {
            const config = {title: 'My Game'}
            const module = new MockManifest(config, [])
            inspector.setModule(module)

            const keys = inspector.shadowRoot.querySelectorAll('.data-key')
            const values = inspector.shadowRoot.querySelectorAll('.data-value')

            const hasTitle = Array.from(keys).some(k => k.textContent === 'title')
            const hasValue = Array.from(values).some(v => v.textContent === 'My Game')

            expect(hasTitle).toBe(true)
            expect(hasValue).toBe(true)
        })


        test('renders nested config objects', () => {
            const config = {
                display: {width: 800, height: 600}
            }
            const module = new MockManifest(config, [])
            inspector.setModule(module)

            const keys = inspector.shadowRoot.querySelectorAll('.data-key')
            const hasWidth = Array.from(keys).some(k => k.textContent === 'width')
            expect(hasWidth).toBe(true)
        })

    })


    describe('assets section', () => {

        test('shows assets section header', () => {
            const module = new MockManifest({}, [])
            inspector.setModule(module)

            const titles = inspector.shadowRoot.querySelectorAll('.section-title')
            const hasAssets = Array.from(titles).some(t => t.textContent.includes('Assets'))
            expect(hasAssets).toBe(true)
        })


        test('shows asset count', () => {
            const assets = [
                {id: 'a1', type: 'texture'},
                {id: 'a2', type: 'texture'}
            ]
            const module = new MockManifest({}, assets)
            inspector.setModule(module)

            const counts = inspector.shadowRoot.querySelectorAll('.section-count')
            const hasCount = Array.from(counts).some(c => c.textContent === '2')
            expect(hasCount).toBe(true)
        })


        test('shows empty message when no assets', () => {
            const module = new MockManifest({}, [])
            inspector.setModule(module)

            const emptyMessages = inspector.shadowRoot.querySelectorAll('.empty-message')
            const hasAssetEmpty = Array.from(emptyMessages).some(
                e => e.textContent === 'No assets defined'
            )
            expect(hasAssetEmpty).toBe(true)
        })


        test('groups assets by type', () => {
            const assets = [
                {id: 'img1', type: 'texture'},
                {id: 'img2', type: 'texture'},
                {id: 'snd1', type: 'audio'}
            ]
            const module = new MockManifest({}, assets)
            inspector.setModule(module)

            const groups = inspector.shadowRoot.querySelectorAll('.asset-type-group')
            expect(groups.length).toBe(2)
        })


        test('shows type header with count', () => {
            const assets = [
                {id: 'img1', type: 'texture'},
                {id: 'img2', type: 'texture'}
            ]
            const module = new MockManifest({}, assets)
            inspector.setModule(module)

            const header = inspector.shadowRoot.querySelector('.asset-type-header')
            expect(header).not.toBeNull()
            expect(header.textContent).toContain('texture')
            expect(header.textContent).toContain('2')
        })


        test('renders asset cards', () => {
            const assets = [{id: 'player', type: 'texture', name: 'Player Sprite'}]
            const module = new MockManifest({}, assets)
            inspector.setModule(module)

            const card = inspector.shadowRoot.querySelector('.asset-card')
            expect(card).not.toBeNull()
        })


        test('shows asset name', () => {
            const assets = [{id: 'player', type: 'texture', name: 'Player Sprite'}]
            const module = new MockManifest({}, assets)
            inspector.setModule(module)

            const name = inspector.shadowRoot.querySelector('.asset-name')
            expect(name.textContent).toBe('Player Sprite')
        })


        test('falls back to id when no name', () => {
            const assets = [{id: 'player-sprite', type: 'texture'}]
            const module = new MockManifest({}, assets)
            inspector.setModule(module)

            const name = inspector.shadowRoot.querySelector('.asset-name')
            expect(name.textContent).toBe('player-sprite')
        })


        test('shows type badge', () => {
            const assets = [{id: 'a', type: 'audio'}]
            const module = new MockManifest({}, assets)
            inspector.setModule(module)

            const badge = inspector.shadowRoot.querySelector('.asset-type-badge')
            expect(badge).not.toBeNull()
            expect(badge.textContent).toBe('audio')
        })


        test('renders asset tags', () => {
            const assets = [{id: 'a', type: 'texture', tags: ['ui', 'menu']}]
            const module = new MockManifest({}, assets)
            inspector.setModule(module)

            const tags = inspector.shadowRoot.querySelectorAll('.asset-tag')
            expect(tags.length).toBe(2)
            expect(tags[0].textContent).toBe('ui')
            expect(tags[1].textContent).toBe('menu')
        })

    })


    describe('section collapse', () => {

        test('clicking section header toggles collapse', () => {
            const module = new MockManifest({title: 'Game'}, [])
            inspector.setModule(module)

            const header = inspector.shadowRoot.querySelector('.section-header')
            const content = inspector.shadowRoot.querySelector('.section-content')

            expect(content.classList.contains('collapsed')).toBe(false)

            header.click()

            expect(content.classList.contains('collapsed')).toBe(true)
        })


        test('toggle icon rotates when collapsed', () => {
            const module = new MockManifest({title: 'Game'}, [])
            inspector.setModule(module)

            const header = inspector.shadowRoot.querySelector('.section-header')
            const toggle = inspector.shadowRoot.querySelector('.section-toggle')

            expect(toggle.classList.contains('collapsed')).toBe(false)

            header.click()

            expect(toggle.classList.contains('collapsed')).toBe(true)
        })

    })

})
