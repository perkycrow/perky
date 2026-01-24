import {describe, test, expect} from 'vitest'
import {
    createElement,
    setAttributes,
    setStyles,
    createStyleSheet,
    adoptStyleSheets
} from './dom_utils.js'


describe('dom_utils', () => {

    describe('createElement', () => {

        test('creates element with tag name', () => {
            const el = createElement('div')
            expect(el.tagName).toBe('DIV')
        })


        test('sets className with class option', () => {
            const el = createElement('div', {class: 'my-class'})
            expect(el.className).toBe('my-class')
        })


        test('sets className with className option', () => {
            const el = createElement('div', {className: 'my-class'})
            expect(el.className).toBe('my-class')
        })


        test('sets id', () => {
            const el = createElement('div', {id: 'my-id'})
            expect(el.id).toBe('my-id')
        })


        test('sets textContent with text option', () => {
            const el = createElement('span', {text: 'Hello'})
            expect(el.textContent).toBe('Hello')
        })


        test('sets innerHTML with html option', () => {
            const el = createElement('div', {html: '<span>Test</span>'})
            expect(el.innerHTML).toBe('<span>Test</span>')
        })


        test('sets attributes via attrs option', () => {
            const el = createElement('input', {
                attrs: {type: 'text', dataValue: '42'}
            })
            expect(el.getAttribute('type')).toBe('text')
            expect(el.getAttribute('data-value')).toBe('42')
        })


        test('combines multiple options', () => {
            const el = createElement('button', {
                class: 'btn primary',
                id: 'submit-btn',
                text: 'Submit',
                attrs: {type: 'submit'}
            })

            expect(el.className).toBe('btn primary')
            expect(el.id).toBe('submit-btn')
            expect(el.textContent).toBe('Submit')
            expect(el.getAttribute('type')).toBe('submit')
        })

    })


    describe('setAttributes', () => {

        test('sets single attribute', () => {
            const el = document.createElement('div')
            setAttributes(el, {id: 'test'})
            expect(el.getAttribute('id')).toBe('test')
        })


        test('sets multiple attributes', () => {
            const el = document.createElement('input')
            setAttributes(el, {type: 'text', name: 'username'})
            expect(el.getAttribute('type')).toBe('text')
            expect(el.getAttribute('name')).toBe('username')
        })


        test('converts camelCase to kebab-case', () => {
            const el = document.createElement('div')
            setAttributes(el, {dataValue: '42', ariaLabel: 'test'})
            expect(el.getAttribute('data-value')).toBe('42')
            expect(el.getAttribute('aria-label')).toBe('test')
        })


        test('preserves kebab-case keys', () => {
            const el = document.createElement('div')
            setAttributes(el, {'data-id': '123', 'aria-hidden': 'true'})
            expect(el.getAttribute('data-id')).toBe('123')
            expect(el.getAttribute('aria-hidden')).toBe('true')
        })


        test('handles empty string values', () => {
            const el = document.createElement('input')
            setAttributes(el, {noValue: '', disabled: ''})
            expect(el.getAttribute('no-value')).toBe('')
            expect(el.getAttribute('disabled')).toBe('')
        })

    })


    describe('setStyles', () => {

        test('sets single style', () => {
            const el = document.createElement('div')
            setStyles(el, {display: 'flex'})
            expect(el.style.display).toBe('flex')
        })


        test('sets multiple styles', () => {
            const el = document.createElement('div')
            setStyles(el, {
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
            })
            expect(el.style.display).toBe('flex')
            expect(el.style.justifyContent).toBe('center')
            expect(el.style.alignItems).toBe('center')
        })


        test('handles pixel values', () => {
            const el = document.createElement('div')
            setStyles(el, {marginTop: '16px', padding: '8px'})
            expect(el.style.marginTop).toBe('16px')
            expect(el.style.padding).toBe('8px')
        })

    })


    describe('createStyleSheet', () => {

        test('returns CSSStyleSheet', () => {
            const css = '.test { color: red; }'
            const sheet = createStyleSheet(css)
            expect(sheet).toBeInstanceOf(CSSStyleSheet)
        })

    })


    describe('adoptStyleSheets', () => {

        test('applies styles to shadow root', () => {
            const host = document.createElement('div')
            const shadowRoot = host.attachShadow({mode: 'open'})

            const sheet = createStyleSheet('.test { color: red; }')
            adoptStyleSheets(shadowRoot, sheet)

            expect(shadowRoot.adoptedStyleSheets.length).toBe(1)
        })


        test('filters out null/undefined sheets', () => {
            const host = document.createElement('div')
            const shadowRoot = host.attachShadow({mode: 'open'})

            const sheet = createStyleSheet('.test { color: red; }')
            adoptStyleSheets(shadowRoot, null, sheet, undefined)

            expect(shadowRoot.adoptedStyleSheets.length).toBe(1)
        })


        test('handles multiple sheets', () => {
            const host = document.createElement('div')
            const shadowRoot = host.attachShadow({mode: 'open'})

            const sheet1 = createStyleSheet('.a { color: red; }')
            const sheet2 = createStyleSheet('.b { color: blue; }')
            adoptStyleSheets(shadowRoot, sheet1, sheet2)

            expect(shadowRoot.adoptedStyleSheets.length).toBe(2)
        })

    })

})
