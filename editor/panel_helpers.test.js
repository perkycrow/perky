import {describe, test, expect, vi} from 'vitest'
import {createPanelHeader} from './panel_helpers.js'


describe('createPanelHeader', () => {

    test('creates header element', () => {
        const {header} = createPanelHeader({icon: '🎮', title: 'Test'})
        expect(header).toBeInstanceOf(HTMLElement)
        expect(header.className).toBe('panel-header')
    })


    test('displays icon and title', () => {
        const {header} = createPanelHeader({icon: '🎮', title: 'Game'})
        const titleEl = header.querySelector('.panel-title')
        expect(titleEl.textContent).toContain('🎮')
        expect(titleEl.textContent).toContain('Game')
    })


    test('creates buttons container', () => {
        const {header} = createPanelHeader({icon: '🎮', title: 'Test', buttons: []})
        const buttonsEl = header.querySelector('.panel-buttons')
        expect(buttonsEl).not.toBeNull()
    })


    test('creates button elements from config', () => {
        const onClick = vi.fn()
        const {header} = createPanelHeader({
            icon: '🎮',
            title: 'Test',
            buttons: [
                {icon: '↻', title: 'Refresh', onClick}
            ]
        })

        const btn = header.querySelector('.panel-btn')
        expect(btn.textContent).toBe('↻')
        expect(btn.title).toBe('Refresh')
    })


    test('calls button onClick handler', () => {
        const onClick = vi.fn()
        const {header} = createPanelHeader({
            icon: '🎮',
            title: 'Test',
            buttons: [
                {icon: '↻', title: 'Refresh', onClick}
            ]
        })

        const btn = header.querySelector('.panel-btn')
        btn.click()

        expect(onClick).toHaveBeenCalled()
    })


    test('stops propagation on button click', () => {
        const headerHandler = vi.fn()
        const buttonHandler = vi.fn()

        const {header} = createPanelHeader({
            icon: '🎮',
            title: 'Test',
            buttons: [
                {icon: '↻', title: 'Refresh', onClick: buttonHandler}
            ],
            onClick: headerHandler
        })

        const btn = header.querySelector('.panel-btn')
        btn.click()

        expect(buttonHandler).toHaveBeenCalled()
        expect(headerHandler).not.toHaveBeenCalled()
    })


    test('returns button refs by id', () => {
        const {buttons} = createPanelHeader({
            icon: '🎮',
            title: 'Test',
            buttons: [
                {id: 'refresh', icon: '↻', title: 'Refresh', onClick: () => {}},
                {id: 'close', icon: '✕', title: 'Close', onClick: () => {}}
            ]
        })

        expect(buttons.refresh).toBeInstanceOf(HTMLElement)
        expect(buttons.close).toBeInstanceOf(HTMLElement)
    })


    test('attaches onClick handler to header', () => {
        const onClick = vi.fn()
        const {header} = createPanelHeader({
            icon: '🎮',
            title: 'Test',
            onClick
        })

        header.click()

        expect(onClick).toHaveBeenCalled()
    })

})
