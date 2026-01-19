import {describe, it, expect, beforeEach} from 'vitest'
import './panel.js'


describe('Panel', () => {

    let panel

    beforeEach(() => {
        panel = document.createElement('editor-panel')
        document.body.appendChild(panel)
    })


    it('creates component with shadow DOM', () => {
        expect(panel.shadowRoot).toBeTruthy()
    })


    it('has header and content elements', () => {
        const header = panel.shadowRoot.querySelector('.panel-header')
        const content = panel.shadowRoot.querySelector('.panel-content')

        expect(header).toBeTruthy()
        expect(content).toBeTruthy()
    })


    it('sets title via property', () => {
        panel.title = 'Test Panel'
        const titleEl = panel.shadowRoot.querySelector('.panel-title')
        expect(titleEl.textContent).toBe('Test Panel')
    })


    it('sets title via attribute', () => {
        panel.setAttribute('title', 'Attribute Title')
        const titleEl = panel.shadowRoot.querySelector('.panel-title')
        expect(titleEl.textContent).toBe('Attribute Title')
    })


    it('toggles collapsed state', () => {
        expect(panel.collapsed).toBe(false)

        panel.toggle()
        expect(panel.collapsed).toBe(true)
        expect(panel.hasAttribute('collapsed')).toBe(true)

        panel.toggle()
        expect(panel.collapsed).toBe(false)
        expect(panel.hasAttribute('collapsed')).toBe(false)
    })


    it('sets collapsed via property', () => {
        panel.collapsed = true
        expect(panel.hasAttribute('collapsed')).toBe(true)

        panel.collapsed = false
        expect(panel.hasAttribute('collapsed')).toBe(false)
    })


    it('sets floating via property', () => {
        expect(panel.floating).toBe(false)

        panel.floating = true
        expect(panel.hasAttribute('floating')).toBe(true)
        expect(panel.floating).toBe(true)

        panel.floating = false
        expect(panel.hasAttribute('floating')).toBe(false)
    })


    it('emits close event when close button is clicked', () => {
        let eventFired = false
        panel.addEventListener('close', () => {
            eventFired = true
        })

        const buttons = panel.shadowRoot.querySelectorAll('.panel-btn')
        const closeBtn = buttons[buttons.length - 1]
        closeBtn.click()

        expect(eventFired).toBe(true)
    })


    it('toggles when collapse button is clicked', () => {
        const collapseBtn = panel.shadowRoot.querySelector('.panel-btn')
        expect(panel.collapsed).toBe(false)

        collapseBtn.click()
        expect(panel.collapsed).toBe(true)

        collapseBtn.click()
        expect(panel.collapsed).toBe(false)
    })


    it('updates collapse icon based on state', () => {
        const collapseBtn = panel.shadowRoot.querySelector('.panel-btn')

        expect(collapseBtn.innerHTML).toBe('−')

        panel.collapsed = true
        expect(collapseBtn.innerHTML).toBe('+')

        panel.collapsed = false
        expect(collapseBtn.innerHTML).toBe('−')
    })


    it('has default slot for content', () => {
        const slot = panel.shadowRoot.querySelector('.panel-content slot')
        expect(slot).toBeTruthy()
    })

})
