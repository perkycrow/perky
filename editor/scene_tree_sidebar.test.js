import {describe, test, expect, beforeEach, afterEach, vi} from 'vitest'
import './scene_tree_sidebar.js'


describe('SceneTreeSidebar', () => {

    let sidebar
    let container


    beforeEach(() => {
        container = document.createElement('div')
        document.body.appendChild(container)

        sidebar = document.createElement('scene-tree-sidebar')
        container.appendChild(sidebar)
    })


    afterEach(() => {
        container.remove()
    })


    describe('initialization', () => {

        test('extends HTMLElement', () => {
            expect(sidebar).toBeInstanceOf(HTMLElement)
        })


        test('has shadow DOM', () => {
            expect(sidebar.shadowRoot).not.toBeNull()
        })


        test('has header', () => {
            const header = sidebar.shadowRoot.querySelector('.panel-header')
            expect(header).not.toBeNull()
        })


        test('has tree container', () => {
            const tree = sidebar.shadowRoot.querySelector('.panel-tree')
            expect(tree).not.toBeNull()
        })


        test('has details panel', () => {
            const details = sidebar.shadowRoot.querySelector('.panel-details')
            expect(details).not.toBeNull()
        })

    })


    describe('setContent', () => {

        test('sets the content', () => {
            const content = createMockContainer()
            sidebar.setContent(content)
            expect(sidebar.getContent()).toBe(content)
        })


        test('accepts worldRenderer as second parameter', () => {
            const content = createMockContainer()
            const worldRenderer = createMockWorldRenderer()
            sidebar.setContent(content, worldRenderer)
            expect(sidebar.getContent()).toBe(content)
        })


        test('shows root node when content is set', () => {
            const content = createMockContainer()
            sidebar.setContent(content)

            const rootNode = sidebar.shadowRoot.querySelector('scene-tree-node')
            expect(rootNode.style.display).not.toBe('none')
        })


        test('hides root node when content is null', () => {
            sidebar.setContent(createMockContainer())
            sidebar.setContent(null)

            const rootNode = sidebar.shadowRoot.querySelector('scene-tree-node')
            expect(rootNode.style.display).toBe('none')
        })

    })


    describe('getContent', () => {

        test('returns null when no content set', () => {
            expect(sidebar.getContent()).toBeNull()
        })


        test('returns the set content', () => {
            const content = createMockContainer()
            sidebar.setContent(content)
            expect(sidebar.getContent()).toBe(content)
        })

    })


    test('close emits sidebar:close event', () => {
        const handler = vi.fn()
        sidebar.addEventListener('sidebar:close', handler)

        sidebar.close()

        expect(handler).toHaveBeenCalled()
    })


    describe('refresh', () => {

        test('does not throw when no content', () => {
            expect(() => sidebar.refresh()).not.toThrow()
        })


        test('updates tree when content is set', () => {
            const content = createMockContainer()
            sidebar.setContent(content)

            expect(() => sidebar.refresh()).not.toThrow()
        })

    })


    describe('header buttons', () => {

        test('has refresh button', () => {
            const buttons = sidebar.shadowRoot.querySelectorAll('.panel-btn')
            const refreshBtn = Array.from(buttons).find(b => b.textContent === '↻')
            expect(refreshBtn).not.toBeNull()
        })


        test('has close button', () => {
            const buttons = sidebar.shadowRoot.querySelectorAll('.panel-btn')
            const closeBtn = Array.from(buttons).find(b => b.textContent === '✕')
            expect(closeBtn).not.toBeNull()
        })


        test('calls close when close button clicked', () => {
            const handler = vi.fn()
            sidebar.addEventListener('sidebar:close', handler)

            const buttons = sidebar.shadowRoot.querySelectorAll('.panel-btn')
            const closeBtn = Array.from(buttons).find(b => b.textContent === '✕')
            closeBtn.click()

            expect(handler).toHaveBeenCalled()
        })

    })


    test('navigate:entity event bubbles navigate:entity events from tree', () => {
        const handler = vi.fn()
        sidebar.addEventListener('navigate:entity', handler)

        const rootNode = sidebar.shadowRoot.querySelector('scene-tree-node')
        rootNode.dispatchEvent(new CustomEvent('navigate:entity', {
            bubbles: true,
            composed: true,
            detail: {entity: {$id: 'test'}}
        }))

        expect(handler).toHaveBeenCalled()
    })

})


function createMockContainer () {
    return {
        x: 0,
        y: 0,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        children: []
    }
}


function createMockWorldRenderer () {
    return {
        on: vi.fn(),
        off: vi.fn()
    }
}
