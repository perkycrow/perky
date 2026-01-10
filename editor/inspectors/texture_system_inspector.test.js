import {describe, test, expect, beforeEach, afterEach} from 'vitest'
import TextureSystemInspector from './texture_system_inspector.js'
import TextureSystem from '../../render/textures/texture_system.js'


class MockAtlas {

    constructor (options = {}) {
        this.width = options.width ?? 512
        this.height = options.height ?? 512
        this.regionCount = options.regionCount ?? 0
        this.canvas = options.canvas ?? null
        this.regions = options.regions ?? new Map()
    }


    getAllRegions () {
        return this.regions
    }

}


class MockTextureSystem {

    constructor (options = {}) {
        this.atlasesData = options.atlases ?? []
        this.regionCountData = options.regionCount ?? 0
    }


    get atlases () {
        return this.atlasesData
    }


    get regionCount () {
        return this.regionCountData
    }

}


describe('TextureSystemInspector', () => {

    let inspector
    let container


    beforeEach(() => {
        container = document.createElement('div')
        document.body.appendChild(container)

        inspector = document.createElement('texture-system-inspector')
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


    describe('static matches', () => {

        test('matches method exists', () => {
            expect(typeof TextureSystemInspector.matches).toBe('function')
        })


        test('returns true for TextureSystem instance', () => {
            const textureSystem = new TextureSystem()
            expect(TextureSystemInspector.matches(textureSystem)).toBe(true)
        })


        test('returns false for non-TextureSystem', () => {
            expect(TextureSystemInspector.matches({})).toBe(false)
            expect(TextureSystemInspector.matches(null)).toBe(false)
        })

    })


    describe('setModule', () => {

        test('stores the module', () => {
            const module = new MockTextureSystem()
            inspector.setModule(module)
            expect(inspector.getModule()).toBe(module)
        })


        test('displays stats section when module is set', () => {
            const module = new MockTextureSystem({
                atlases: [new MockAtlas()],
                regionCount: 5
            })
            inspector.setModule(module)

            const statsGrid = inspector.shadowRoot.querySelector('.stats-grid')
            expect(statsGrid).not.toBeNull()
        })

    })


    describe('stats section', () => {

        test('shows atlas count', () => {
            const module = new MockTextureSystem({
                atlases: [new MockAtlas(), new MockAtlas()],
                regionCount: 0
            })
            inspector.setModule(module)

            const values = inspector.shadowRoot.querySelectorAll('.stat-value')
            const hasTwo = Array.from(values).some(v => v.textContent === '2')
            expect(hasTwo).toBe(true)
        })


        test('shows region count', () => {
            const module = new MockTextureSystem({
                atlases: [],
                regionCount: 15
            })
            inspector.setModule(module)

            const values = inspector.shadowRoot.querySelectorAll('.stat-value')
            const hasFifteen = Array.from(values).some(v => v.textContent === '15')
            expect(hasFifteen).toBe(true)
        })


        test('shows memory usage', () => {
            const module = new MockTextureSystem({
                atlases: [new MockAtlas({width: 512, height: 512})],
                regionCount: 0
            })
            inspector.setModule(module)

            const values = inspector.shadowRoot.querySelectorAll('.stat-value')
            const hasMemory = Array.from(values).some(v => v.textContent.includes('MB'))
            expect(hasMemory).toBe(true)
        })


        test('calculates memory correctly for multiple atlases', () => {
            const module = new MockTextureSystem({
                atlases: [
                    new MockAtlas({width: 1024, height: 1024}),
                    new MockAtlas({width: 512, height: 512})
                ],
                regionCount: 0
            })
            inspector.setModule(module)

            const values = inspector.shadowRoot.querySelectorAll('.stat-value')
            const memoryValue = Array.from(values).find(v => v.textContent.includes('MB'))
            expect(memoryValue).not.toBeNull()
        })

    })


    describe('atlases section', () => {

        test('shows empty message when no atlases', () => {
            const module = new MockTextureSystem({atlases: [], regionCount: 0})
            inspector.setModule(module)

            const emptyMessage = inspector.shadowRoot.querySelector('.empty-message')
            expect(emptyMessage).not.toBeNull()
            expect(emptyMessage.textContent).toContain('No atlases')
        })


        test('creates atlas cards for each atlas', () => {
            const module = new MockTextureSystem({
                atlases: [new MockAtlas(), new MockAtlas(), new MockAtlas()],
                regionCount: 0
            })
            inspector.setModule(module)

            const cards = inspector.shadowRoot.querySelectorAll('.atlas-card')
            expect(cards.length).toBe(3)
        })


        test('shows atlas dimensions', () => {
            const module = new MockTextureSystem({
                atlases: [new MockAtlas({width: 1024, height: 2048})],
                regionCount: 0
            })
            inspector.setModule(module)

            const badges = inspector.shadowRoot.querySelectorAll('.atlas-badge')
            const dimensionBadge = Array.from(badges).find(b => b.textContent.includes('×'))
            expect(dimensionBadge.textContent).toContain('1024')
            expect(dimensionBadge.textContent).toContain('2048')
        })


        test('shows region count per atlas', () => {
            const module = new MockTextureSystem({
                atlases: [new MockAtlas({regionCount: 42})],
                regionCount: 42
            })
            inspector.setModule(module)

            const badges = inspector.shadowRoot.querySelectorAll('.atlas-badge')
            const regionBadge = Array.from(badges).find(b => b.textContent.includes('regions'))
            expect(regionBadge.textContent).toContain('42')
        })

    })


    describe('atlas card interaction', () => {

        test('atlas header is clickable', () => {
            const module = new MockTextureSystem({
                atlases: [new MockAtlas()],
                regionCount: 0
            })
            inspector.setModule(module)

            const header = inspector.shadowRoot.querySelector('.atlas-header')
            expect(header).not.toBeNull()
        })


        test('clicking header toggles content visibility', () => {
            const module = new MockTextureSystem({
                atlases: [new MockAtlas()],
                regionCount: 0
            })
            inspector.setModule(module)

            const header = inspector.shadowRoot.querySelector('.atlas-header')
            const content = inspector.shadowRoot.querySelector('.atlas-content')
            const toggle = inspector.shadowRoot.querySelector('.atlas-toggle')

            expect(content.classList.contains('collapsed')).toBe(false)

            header.click()

            expect(content.classList.contains('collapsed')).toBe(true)
            expect(toggle.classList.contains('collapsed')).toBe(true)
        })


        test('clicking header again expands content', () => {
            const module = new MockTextureSystem({
                atlases: [new MockAtlas()],
                regionCount: 0
            })
            inspector.setModule(module)

            const header = inspector.shadowRoot.querySelector('.atlas-header')
            const content = inspector.shadowRoot.querySelector('.atlas-content')

            header.click()
            header.click()

            expect(content.classList.contains('collapsed')).toBe(false)
        })

    })


    describe('regions list', () => {

        test('displays regions in atlas', () => {
            const regions = new Map([
                ['sprite1', {width: 32, height: 32}],
                ['sprite2', {width: 64, height: 64}]
            ])
            const module = new MockTextureSystem({
                atlases: [new MockAtlas({regions})],
                regionCount: 2
            })
            inspector.setModule(module)

            const tags = inspector.shadowRoot.querySelectorAll('.region-tag')
            expect(tags.length).toBe(2)
        })


        test('shows region dimensions', () => {
            const regions = new Map([
                ['mySprite', {width: 128, height: 256}]
            ])
            const module = new MockTextureSystem({
                atlases: [new MockAtlas({regions})],
                regionCount: 1
            })
            inspector.setModule(module)

            const sizeSpan = inspector.shadowRoot.querySelector('.region-size')
            expect(sizeSpan.textContent).toContain('128')
            expect(sizeSpan.textContent).toContain('256')
        })

    })


    describe('section toggle', () => {

        test('section header is clickable', () => {
            const module = new MockTextureSystem({
                atlases: [new MockAtlas()],
                regionCount: 0
            })
            inspector.setModule(module)

            const header = inspector.shadowRoot.querySelector('.section-header')
            expect(header).not.toBeNull()
        })


        test('clicking section header toggles visibility', () => {
            const module = new MockTextureSystem({
                atlases: [new MockAtlas()],
                regionCount: 0
            })
            inspector.setModule(module)

            const header = inspector.shadowRoot.querySelector('.section-header')
            const content = inspector.shadowRoot.querySelector('.section-content')

            header.click()

            expect(content.classList.contains('collapsed')).toBe(true)
        })

    })


    describe('canvas preview', () => {

        test('shows canvas preview when atlas has canvas', () => {
            const canvas = document.createElement('canvas')
            canvas.width = 256
            canvas.height = 256

            const module = new MockTextureSystem({
                atlases: [new MockAtlas({canvas})],
                regionCount: 0
            })
            inspector.setModule(module)

            const preview = inspector.shadowRoot.querySelector('.atlas-preview')
            const displayCanvas = preview.querySelector('canvas')
            expect(displayCanvas).not.toBeNull()
        })


        test('no canvas when atlas has no canvas', () => {
            const module = new MockTextureSystem({
                atlases: [new MockAtlas({canvas: null})],
                regionCount: 0
            })
            inspector.setModule(module)

            const preview = inspector.shadowRoot.querySelector('.atlas-preview')
            const displayCanvas = preview.querySelector('canvas')
            expect(displayCanvas).toBeNull()
        })

    })


    describe('module changes', () => {

        test('updates when module changes', () => {
            const module1 = new MockTextureSystem({
                atlases: [new MockAtlas()],
                regionCount: 5
            })
            inspector.setModule(module1)

            const module2 = new MockTextureSystem({
                atlases: [new MockAtlas(), new MockAtlas()],
                regionCount: 10
            })
            inspector.setModule(module2)

            const cards = inspector.shadowRoot.querySelectorAll('.atlas-card')
            expect(cards.length).toBe(2)
        })


        test('clears previous content when module changes', () => {
            const module1 = new MockTextureSystem({
                atlases: [new MockAtlas(), new MockAtlas(), new MockAtlas()],
                regionCount: 0
            })
            inspector.setModule(module1)

            const module2 = new MockTextureSystem({
                atlases: [new MockAtlas()],
                regionCount: 0
            })
            inspector.setModule(module2)

            const cards = inspector.shadowRoot.querySelectorAll('.atlas-card')
            expect(cards.length).toBe(1)
        })

    })

})
