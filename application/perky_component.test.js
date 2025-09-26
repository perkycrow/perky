import PerkyComponent from './perky_component'
import {html} from 'lit'
import {vi, beforeEach, describe, test, expect, afterEach} from 'vitest'


class TestComponent extends PerkyComponent {
    static tagName = 'test-component'
    static css = `
        test-component {
            display: block;
            color: red;
        }
        
        test-component .test-class {
            background: blue;
        }
    `

    render () { // eslint-disable-line class-methods-use-this
        return html`<div class="test-class">Test Content</div>`
    }
}

TestComponent.define()

class EmptyComponent extends PerkyComponent {
    static tagName = 'empty-component'
    static css = ''

    render () { // eslint-disable-line class-methods-use-this
        return html`<div>Empty CSS</div>`
    }
}

EmptyComponent.define()

class BaseComponent extends PerkyComponent {
    static tagName = 'base-component'
    static css = ''
}

BaseComponent.define()


describe('PerkyComponent', () => {
    
    beforeEach(() => {
        document.head.querySelectorAll('style[id$="-styles"]').forEach(style => style.remove())
        document.body.innerHTML = ''

        TestComponent.styleUsageCount = 0
        EmptyComponent.styleUsageCount = 0
    })

    afterEach(() => {
        document.head.querySelectorAll('style[id$="-styles"]').forEach(style => style.remove())
        document.body.innerHTML = ''
        vi.restoreAllMocks()
    })


    test('base class properties', () => {
        const component = new BaseComponent()
        
        expect(PerkyComponent.tagName).toBe('perky-component')
        expect(PerkyComponent.css).toBe('')
        expect(component.createRenderRoot()).toBe(component)
    })


    test('custom component properties', () => {
        expect(TestComponent.tagName).toBe('test-component')
        expect(TestComponent.css).toContain('test-component {')
    })


    test('static style injection', () => {
        TestComponent.injectStyles()
        
        const styleElement = document.getElementById('test-component-styles')
        expect(styleElement).toBeTruthy()
        expect(TestComponent.styleUsageCount).toBe(1)
    })


    test('prevents duplicate style injection', () => {
        TestComponent.injectStyles()
        TestComponent.injectStyles()
        TestComponent.injectStyles()
        
        const styleElements = document.querySelectorAll('#test-component-styles')
        expect(styleElements.length).toBe(1)
        expect(TestComponent.styleUsageCount).toBe(3)
    })


    test('empty CSS does not inject styles', () => {
        EmptyComponent.injectStyles()
        
        const styleElement = document.getElementById('empty-component-styles')
        expect(styleElement).toBeFalsy()
        expect(EmptyComponent.styleUsageCount).toBe(1)
    })


    test('style cleanup removes styles when count reaches zero', () => {
        TestComponent.injectStyles()
        TestComponent.injectStyles()
        
        expect(document.getElementById('test-component-styles')).toBeTruthy()
        expect(TestComponent.styleUsageCount).toBe(2)
        
        TestComponent.cleanupStyles()
        expect(document.getElementById('test-component-styles')).toBeTruthy()
        expect(TestComponent.styleUsageCount).toBe(1)
        
        TestComponent.cleanupStyles()
        expect(document.getElementById('test-component-styles')).toBeFalsy()
        expect(TestComponent.styleUsageCount).toBe(0)
    })


    test('style cleanup handles non-existent styles gracefully', () => {
        TestComponent.cleanupStyles()
        
        expect(TestComponent.styleUsageCount).toBe(0)
        expect(document.getElementById('test-component-styles')).toBeFalsy()
    })


    test('component lifecycle - connectedCallback injects styles', () => {
        const injectSpy = vi.spyOn(TestComponent, 'injectStyles')
        
        const component = new TestComponent()
        document.body.appendChild(component)
        
        expect(injectSpy).toHaveBeenCalled()
    })


    test('component lifecycle - disconnectedCallback cleans up styles', () => {
        const cleanupSpy = vi.spyOn(TestComponent, 'cleanupStyles')
        
        const component = new TestComponent()
        document.body.appendChild(component)
        document.body.removeChild(component)
        
        expect(cleanupSpy).toHaveBeenCalled()
    })


    test('multiple component instances manage count correctly', () => {
        const component1 = new TestComponent()
        const component2 = new TestComponent()
        const component3 = new TestComponent()
        
        document.body.appendChild(component1)
        expect(TestComponent.styleUsageCount).toBe(1)
        expect(document.getElementById('test-component-styles')).toBeTruthy()
        
        document.body.appendChild(component2)
        expect(TestComponent.styleUsageCount).toBe(2)
        
        document.body.appendChild(component3)
        expect(TestComponent.styleUsageCount).toBe(3)
        
        document.body.removeChild(component1)
        expect(TestComponent.styleUsageCount).toBe(2)
        expect(document.getElementById('test-component-styles')).toBeTruthy()
        
        document.body.removeChild(component2)
        expect(TestComponent.styleUsageCount).toBe(1)
        expect(document.getElementById('test-component-styles')).toBeTruthy()
        
        document.body.removeChild(component3)
        expect(TestComponent.styleUsageCount).toBe(0)
        expect(document.getElementById('test-component-styles')).toBeFalsy()
    })


    test('static define method registers custom element', () => {
        class NewTestComponent extends PerkyComponent {
            static tagName = 'new-test-component'
            static css = ''
        }
        
        const defineSpy = vi.spyOn(customElements, 'define')
        
        NewTestComponent.define()
        
        expect(defineSpy).toHaveBeenCalledWith('new-test-component', NewTestComponent)
    })


    test('static define method prevents duplicate registration', () => {
        const getSpy = vi.spyOn(customElements, 'get').mockReturnValue(TestComponent)
        const defineSpy = vi.spyOn(customElements, 'define')
        
        TestComponent.define()
        
        expect(getSpy).toHaveBeenCalledWith('test-component')
        expect(defineSpy).not.toHaveBeenCalled()
    })


    test('renders without Shadow DOM', async () => {
        TestComponent.define()
        const component = new TestComponent()
        document.body.appendChild(component)
        
        await component.updateComplete

        const testDiv = component.querySelector('.test-class')
        expect(testDiv).toBeTruthy()
        expect(testDiv.textContent).toBe('Test Content')

        expect(component.shadowRoot).toBeFalsy()
    })


    test('CSS is correctly injected', () => {
        TestComponent.injectStyles()
        
        const styleElement = document.getElementById('test-component-styles')
        expect(styleElement.textContent).toContain('test-component {')
    })


    test('style ID is correctly generated from tagName', () => {
        TestComponent.injectStyles()
        
        const expectedId = `${TestComponent.tagName}-styles`
        const styleElement = document.getElementById(expectedId)
        
        expect(styleElement).toBeTruthy()
        expect(styleElement.id).toBe('test-component-styles')
    })

})
