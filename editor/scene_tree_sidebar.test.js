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

        test('should extend HTMLElement', () => {
            expect(sidebar).toBeInstanceOf(HTMLElement)
        })


        test('should have shadow DOM', () => {
            expect(sidebar.shadowRoot).not.toBeNull()
        })


        test('should have header', () => {
            const header = sidebar.shadowRoot.querySelector('.panel-header')
            expect(header).not.toBeNull()
        })


        test('should have tree container', () => {
            const tree = sidebar.shadowRoot.querySelector('.panel-tree')
            expect(tree).not.toBeNull()
        })


        test('should have details panel', () => {
            const details = sidebar.shadowRoot.querySelector('.panel-details')
            expect(details).not.toBeNull()
        })

    })


    describe('setContent', () => {

        test('should set the content', () => {
            const content = createMockContainer()
            sidebar.setContent(content)
            expect(sidebar.getContent()).toBe(content)
        })


        test('should accept worldRenderer as second parameter', () => {
            const content = createMockContainer()
            const worldRenderer = createMockWorldRenderer()
            sidebar.setContent(content, worldRenderer)
            expect(sidebar.getContent()).toBe(content)
        })


        test('should show root node when content is set', () => {
            const content = createMockContainer()
            sidebar.setContent(content)

            const rootNode = sidebar.shadowRoot.querySelector('scene-tree-node')
            expect(rootNode.style.display).not.toBe('none')
        })


        test('should hide root node when content is null', () => {
            sidebar.setContent(createMockContainer())
            sidebar.setContent(null)

            const rootNode = sidebar.shadowRoot.querySelector('scene-tree-node')
            expect(rootNode.style.display).toBe('none')
        })

    })


    describe('getContent', () => {

        test('should return null when no content set', () => {
            expect(sidebar.getContent()).toBeNull()
        })


        test('should return the set content', () => {
            const content = createMockContainer()
            sidebar.setContent(content)
            expect(sidebar.getContent()).toBe(content)
        })

    })


    test('close should emit sidebar:close event', () => {
        const handler = vi.fn()
        sidebar.addEventListener('sidebar:close', handler)

        sidebar.close()

        expect(handler).toHaveBeenCalled()
    })


    describe('refresh', () => {

        test('should not throw when no content', () => {
            expect(() => sidebar.refresh()).not.toThrow()
        })


        test('should update tree when content is set', () => {
            const content = createMockContainer()
            sidebar.setContent(content)

            expect(() => sidebar.refresh()).not.toThrow()
        })

    })


    describe('header buttons', () => {

        test('should have refresh button', () => {
            const buttons = sidebar.shadowRoot.querySelectorAll('.panel-btn')
            const refreshBtn = Array.from(buttons).find(b => b.textContent === '↻')
            expect(refreshBtn).not.toBeNull()
        })


        test('should have close button', () => {
            const buttons = sidebar.shadowRoot.querySelectorAll('.panel-btn')
            const closeBtn = Array.from(buttons).find(b => b.textContent === '✕')
            expect(closeBtn).not.toBeNull()
        })


        test('should call close when close button clicked', () => {
            const handler = vi.fn()
            sidebar.addEventListener('sidebar:close', handler)

            const buttons = sidebar.shadowRoot.querySelectorAll('.panel-btn')
            const closeBtn = Array.from(buttons).find(b => b.textContent === '✕')
            closeBtn.click()

            expect(handler).toHaveBeenCalled()
        })

    })


    test('navigate:entity event should bubble navigate:entity events from tree', () => {
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
