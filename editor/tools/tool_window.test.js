import {describe, test, expect, beforeEach, afterEach, vi} from 'vitest'
import ToolWindow from './tool_window.js'


describe('ToolWindow', () => {

    let toolWindow
    let container


    beforeEach(() => {
        container = document.createElement('div')
        document.body.appendChild(container)

        toolWindow = document.createElement('tool-window')
        container.appendChild(toolWindow)
    })


    afterEach(() => {
        container.remove()
    })


    describe('initialization', () => {

        test('should extend HTMLElement', () => {
            expect(toolWindow).toBeInstanceOf(HTMLElement)
        })


        test('should have shadow DOM', () => {
            expect(toolWindow.shadowRoot).not.toBeNull()
        })


        test('should have header element', () => {
            const header = toolWindow.shadowRoot.querySelector('.tool-window-header')
            expect(header).not.toBeNull()
        })


        test('should have content element', () => {
            const content = toolWindow.shadowRoot.querySelector('.tool-window-content')
            expect(content).not.toBeNull()
        })


        test('should have close button', () => {
            const closeBtn = toolWindow.shadowRoot.querySelector('.tool-window-close')
            expect(closeBtn).not.toBeNull()
        })


        test('should have resize handle', () => {
            const handle = toolWindow.shadowRoot.querySelector('.tool-window-resize')
            expect(handle).not.toBeNull()
        })

    })


    describe('setTitle', () => {

        test('should update the title text', () => {
            toolWindow.setTitle('My Tool')
            const titleEl = toolWindow.shadowRoot.querySelector('.tool-window-title')
            expect(titleEl.textContent).toBe('My Tool')
        })

    })


    describe('setPosition', () => {

        test('should update left and top styles', () => {
            toolWindow.setPosition(100, 200)
            expect(toolWindow.style.left).toBe('100px')
            expect(toolWindow.style.top).toBe('200px')
        })

    })


    describe('setSize', () => {

        test('should update width and height styles', () => {
            toolWindow.setSize(500, 400)
            expect(toolWindow.style.width).toBe('500px')
            expect(toolWindow.style.height).toBe('400px')
        })

    })


    describe('setResizable', () => {

        test('should show resize handle when true', () => {
            toolWindow.setResizable(true)
            const handle = toolWindow.shadowRoot.querySelector('.tool-window-resize')
            expect(handle.style.display).not.toBe('none')
        })


        test('should hide resize handle when false', () => {
            toolWindow.setResizable(false)
            const handle = toolWindow.shadowRoot.querySelector('.tool-window-resize')
            expect(handle.style.display).toBe('none')
        })

    })


    describe('close', () => {

        test('should dispatch close event', () => {
            const closeSpy = vi.fn()
            toolWindow.addEventListener('close', closeSpy)
            toolWindow.close()
            expect(closeSpy).toHaveBeenCalled()
        })


        test('should remove element from DOM', () => {
            toolWindow.close()
            expect(toolWindow.parentElement).toBeNull()
        })

    })


    describe('bringToFront', () => {

        test('should dispatch focus event', () => {
            const focusSpy = vi.fn()
            toolWindow.addEventListener('focus', focusSpy)
            toolWindow.bringToFront()
            expect(focusSpy).toHaveBeenCalled()
        })

    })


    describe('close button', () => {

        test('should close window when clicked', () => {
            const closeSpy = vi.fn()
            toolWindow.addEventListener('close', closeSpy)
            const closeBtn = toolWindow.shadowRoot.querySelector('.tool-window-close')
            closeBtn.click()
            expect(closeSpy).toHaveBeenCalled()
        })

    })


    describe('dragging', () => {

        test('should update position on drag', () => {
            toolWindow.setPosition(20, 20)
            const header = toolWindow.shadowRoot.querySelector('.tool-window-header')

            header.dispatchEvent(new MouseEvent('mousedown', {
                clientX: 50,
                clientY: 50,
                bubbles: true
            }))

            window.dispatchEvent(new MouseEvent('mousemove', {
                clientX: 150,
                clientY: 200,
                bubbles: true
            }))

            window.dispatchEvent(new MouseEvent('mouseup', {bubbles: true}))

            expect(toolWindow.style.left).toBe('120px')
            expect(toolWindow.style.top).toBe('170px')
        })

    })


    describe('disconnectedCallback', () => {

        test('should clean up window event listeners', () => {
            const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')
            toolWindow.remove()
            expect(removeEventListenerSpy).toHaveBeenCalledWith('mousemove', expect.any(Function))
            expect(removeEventListenerSpy).toHaveBeenCalledWith('mouseup', expect.any(Function))
            removeEventListenerSpy.mockRestore()
        })

    })

})
