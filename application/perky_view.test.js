import PerkyView from './perky_view.js'
import PerkyModule from '../core/perky_module.js'
import {vi, beforeEach, describe, test, expect, afterEach} from 'vitest'


describe(PerkyView, () => {
    let view
    let element
    let container

    beforeEach(() => {
        element = document.createElement('div')
        element.id = 'test-view'

        container = document.createElement('div')
        container.id = 'test-container'
        document.body.appendChild(container)

        vi.spyOn(element, 'offsetWidth', 'get').mockReturnValue(0)
        vi.spyOn(element, 'offsetHeight', 'get').mockReturnValue(0)
        vi.spyOn(element, 'getBoundingClientRect').mockReturnValue({
            left: 0,
            top: 0,
            width: 0,
            height: 0,
            right: 0,
            bottom: 0,
            x: 0,
            y: 0
        })

        vi.spyOn(PerkyModule.prototype, 'emit')

        view = new PerkyView({element})
    })


    afterEach(() => {
        vi.restoreAllMocks()
        document.body.innerHTML = ''
    })


    test('constructor with element', () => {
        expect(view.element).toBe(element)
    })


    test('constructor with container', () => {
        const viewWithContainer = new PerkyView({
            element,
            container
        })

        expect(container.contains(element)).toBe(true)
        expect(viewWithContainer.container).toBe(container)
    })


    test('constructor with default element', () => {
        const defaultView = new PerkyView()

        expect(defaultView.element.tagName).toBe('DIV')
        expect(defaultView.element.className).toBe('perky-view')
    })


    test('html getter', () => {
        element.innerHTML = '<div>test content</div>'
        expect(view.html).toBe('<div>test content</div>')
    })


    test('width getter', () => {
        element.style.width = '300px'
        vi.spyOn(element, 'offsetWidth', 'get').mockReturnValue(300)
        expect(view.width).toBe(300)
    })


    test('height getter', () => {
        element.style.height = '400px'
        vi.spyOn(element, 'offsetHeight', 'get').mockReturnValue(400)
        expect(view.height).toBe(400)
    })


    test('aspectRatio getter', () => {
        element.style.width = '300px'
        element.style.height = '400px'
        vi.spyOn(element, 'offsetWidth', 'get').mockReturnValue(300)
        vi.spyOn(element, 'offsetHeight', 'get').mockReturnValue(400)
        expect(view.aspectRatio).toBe(300 / 400)
    })


    test('size getter', () => {
        element.style.width = '300px'
        element.style.height = '400px'
        vi.spyOn(element, 'offsetWidth', 'get').mockReturnValue(300)
        vi.spyOn(element, 'offsetHeight', 'get').mockReturnValue(400)
        expect(view.size).toEqual({
            width: 300,
            height: 400
        })
    })


    test('addClass', () => {
        view.addClass('test-class')
        expect(element.classList.contains('test-class')).toBe(true)
    })


    test('removeClass', () => {
        element.classList.add('test-class')
        view.removeClass('test-class')
        expect(element.classList.contains('test-class')).toBe(false)
    })


    test('hasClass', () => {
        element.classList.add('test-class')
        expect(view.hasClass('test-class')).toBe(true)
    })


    test('setSize', () => {
        view.setSize({width: 100, height: 200})

        expect(element.style.width).toBe('100px')
        expect(element.style.height).toBe('200px')
    })


    test('setSize with custom unit', () => {
        view.setSize({width: 100, height: 200, unit: '%'})

        expect(element.style.width).toBe('100%')
        expect(element.style.height).toBe('200%')
    })


    test('fit', () => {
        container.style.width = '500px'
        container.style.height = '600px'
        container.appendChild(element)

        vi.spyOn(container, 'getBoundingClientRect').mockReturnValue({
            width: 500,
            height: 600,
            left: 0,
            top: 0,
            right: 500,
            bottom: 600,
            x: 0,
            y: 0
        })

        view.fit()

        expect(element.style.width).toBe('500px')
        expect(element.style.height).toBe('600px')
    })


    test('mount', () => {
        view.mount(container)

        expect(container.contains(element)).toBe(true)
        expect(view.container).toBe(container)
        expect(view.emit).toHaveBeenCalledWith('mount', {container})
    })


    test('isVisible', () => {
        element.style.display = 'block'
        expect(view.isVisible()).toBe(true)

        element.style.display = 'none'
        expect(view.isVisible()).toBe(false)
    })


    test('display getter and setter', () => {
        view.display = 'flex'
        expect(element.style.display).toBe('flex')
        expect(view.display).toBe('flex')
        expect(view.display = 'flex').toBe('flex')
    })


    test('hide', () => {
        element.style.display = 'flex'
        view.hide()

        expect(element.style.display).toBe('none')
    })


    test('show restores previous display', () => {
        element.style.display = 'flex'
        view.hide()
        view.show()

        expect(element.style.display).toBe('flex')
    })


    test('show without previous display', () => {
        view.show()
        expect(element.style.display).toBe('')
    })


    test('dismount removes element from container', () => {
        view.mount(container)
        expect(container.contains(element)).toBe(true)

        view.dismount()

        expect(container.contains(element)).toBe(false)
        expect(view.emit).toHaveBeenCalledWith('dismount', {container: null})
    })


    test('dismount when not mounted does nothing', () => {
        view.dismount()

        expect(view.emit).not.toHaveBeenCalledWith('dismount', expect.anything())
    })


    test('setDisplayMode normal calls exitFullscreenMode', () => {
        vi.spyOn(view, 'exitFullscreenMode')

        view.setDisplayMode('normal')

        expect(view.exitFullscreenMode).toHaveBeenCalled()
    })


    test('setDisplayMode fullscreen calls enterFullscreenMode', () => {
        vi.spyOn(view, 'enterFullscreenMode')

        view.setDisplayMode('fullscreen')

        expect(view.enterFullscreenMode).toHaveBeenCalled()
    })


    test('setDisplayMode with invalid mode does nothing', () => {
        vi.spyOn(view, 'enterFullscreenMode')
        vi.spyOn(view, 'exitFullscreenMode')

        view.setDisplayMode('invalid')

        expect(view.enterFullscreenMode).not.toHaveBeenCalled()
        expect(view.exitFullscreenMode).not.toHaveBeenCalled()
    })


    test('enterFullscreenMode sets fullscreen styles', () => {
        element.requestFullscreen = vi.fn()

        view.enterFullscreenMode()

        expect(view.displayMode).toBe('fullscreen')
        expect(element.style.position).toBe('fixed')
        expect(element.style.top).toBe('0px')
        expect(element.style.left).toBe('0px')
        expect(element.style.width).toBe('100vw')
        expect(element.style.height).toBe('100vh')
        expect(element.style.zIndex).toBe('10000')
        expect(document.body.classList.contains('fullscreen-mode')).toBe(true)
        expect(element.requestFullscreen).toHaveBeenCalled()
    })


    test('enterFullscreenMode does nothing if already fullscreen', () => {
        element.requestFullscreen = vi.fn()
        view.displayMode = 'fullscreen'

        view.enterFullscreenMode()

        expect(element.requestFullscreen).not.toHaveBeenCalled()
    })


    test('exitFullscreenMode restores previous styles', () => {
        element.requestFullscreen = vi.fn()
        element.style.position = 'relative'
        element.style.width = '200px'
        element.style.height = '300px'

        view.enterFullscreenMode()
        view.exitFullscreenMode()

        expect(view.displayMode).toBe('normal')
        expect(element.style.position).toBe('relative')
        expect(element.style.width).toBe('200px')
        expect(element.style.height).toBe('300px')
        expect(document.body.classList.contains('fullscreen-mode')).toBe(false)
    })


    test('exitFullscreenMode does nothing if already normal', () => {
        view.displayMode = 'normal'

        view.exitFullscreenMode()

        expect(view.displayMode).toBe('normal')
    })


    test('toggleFullscreen enters fullscreen from normal', () => {
        vi.spyOn(view, 'enterFullscreenMode')

        view.toggleFullscreen()

        expect(view.enterFullscreenMode).toHaveBeenCalled()
    })


    test('toggleFullscreen exits fullscreen from fullscreen', () => {
        vi.spyOn(view, 'exitFullscreenMode')
        view.displayMode = 'fullscreen'

        view.toggleFullscreen()

        expect(view.exitFullscreenMode).toHaveBeenCalled()
    })

})
