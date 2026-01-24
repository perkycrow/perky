import {describe, test, expect, beforeEach} from 'vitest'
import './tab_bar.js'


describe('TabBar', () => {

    let tabBar

    beforeEach(() => {
        tabBar = document.createElement('tab-bar')
        document.body.appendChild(tabBar)
    })


    test('creates component with shadow DOM', () => {
        expect(tabBar.shadowRoot).toBeTruthy()
    })


    test('sets tabs programmatically', () => {
        tabBar.setTabs([
            {value: 'a', label: 'Tab A'},
            {value: 'b', label: 'Tab B'}
        ])

        const buttons = tabBar.shadowRoot.querySelectorAll('.tab')
        expect(buttons.length).toBe(2)
        expect(buttons[0].textContent).toBe('Tab A')
        expect(buttons[1].textContent).toBe('Tab B')
    })


    test('sets value via property', () => {
        tabBar.setTabs([
            {value: 'a', label: 'Tab A'},
            {value: 'b', label: 'Tab B'}
        ])
        tabBar.value = 'b'

        expect(tabBar.value).toBe('b')
        expect(tabBar.getAttribute('value')).toBe('b')
    })


    test('sets value via attribute', () => {
        tabBar.setTabs([
            {value: 'a', label: 'Tab A'},
            {value: 'b', label: 'Tab B'}
        ])
        tabBar.setAttribute('value', 'a')

        expect(tabBar.value).toBe('a')
    })


    test('marks active tab', () => {
        tabBar.setTabs([
            {value: 'a', label: 'Tab A'},
            {value: 'b', label: 'Tab B'}
        ])
        tabBar.value = 'b'

        const buttons = tabBar.shadowRoot.querySelectorAll('.tab')
        expect(buttons[0].classList.contains('active')).toBe(false)
        expect(buttons[1].classList.contains('active')).toBe(true)
    })


    test('emits change event when tab is clicked', () => {
        tabBar.setTabs([
            {value: 'a', label: 'Tab A'},
            {value: 'b', label: 'Tab B'}
        ])
        tabBar.value = 'a'

        let eventValue = null
        tabBar.addEventListener('change', (e) => {
            eventValue = e.detail.value
        })

        const buttons = tabBar.shadowRoot.querySelectorAll('.tab')
        buttons[1].click()

        expect(eventValue).toBe('b')
        expect(tabBar.value).toBe('b')
    })


    test('does not emit change when clicking active tab', () => {
        tabBar.setTabs([
            {value: 'a', label: 'Tab A'},
            {value: 'b', label: 'Tab B'}
        ])
        tabBar.value = 'a'

        let eventCount = 0
        tabBar.addEventListener('change', () => {
            eventCount++
        })

        const buttons = tabBar.shadowRoot.querySelectorAll('.tab')
        buttons[0].click()

        expect(eventCount).toBe(0)
    })


    test('has slot for custom tab content', () => {
        const slot = tabBar.shadowRoot.querySelector('slot[name="tab"]')
        expect(slot).toBeTruthy()
    })

})
