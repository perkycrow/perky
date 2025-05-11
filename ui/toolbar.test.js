import Toolbar from './toolbar'
import {vi, beforeEach, describe, test, expect, afterEach} from 'vitest'


describe('Toolbar', () => {
    let toolbar

    beforeEach(() => {
        global.ResizeObserver = vi.fn().mockImplementation(() => ({
            observe: vi.fn(),
            unobserve: vi.fn(),
            disconnect: vi.fn()
        }))

        toolbar = new Toolbar()
        document.body.appendChild(toolbar.element)
    })


    afterEach(() => {
        vi.restoreAllMocks()
        document.body.innerHTML = ''
        delete global.ResizeObserver
    })


    test('constructor initializes with default options', () => {
        expect(toolbar.options.position).toBe('top-right')
        expect(toolbar.toolbarElement.classList.contains('perky-toolbar-top-right')).toBe(true)
    })


    test('constructor accepts custom position', () => {
        const customToolbar = new Toolbar({position: 'bottom-left'})
        
        expect(customToolbar.options.position).toBe('bottom-left')
        expect(customToolbar.toolbarElement.classList.contains('perky-toolbar-bottom-left')).toBe(true)
    })


    test('setPosition updates toolbar position', () => {
        expect(toolbar.toolbarElement.classList.contains('perky-toolbar-top-right')).toBe(true)
        
        toolbar.setPosition('bottom-left')
        
        expect(toolbar.options.position).toBe('bottom-left')
        expect(toolbar.toolbarElement.classList.contains('perky-toolbar-top-right')).toBe(false)
        expect(toolbar.toolbarElement.classList.contains('perky-toolbar-bottom-left')).toBe(true)
    })


    test('add creates a button with text', () => {
        const callback = vi.fn()
        const button = toolbar.add('Test Button', callback)
        
        expect(button.tagName).toBe('BUTTON')
        expect(button.className).toBe('perky-toolbar-button')
        expect(button.textContent).toBe('Test Button')
        expect(toolbar.toolbarElement.contains(button)).toBe(true)
        
        button.click()
        expect(callback).toHaveBeenCalled()
    })


    test('add creates a button with icon', () => {
        const callback = vi.fn()
        const iconHtml = '<svg></svg>'
        const button = toolbar.add('Button with Icon', callback, {icon: iconHtml})
        
        expect(button.textContent).toContain('Button with Icon')
        
        const icon = button.querySelector('.perky-toolbar-icon')
        expect(icon).not.toBeNull()
        expect(icon.innerHTML).toBe(iconHtml)
    })


    test('add applies custom classes', () => {
        const callback = vi.fn()
        const button = toolbar.add('Custom Class', callback, {className: 'custom-class'})
        
        expect(button.classList.contains('perky-toolbar-button')).toBe(true)
        expect(button.classList.contains('custom-class')).toBe(true)
    })


    test('add returns the created button', () => {
        const callback = vi.fn()
        const button = toolbar.add('Return Test', callback)
        
        expect(button).toBeInstanceOf(HTMLButtonElement)
    })
})
