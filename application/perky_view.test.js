import PerkyView from './perky_view'
import PerkyModule from '../core/perky_module'
import {vi, beforeEach, describe, test, expect, afterEach} from 'vitest'


describe(PerkyView, () => {
    let view
    let host
    let container
    let shadowRoot
    let element

    beforeEach(() => {
        global.ResizeObserver = vi.fn().mockImplementation(() => ({
            observe: vi.fn(),
            unobserve: vi.fn(),
            disconnect: vi.fn()
        }))

        host = document.createElement('div')
        host.id = 'test-view'

        element = document.createElement('div')
        element.className = 'shadow-container'
        shadowRoot = {
            appendChild: vi.fn(),
            insertBefore: vi.fn(),
            querySelector: vi.fn().mockReturnValue(null)
        }
        vi.spyOn(host, 'attachShadow').mockReturnValue(shadowRoot)
        
        container = document.createElement('div')
        container.id = 'test-container'
        document.body.appendChild(container)

        vi.spyOn(host, 'offsetWidth', 'get').mockReturnValue(0)
        vi.spyOn(host, 'offsetHeight', 'get').mockReturnValue(0)
        vi.spyOn(host, 'getBoundingClientRect').mockReturnValue({
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

        view = new PerkyView({element: host})
        view.element = element
    })


    afterEach(() => {
        vi.restoreAllMocks()
        document.body.innerHTML = ''
        delete global.ResizeObserver
    })


    test('constructor with element', () => {
        expect(view.host).toBe(host)
    })


    test('constructor with container', () => {
        const viewWithContainer = new PerkyView({
            element: host,
            container
        })
        
        expect(container.contains(host)).toBe(true)
        expect(viewWithContainer.container).toBe(container)
    })


    test('constructor with default element', () => {
        const defaultHost = document.createElement('div')
        const mockShadowRoot = {
            appendChild: vi.fn(),
            insertBefore: vi.fn(),
            querySelector: vi.fn().mockReturnValue(null)
        }
        vi.spyOn(defaultHost, 'attachShadow').mockReturnValue(mockShadowRoot)
        vi.spyOn(PerkyView, 'defaultElement').mockReturnValue(defaultHost)
        
        const defaultView = new PerkyView()
        
        expect(defaultView.host.tagName).toBe('DIV')
        expect(defaultHost.attachShadow).toHaveBeenCalledWith({mode: 'open'})
        expect(defaultView.shadowRoot).toBe(mockShadowRoot)
    })
    
    
    test('constructor initializes Shadow DOM', () => {
        expect(host.attachShadow).toHaveBeenCalledWith({mode: 'open'})
        expect(view.shadowRoot).toBe(shadowRoot)
        expect(shadowRoot.appendChild).toHaveBeenCalled()

        const elementArg = shadowRoot.appendChild.mock.calls[0][0]
        expect(elementArg.className).toBe('shadow-container')
    })
    

    test('constructor with Css', () => {
        host = document.createElement('div')
        shadowRoot = {
            appendChild: vi.fn(),
            insertBefore: vi.fn(),
            querySelector: vi.fn().mockReturnValue(null)
        }
        vi.spyOn(host, 'attachShadow').mockReturnValue(shadowRoot)
        
        const cssText = '.test { color: red; }'
        new PerkyView({
            element: host,
            css: cssText
        })

        expect(shadowRoot.insertBefore).toHaveBeenCalled()
        const styleElement = shadowRoot.insertBefore.mock.calls[0][0]
        expect(styleElement.tagName).toBe('STYLE')
        expect(styleElement.textContent).toBe(cssText)
    })
    
    
    test('constructor with cssPath', () => {
        host = document.createElement('div')
        shadowRoot = {
            appendChild: vi.fn(),
            insertBefore: vi.fn(),
            querySelector: vi.fn().mockReturnValue(null)
        }
        vi.spyOn(host, 'attachShadow').mockReturnValue(shadowRoot)

        const cssPath = '/path/to/styles.css'
        new PerkyView({
            element: host,
            cssPath
        })

        expect(shadowRoot.insertBefore).toHaveBeenCalled()
        const linkElement = shadowRoot.insertBefore.mock.calls[0][0]
        expect(linkElement.tagName).toBe('LINK')
        expect(linkElement.rel).toBe('stylesheet')
        
        expect(linkElement.href).toContain(cssPath)
    })
    
    
    test('setCss', () => {
        shadowRoot.insertBefore.mockClear()
        
        const cssText = '.test { color: blue; }'
        view.setCss(cssText)
        
        expect(shadowRoot.insertBefore).toHaveBeenCalled()
        const styleElement = shadowRoot.insertBefore.mock.calls[0][0]
        expect(styleElement.tagName).toBe('STYLE')
        expect(styleElement.textContent).toBe(cssText)
    })
    

    test('getCss returns null when no style is set', () => {
        shadowRoot.querySelector.mockReturnValue(null)
        expect(view.getCss()).toBeNull()
    })
    
    
    test('getCss returns style content when style exists', () => {
        const cssText = '.test { color: red; }'
        const styleElement = document.createElement('style')
        styleElement.textContent = cssText
        
        shadowRoot.querySelector.mockReturnValue(styleElement)
        
        expect(view.getCss()).toBe(cssText)
    })
    
    
    test('appendCss adds CSS when no style exists', () => {
        shadowRoot.querySelector.mockReturnValue(null)
        
        const setCssSpy = vi.spyOn(view, 'setCss')
        
        const cssText = '.test { color: blue; }'
        view.appendCss(cssText)
        
        expect(setCssSpy).toHaveBeenCalledWith(cssText)
    })
    
    
    test('appendCss appends to existing CSS', () => {
        const existingCss = '.container { padding: 10px; }'
        const styleElement = document.createElement('style')
        styleElement.textContent = existingCss
        
        shadowRoot.querySelector.mockReturnValueOnce(styleElement).mockReturnValueOnce(null)
        
        const setCssSpy = vi.spyOn(view, 'setCss')
        
        const newCss = '.button { background: blue; }'
        view.appendCss(newCss)
        
        expect(setCssSpy).toHaveBeenCalledWith(`${existingCss}\n${newCss}`)
    })
    
    
    test('appendCss returns the view instance for chaining', () => {
        expect(view.appendCss('.test { color: green; }')).toBe(view)
    })
    
    
    test('loadCss', () => {
        shadowRoot.insertBefore.mockClear()
        
        const cssPath = '/path/to/another-styles.css'
        view.loadCss(cssPath)
        
        expect(shadowRoot.insertBefore).toHaveBeenCalled()
        const linkElement = shadowRoot.insertBefore.mock.calls[0][0]
        expect(linkElement.tagName).toBe('LINK')
        expect(linkElement.rel).toBe('stylesheet')
        
        expect(linkElement.href).toContain(cssPath)
    })
    
    
    test('html getter and setter', () => {
        view.html = '<div>test shadow</div>'
        expect(element.innerHTML).toBe('<div>test shadow</div>')
        expect(view.html).toBe('<div>test shadow</div>')
        expect(view.html = '<div>test shadow</div>').toBe('<div>test shadow</div>')
    })
    
    
    test('text getter and setter', () => {
        view.text = 'test shadow text'
        expect(element.innerText).toBe('test shadow text')
        expect(view.text).toBe('test shadow text')
        expect(view.text = 'test shadow text').toBe('test shadow text')
    })


    test('id getter', () => {
        expect(view.id).toBe('test-view')
    })


    test('parentElement getter', () => {
        container.appendChild(host)
        expect(view.parentElement).toBe(container)
    })


    test('hostStyle getter', () => {
        expect(view.hostStyle).toBe(host.style)
    })


    test('width getter', () => {
        host.style.width = '300px'
        vi.spyOn(host, 'offsetWidth', 'get').mockReturnValue(300)
        expect(view.width).toBe(300)
    })


    test('height getter', () => {
        host.style.height = '400px'
        vi.spyOn(host, 'offsetHeight', 'get').mockReturnValue(400)
        expect(view.height).toBe(400)
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
        vi.spyOn(host, 'getBoundingClientRect').mockReturnValue(mockRect)
        const rect = view.boundingRect
        expect(rect).toEqual(mockRect)
    })


    test('position getter', () => {
        host.style.position = 'absolute'
        host.style.left = '100px'
        host.style.top = '200px'
        vi.spyOn(host, 'getBoundingClientRect').mockReturnValue({
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
        host.style.width = '300px'
        host.style.height = '400px'
        vi.spyOn(host, 'offsetWidth', 'get').mockReturnValue(300)
        vi.spyOn(host, 'offsetHeight', 'get').mockReturnValue(400)
        expect(view.size).toEqual({
            width: 300,
            height: 400
        })
    })


    test('classList', () => {
        expect(view.classList()).toBe(host.classList)
    })


    test('addClass', () => {
        view.addClass('test-class')
        expect(host.classList.contains('test-class')).toBe(true)
        expect(view.addClass('test-class')).toBe(view)
    })


    test('removeClass', () => {
        host.classList.add('test-class')
        view.removeClass('test-class')
        expect(host.classList.contains('test-class')).toBe(false)
        expect(view.removeClass('test-class')).toBe(view)
    })


    test('toggleClass', () => {
        view.toggleClass('test-class', true)
        expect(host.classList.contains('test-class')).toBe(true)
        expect(view.toggleClass('test-class')).toBe(view)
    })


    test('hasClass', () => {
        host.classList.add('test-class')
        expect(view.hasClass('test-class')).toBe(true)
    })


    test('setSize', () => {
        view.setSize({width: 100, height: 200})
        
        expect(host.style.width).toBe('100px')
        expect(host.style.height).toBe('200px')
        expect(view.emit).toHaveBeenCalledWith('resize', {width: 100, height: 200})
        expect(view.setSize({width: 100, height: 200})).toBe(view)
    })


    test('setSize with custom unit', () => {
        view.setSize({width: 100, height: 200, unit: '%'})
        
        expect(host.style.width).toBe('100%')
        expect(host.style.height).toBe('200%')
    })


    test('fit', () => {
        container.style.width = '500px'
        container.style.height = '600px'
        container.appendChild(host)
        
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
        
        expect(host.style.width).toBe('500px')
        expect(host.style.height).toBe('600px')
        expect(view.emit).toHaveBeenCalledWith('resize', {width: 500, height: 600})
        expect(view.fit()).toBe(view)
    })


    test('mountTo', () => {
        view.mountTo(container)
        
        expect(container.contains(host)).toBe(true)
        expect(view.container).toBe(container)
        expect(view.emit).toHaveBeenCalledWith('mount', {container})
        expect(view.mountTo(container)).toBe(view)
    })


    test('isVisible', () => {
        host.style.display = 'block'
        expect(view.isVisible()).toBe(true)
        
        host.style.display = 'none'
        expect(view.isVisible()).toBe(false)
    })


    test('setPosition', () => {
        view.setPosition({x: 100, y: 200})
        
        expect(host.style.left).toBe('100px')
        expect(host.style.top).toBe('200px')
        expect(view.setPosition({x: 100, y: 200})).toBe(view)
    })


    test('setPosition with custom unit', () => {
        view.setPosition({x: 100, y: 200, unit: '%'})
        
        expect(host.style.left).toBe('100%')
        expect(host.style.top).toBe('200%')
    })


    test('setStyle', () => {
        view.setStyle('backgroundColor', 'red')
        
        expect(host.style.backgroundColor).toBe('red')
        expect(view.setStyle('backgroundColor', 'red')).toBe(view)
    })


    test('setStyle with object', () => {
        view.setStyle({
            backgroundColor: 'red',
            color: 'blue'
        })
        
        expect(host.style.backgroundColor).toBe('red')
        expect(host.style.color).toBe('blue')
        expect(view.setStyle({})).toBe(view)
    })


    test('getStyle', () => {
        host.style.backgroundColor = 'red'
        expect(view.getStyle('backgroundColor')).toBe('red')
    })


    test('zIndex getter and setter', () => {
        view.zIndex = 100
        expect(host.style.zIndex).toBe('100')
        expect(view.zIndex).toBe('100')
    })


    test('opacity getter and setter', () => {
        view.opacity = 0.5
        expect(host.style.opacity).toBe('0.5')
        expect(view.opacity).toBe('0.5')
    })


    test('display getter and setter', () => {
        view.display = 'flex'
        expect(host.style.display).toBe('flex')
        expect(view.display).toBe('flex')
        expect(view.display = 'flex').toBe('flex')
    })


    test('hide', () => {
        host.style.display = 'flex'
        view.hide()
        
        expect(host.style.display).toBe('none')
        expect(view.previousDisplay).toBe('flex')
        expect(view.hide()).toBe(view)
    })


    test('show', () => {
        view.previousDisplay = 'flex'
        view.show()
        
        expect(host.style.display).toBe('flex')
        expect(view.previousDisplay).toBeUndefined()
        expect(view.show()).toBe(view)
    })


    test('show without previous display', () => {
        view.show()
        expect(host.style.display).toBe('')
    })


    test('setAttribute', () => {
        view.setAttribute('data-test', 'value')
        expect(host.getAttribute('data-test')).toBe('value')
        expect(view.setAttribute('data-test', 'value')).toBe(view)
    })


    test('getAttribute', () => {
        host.setAttribute('data-test', 'value')
        expect(view.getAttribute('data-test')).toBe('value')
    })


    test('removeAttribute', () => {
        host.setAttribute('data-test', 'value')
        view.removeAttribute('data-test')
        expect(host.hasAttribute('data-test')).toBe(false)
        expect(view.removeAttribute('data-test')).toBe(view)
    })


    test('dispose', () => {
        const disposeSpy = vi.spyOn(PerkyModule.prototype, 'dispose')
        
        view.dispose()
        
        expect(disposeSpy).toHaveBeenCalled()
    })


    test('ResizeObserver setup', () => {
        expect(global.ResizeObserver).toHaveBeenCalled()
        expect(view.resizeObserver.observe).toHaveBeenCalledWith(host)
    })


    test('ResizeObserver cleanup on dispose', () => {
        const disconnectSpy = vi.spyOn(view.resizeObserver, 'disconnect')
        view.dispose()
        expect(disconnectSpy).toHaveBeenCalled()
    })

})
