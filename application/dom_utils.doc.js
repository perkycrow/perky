import {doc, section, text, code, action, logger} from '../doc/runtime.js'
import {createElement, setStyle, setAttributes, createStyleSheet, adoptStyleSheets} from './dom_utils.js'


export default doc('DOM Utils', () => {

    text(`
        Low-level DOM helpers for creating and configuring elements.
        Reduces boilerplate when building UI components.
    `)


    section('createElement', () => {

        text(`
            Creates an element with common properties in a single call.
            Accepts tag name, class, text, html, style, and any direct attribute
            like \`id\`, \`type\`, \`value\`, \`placeholder\`, etc.
        `)

        code('Basic usage', () => {
            const div = createElement('div', {class: 'container'})
            const btn = createElement('button', {text: 'Click me', class: 'btn'})
            const input = createElement('input', {type: 'text', placeholder: 'Name'})
        })

        code('With styles and attributes', () => {
            const el = createElement('div', {
                class: 'panel',
                style: {background: '#1a1a2e', padding: '12px'},
                attrs: {'data-role': 'sidebar', 'aria-label': 'Navigation'}
            })
        })

    })


    section('setStyle', () => {

        text('Applies styles to an element. Accepts an object or a CSS string.')

        action('Object syntax', () => {
            const el = createElement('div')
            setStyle(el, {color: 'red', fontSize: '14px'})
            logger.log('color:', el.style.color)
            logger.log('fontSize:', el.style.fontSize)
        })

        action('String syntax', () => {
            const el = createElement('div')
            setStyle(el, 'display:flex;gap:8px;')
            logger.log('cssText:', el.style.cssText)
        })

    })


    section('setAttributes', () => {

        text(`
            Sets HTML attributes on an element.
            Automatically converts camelCase keys to kebab-case.
        `)

        action('Example', () => {
            const el = createElement('div')
            setAttributes(el, {dataValue: '42', ariaHidden: 'true'})
            logger.log('data-value:', el.getAttribute('data-value'))
            logger.log('aria-hidden:', el.getAttribute('aria-hidden'))
        })

    })


    section('Style Sheets', () => {

        text(`
            Helpers for creating and adopting CSS stylesheets.
            Useful for Web Components with shadow DOM.
        `)

        code('createStyleSheet', () => {
            const sheet = createStyleSheet(`
                .panel { background: #1a1a2e; }
                .btn { color: white; }
            `)
        })

        code('adoptStyleSheets', () => {
            const sheet = createStyleSheet('.panel { padding: 12px; }')

            const el = document.createElement('div')
            const shadow = el.attachShadow({mode: 'open'})
            adoptStyleSheets(shadow, sheet)
        })

    })

})
