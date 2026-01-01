import {describe, it, expect, beforeEach, afterEach, vi} from 'vitest'
import './devtools_sidebar.js'


describe('DevToolsSidebar', () => {

    let sidebar
    let container


    beforeEach(() => {
        container = document.createElement('div')
        document.body.appendChild(container)

        sidebar = document.createElement('devtools-sidebar')
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


        it('should create sidebar element', () => {
            const sidebarEl = sidebar.shadowRoot.querySelector('.devtools-sidebar')
            expect(sidebarEl).not.toBeNull()
        })


        it('should be hidden by default', () => {
            const sidebarEl = sidebar.shadowRoot.querySelector('.devtools-sidebar')
            expect(sidebarEl.classList.contains('hidden')).toBe(true)
        })


        it('should have a header', () => {
            const header = sidebar.shadowRoot.querySelector('.sidebar-header')
            expect(header).not.toBeNull()
        })


        it('should have a close button', () => {
            const closeBtn = sidebar.shadowRoot.querySelector('.sidebar-close')
            expect(closeBtn).not.toBeNull()
        })


        it('should have a content area', () => {
            const content = sidebar.shadowRoot.querySelector('.sidebar-content')
            expect(content).not.toBeNull()
        })

    })


    describe('setState', () => {

        it('should accept state object', () => {
            const state = {
                addEventListener: vi.fn(),
                sidebarOpen: false,
                activeTool: null
            }
            expect(() => sidebar.setState(state)).not.toThrow()
        })


        it('should register event listeners', () => {
            const state = {
                addEventListener: vi.fn(),
                sidebarOpen: false,
                activeTool: null
            }
            sidebar.setState(state)

            expect(state.addEventListener).toHaveBeenCalledWith('tool:change', expect.any(Function))
            expect(state.addEventListener).toHaveBeenCalledWith('sidebar:open', expect.any(Function))
            expect(state.addEventListener).toHaveBeenCalledWith('sidebar:close', expect.any(Function))
        })

    })


    describe('close button', () => {

        it('should call closeSidebar on state when clicked', () => {
            const state = {
                addEventListener: vi.fn(),
                sidebarOpen: false,
                activeTool: null,
                closeSidebar: vi.fn()
            }
            sidebar.setState(state)

            const closeBtn = sidebar.shadowRoot.querySelector('.sidebar-close')
            closeBtn.click()

            expect(state.closeSidebar).toHaveBeenCalled()
        })

    })


    describe('title', () => {

        it('should have title icon element', () => {
            const titleIcon = sidebar.shadowRoot.querySelector('.sidebar-title-icon')
            expect(titleIcon).not.toBeNull()
        })


        it('should have title text element', () => {
            const title = sidebar.shadowRoot.querySelector('.sidebar-title')
            expect(title).not.toBeNull()
        })

    })

})
