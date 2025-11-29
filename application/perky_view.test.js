import PerkyView from './perky_view'
import PerkyModule from '../core/perky_module'
import {vi, beforeEach, describe, test, expect, afterEach} from 'vitest'


describe(PerkyView, () => {
    let view
    let element
    let container

    beforeEach(() => {
        global.ResizeObserver = vi.fn().mockImplementation(() => ({
            observe: vi.fn(),
            unobserve: vi.fn(),
            disconnect: vi.fn()
        }))

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
        delete global.ResizeObserver
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


    test('html getter and setter', () => {
        view.html = '<div>test content</div>'
        expect(element.innerHTML).toBe('<div>test content</div>')
        expect(view.html).toBe('<div>test content</div>')
        expect(view.html = '<div>test content</div>').toBe('<div>test content</div>')
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
        expect(view.previousDisplay).toBe('flex')
    })


    test('show', () => {
        view.previousDisplay = 'flex'
        view.show()

        expect(element.style.display).toBe('flex')
        expect(view.previousDisplay).toBeUndefined()
    })


    test('show without previous display', () => {
        view.show()
        expect(element.style.display).toBe('')
    })


    test('dispose', () => {
        const disposeSpy = vi.spyOn(PerkyModule.prototype, 'dispose')

        view.dispose()

        expect(disposeSpy).toHaveBeenCalled()
    })

})
