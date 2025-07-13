import PerkyElement from './perky_element'
import {vi, beforeEach, describe, test, expect, afterEach} from 'vitest'


describe(PerkyElement, () => {
    let element
    let container

    beforeEach(() => {
        global.ResizeObserver = vi.fn().mockImplementation(() => ({
            observe: vi.fn(),
            unobserve: vi.fn(),
            disconnect: vi.fn()
        }))

        container = document.createElement('div')
        container.id = 'test-container'
        document.body.appendChild(container)

        element = new PerkyElement()
        document.body.appendChild(element)

        vi.spyOn(element, 'dispatchEvent')
    })


    afterEach(() => {
        document.body.innerHTML = ''
        vi.restoreAllMocks()
        delete global.ResizeObserver
    })


    test('custom element creation', () => {
        expect(element).toBeInstanceOf(PerkyElement)
        expect(element.tagName).toBe('PERKY-ELEMENT')
        expect(element.displayMode).toBe('normal')
        expect(element.viewportMode).toBe(false)
        expect(element.fullscreenMode).toBe(false)
    })


    test('width and height getters', () => {
        element.style.width = '300px'
        element.style.height = '400px'

        vi.spyOn(element, 'offsetWidth', 'get').mockReturnValue(300)
        vi.spyOn(element, 'offsetHeight', 'get').mockReturnValue(400)
        
        expect(element.width).toBe(300)
        expect(element.height).toBe(400)
    })


    test('size getter', () => {
        vi.spyOn(element, 'offsetWidth', 'get').mockReturnValue(300)
        vi.spyOn(element, 'offsetHeight', 'get').mockReturnValue(400)
        
        expect(element.size).toEqual({
            width: 300,
            height: 400
        })
    })


    test('aspectRatio getter', () => {
        vi.spyOn(element, 'offsetWidth', 'get').mockReturnValue(300)
        vi.spyOn(element, 'offsetHeight', 'get').mockReturnValue(400)
        
        expect(element.aspectRatio).toBe(300 / 400)
    })


    test('boundingRect getter', () => {
        const mockRect = {
            left: 10,
            top: 20,
            width: 300,
            height: 400,
            right: 310,
            bottom: 420,
            x: 10,
            y: 20
        }
        
        vi.spyOn(element, 'getBoundingClientRect').mockReturnValue(mockRect)
        
        expect(element.boundingRect).toEqual(mockRect)
    })


    test('position getter', () => {
        const mockRect = {
            left: 100,
            top: 200,
            width: 300,
            height: 400,
            right: 400,
            bottom: 600,
            x: 100,
            y: 200
        }
        
        vi.spyOn(element, 'getBoundingClientRect').mockReturnValue(mockRect)
        
        expect(element.position).toEqual({x: 100, y: 200})
    })


    test('enterViewportMode', () => {
        element.enterViewportMode()
        
        expect(element.displayMode).toBe('viewport')
        expect(element.viewportMode).toBe(true)
        expect(element.fullscreenMode).toBe(false)
        expect(document.body.style.overflow).toBe('hidden')
        expect(document.body.classList.contains('viewport-mode')).toBe(true)
        expect(element.dispatchEvent).toHaveBeenCalledWith(
            expect.objectContaining({
                type: 'displayMode:changed',
                detail: {mode: 'viewport'}
            })
        )
    })


    test('exitFullscreenMode from viewport', () => {
        element.enterViewportMode()

        element.exitFullscreenMode()
        
        expect(element.displayMode).toBe('normal')
        expect(element.viewportMode).toBe(false)
        expect(element.fullscreenMode).toBe(false)
        expect(document.body.style.overflow).toBe('')
        expect(document.body.classList.contains('viewport-mode')).toBe(false)
        expect(element.dispatchEvent).toHaveBeenCalledWith(
            expect.objectContaining({
                type: 'displayMode:changed',
                detail: {mode: 'normal'}
            })
        )
    })


    test('setDisplayMode', () => {
        vi.spyOn(element, 'enterViewportMode')
        vi.spyOn(element, 'enterFullscreenMode')
        vi.spyOn(element, 'exitFullscreenMode')
        
        element.setDisplayMode('viewport')
        expect(element.enterViewportMode).toHaveBeenCalled()
        
        element.setDisplayMode('fullscreen')
        expect(element.enterFullscreenMode).toHaveBeenCalled()
        
        element.setDisplayMode('normal')
        expect(element.exitFullscreenMode).toHaveBeenCalled()
    })


    test('setDisplayMode with invalid mode', () => {
        const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
        
        element.setDisplayMode('invalid')
        
        expect(consoleSpy).toHaveBeenCalledWith('Unknown display mode: invalid')
        consoleSpy.mockRestore()
    })


    test('resize event delegation', () => {
        const entries = [{contentRect: {width: 500, height: 600}}]
        const callback = global.ResizeObserver.mock.calls[0][0]
        
        callback(entries)
        
        expect(element.dispatchEvent).toHaveBeenCalledWith(
            expect.objectContaining({
                type: 'resize',
                detail: {width: 500, height: 600}
            })
        )
    })


    test('connectedCallback and disconnectedCallback', () => {
        const newElement = new PerkyElement()

        document.body.appendChild(newElement)
        expect(newElement.isConnected).toBe(true)

        document.body.removeChild(newElement)
        expect(newElement.isConnected).toBe(false)
    })


    test('slot content rendering', async () => {
        const content = document.createElement('div')
        content.textContent = 'Test content'
        element.appendChild(content)
        
        await element.updateComplete
        
        const slot = element.shadowRoot.querySelector('slot')
        expect(slot).toBeTruthy()
        
        const assignedElements = slot.assignedElements()
        expect(assignedElements).toHaveLength(1)
        expect(assignedElements[0]).toBe(content)
    })

})
