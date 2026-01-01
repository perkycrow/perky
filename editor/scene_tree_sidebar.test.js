import {describe, it, expect, beforeEach, afterEach, vi} from 'vitest'
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

        it('should extend HTMLElement', () => {
            expect(sidebar).toBeInstanceOf(HTMLElement)
        })


        it('should have shadow DOM', () => {
            expect(sidebar.shadowRoot).not.toBeNull()
        })


        it('should have header', () => {
            const header = sidebar.shadowRoot.querySelector('.panel-header')
            expect(header).not.toBeNull()
        })


        it('should have tree container', () => {
            const tree = sidebar.shadowRoot.querySelector('.panel-tree')
            expect(tree).not.toBeNull()
        })


        it('should have details panel', () => {
            const details = sidebar.shadowRoot.querySelector('.panel-details')
            expect(details).not.toBeNull()
        })

    })


    describe('setContent', () => {

        it('should set the content', () => {
            const content = createMockContainer()
            sidebar.setContent(content)
            expect(sidebar.getContent()).toBe(content)
        })


        it('should accept worldRenderer as second parameter', () => {
            const content = createMockContainer()
            const worldRenderer = createMockWorldRenderer()
            sidebar.setContent(content, worldRenderer)
            expect(sidebar.getContent()).toBe(content)
        })


        it('should show root node when content is set', () => {
            const content = createMockContainer()
            sidebar.setContent(content)

            const rootNode = sidebar.shadowRoot.querySelector('scene-tree-node')
            expect(rootNode.style.display).not.toBe('none')
        })


        it('should hide root node when content is null', () => {
            sidebar.setContent(createMockContainer())
            sidebar.setContent(null)

            const rootNode = sidebar.shadowRoot.querySelector('scene-tree-node')
            expect(rootNode.style.display).toBe('none')
        })

    })


    describe('getContent', () => {

        it('should return null when no content set', () => {
            expect(sidebar.getContent()).toBeNull()
        })


        it('should return the set content', () => {
            const content = createMockContainer()
            sidebar.setContent(content)
            expect(sidebar.getContent()).toBe(content)
        })

    })


    describe('close', () => {

        it('should emit sidebar:close event', () => {
            const handler = vi.fn()
            sidebar.addEventListener('sidebar:close', handler)

            sidebar.close()

            expect(handler).toHaveBeenCalled()
        })

    })


    describe('refresh', () => {

        it('should not throw when no content', () => {
            expect(() => sidebar.refresh()).not.toThrow()
        })


        it('should update tree when content is set', () => {
            const content = createMockContainer()
            sidebar.setContent(content)

            expect(() => sidebar.refresh()).not.toThrow()
        })

    })


    describe('header buttons', () => {

        it('should have refresh button', () => {
            const buttons = sidebar.shadowRoot.querySelectorAll('.panel-btn')
            const refreshBtn = Array.from(buttons).find(b => b.textContent === '↻')
            expect(refreshBtn).not.toBeNull()
        })


        it('should have close button', () => {
            const buttons = sidebar.shadowRoot.querySelectorAll('.panel-btn')
            const closeBtn = Array.from(buttons).find(b => b.textContent === '✕')
            expect(closeBtn).not.toBeNull()
        })


        it('should call close when close button clicked', () => {
            const handler = vi.fn()
            sidebar.addEventListener('sidebar:close', handler)

            const buttons = sidebar.shadowRoot.querySelectorAll('.panel-btn')
            const closeBtn = Array.from(buttons).find(b => b.textContent === '✕')
            closeBtn.click()

            expect(handler).toHaveBeenCalled()
        })

    })


    describe('navigate:entity event', () => {

        it('should bubble navigate:entity events from tree', () => {
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
