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
        const defaultElement = document.createElement('div')
        vi.spyOn(PerkyView, 'defaultElement').mockReturnValue(defaultElement)
        
        const defaultView = new PerkyView()
        
        expect(defaultView.element.tagName).toBe('DIV')
    })

    test('html getter and setter', () => {
        view.html = '<div>test content</div>'
        expect(element.innerHTML).toBe('<div>test content</div>')
        expect(view.html).toBe('<div>test content</div>')
        expect(view.html = '<div>test content</div>').toBe('<div>test content</div>')
    })
    
    
    test('text getter and setter', () => {
        view.text = 'test content text'
        expect(element.innerText).toBe('test content text')
        expect(view.text).toBe('test content text')
        expect(view.text = 'test content text').toBe('test content text')
    })


    test('id getter', () => {
        expect(view.id).toBe('test-view')
    })


    test('parentElement getter', () => {
        container.appendChild(element)
        expect(view.parentElement).toBe(container)
    })


    test('style getter', () => {
        expect(view.style).toBe(element.style)
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


    test('boundingRect getter', () => {
        const mockRect = {
            left: 0,
            top: 0,
            width: 0,
            height: 0,
            right: 0,
            bottom: 0,
            x: 0,
            y: 0
        }
        vi.spyOn(element, 'getBoundingClientRect').mockReturnValue(mockRect)
        const rect = view.boundingRect
        expect(rect).toEqual(mockRect)
    })


    test('position getter', () => {
        element.style.position = 'absolute'
        element.style.left = '100px'
        element.style.top = '200px'
        vi.spyOn(element, 'getBoundingClientRect').mockReturnValue({
            left: 100,
            top: 200,
            width: 0,
            height: 0,
            right: 0,
            bottom: 0,
            x: 100,
            y: 200
        })
        expect(view.position).toEqual({x: 100, y: 200})
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


    test('classList', () => {
        expect(view.classList()).toBe(element.classList)
    })


    test('addClass', () => {
        view.addClass('test-class')
        expect(element.classList.contains('test-class')).toBe(true)
        expect(view.addClass('test-class')).toBe(view)
    })


    test('removeClass', () => {
        element.classList.add('test-class')
        view.removeClass('test-class')
        expect(element.classList.contains('test-class')).toBe(false)
        expect(view.removeClass('test-class')).toBe(view)
    })


    test('toggleClass', () => {
        view.toggleClass('test-class', true)
        expect(element.classList.contains('test-class')).toBe(true)
        expect(view.toggleClass('test-class')).toBe(view)
    })


    test('hasClass', () => {
        element.classList.add('test-class')
        expect(view.hasClass('test-class')).toBe(true)
    })


    test('setSize', () => {
        view.setSize({width: 100, height: 200})
        
        expect(element.style.width).toBe('100px')
        expect(element.style.height).toBe('200px')
        expect(view.emit).toHaveBeenCalledWith('resize', {width: 100, height: 200})
        expect(view.setSize({width: 100, height: 200})).toBe(view)
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
        expect(view.emit).toHaveBeenCalledWith('resize', {width: 500, height: 600})
        expect(view.fit()).toBe(view)
    })


    test('mountTo', () => {
        view.mountTo(container)
        
        expect(container.contains(element)).toBe(true)
        expect(view.container).toBe(container)
        expect(view.emit).toHaveBeenCalledWith('mount', {container})
        expect(view.mountTo(container)).toBe(view)
    })


    test('isVisible', () => {
        element.style.display = 'block'
        expect(view.isVisible()).toBe(true)
        
        element.style.display = 'none'
        expect(view.isVisible()).toBe(false)
    })


    test('setPosition', () => {
        view.setPosition({x: 100, y: 200})
        
        expect(element.style.left).toBe('100px')
        expect(element.style.top).toBe('200px')
        expect(view.setPosition({x: 100, y: 200})).toBe(view)
    })


    test('setPosition with custom unit', () => {
        view.setPosition({x: 100, y: 200, unit: '%'})
        
        expect(element.style.left).toBe('100%')
        expect(element.style.top).toBe('200%')
    })


    test('setStyle', () => {
        view.setStyle('backgroundColor', 'red')
        
        expect(element.style.backgroundColor).toBe('red')
        expect(view.setStyle('backgroundColor', 'red')).toBe(view)
    })


    test('setStyle with object', () => {
        view.setStyle({
            backgroundColor: 'red',
            color: 'blue'
        })
        
        expect(element.style.backgroundColor).toBe('red')
        expect(element.style.color).toBe('blue')
        expect(view.setStyle({})).toBe(view)
    })


    test('getStyle', () => {
        element.style.backgroundColor = 'red'
        expect(view.getStyle('backgroundColor')).toBe('red')
    })


    test('zIndex getter and setter', () => {
        view.zIndex = 100
        expect(element.style.zIndex).toBe('100')
        expect(view.zIndex).toBe('100')
    })


    test('opacity getter and setter', () => {
        view.opacity = 0.5
        expect(element.style.opacity).toBe('0.5')
        expect(view.opacity).toBe('0.5')
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
        expect(view.hide()).toBe(view)
    })


    test('show', () => {
        view.previousDisplay = 'flex'
        view.show()
        
        expect(element.style.display).toBe('flex')
        expect(view.previousDisplay).toBeUndefined()
        expect(view.show()).toBe(view)
    })


    test('show without previous display', () => {
        view.show()
        expect(element.style.display).toBe('')
    })


    test('setAttribute', () => {
        view.setAttribute('data-test', 'value')
        expect(element.getAttribute('data-test')).toBe('value')
        expect(view.setAttribute('data-test', 'value')).toBe(view)
    })


    test('getAttribute', () => {
        element.setAttribute('data-test', 'value')
        expect(view.getAttribute('data-test')).toBe('value')
    })


    test('removeAttribute', () => {
        element.setAttribute('data-test', 'value')
        view.removeAttribute('data-test')
        expect(element.hasAttribute('data-test')).toBe(false)
        expect(view.removeAttribute('data-test')).toBe(view)
    })


    test('dispose', () => {
        const disposeSpy = vi.spyOn(PerkyModule.prototype, 'dispose')
        
        view.dispose()
        
        expect(disposeSpy).toHaveBeenCalled()
    })


    test('ResizeObserver setup', () => {
        expect(global.ResizeObserver).toHaveBeenCalled()

        const mockObserver = global.ResizeObserver.mock.results[0].value
        expect(mockObserver.observe).toHaveBeenCalledWith(element)
    })


    test('ResizeObserver cleanup on dispose', () => {
        const mockObserver = global.ResizeObserver.mock.results[0].value
        const disconnectSpy = vi.spyOn(mockObserver, 'disconnect')
        
        view.dispose()
        
        expect(disconnectSpy).toHaveBeenCalled()
    })

})
