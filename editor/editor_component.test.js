import {describe, test, expect, beforeEach, afterEach} from 'vitest'
import EditorComponent from './editor_component.js'
import PerkyElement from '../application/perky_element.js'


class TestEditorComponent extends EditorComponent {}
customElements.define('test-editor-component', TestEditorComponent)


describe('EditorComponent', () => {

    let component
    let container


    beforeEach(() => {
        container = document.createElement('div')
        document.body.appendChild(container)

        component = document.createElement('test-editor-component')
        container.appendChild(component)
    })


    afterEach(() => {
        container.remove()
    })


    describe('inheritance', () => {

        test('extends PerkyElement', () => {
            expect(component).toBeInstanceOf(PerkyElement)
        })


        test('extends HTMLElement', () => {
            expect(component).toBeInstanceOf(HTMLElement)
        })


        test('has shadow DOM', () => {
            expect(component.shadowRoot).not.toBeNull()
        })

    })


    describe('base styles', () => {

        test('has adopted stylesheets', () => {
            expect(component.shadowRoot.adoptedStyleSheets.length).toBe(3)
        })


        test('static styles includes theme and reset', () => {
            const styles = EditorComponent.styles
            expect(Array.isArray(styles)).toBe(true)
            const combined = styles.join('\n')
            expect(combined).toContain('--bg-primary')
            expect(combined).toContain('--accent')
            expect(combined).toContain('box-sizing: border-box')
        })

    })


    test('style inheritance child component gets parent styles plus its own', () => {
        class ChildComponent extends EditorComponent {
            static styles = '.child { color: red; }'
        }
        customElements.define('test-child-editor', ChildComponent)

        const child = document.createElement('test-child-editor')
        container.appendChild(child)

        // Parent EditorComponent styles (3 sheets) + child styles (1 sheet)
        expect(child.shadowRoot.adoptedStyleSheets.length).toBe(4)
    })

})
