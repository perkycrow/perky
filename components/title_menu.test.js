import TitleMenu from './title_menu'
import PerkyComponent from './perky_component'
import {vi, beforeEach, describe, test, expect, afterEach} from 'vitest'


describe('TitleMenu', () => {
    
    let titleMenu
    
    beforeEach(() => {
        document.head.querySelectorAll('style[id$="-styles"]').forEach(style => style.remove())
        document.body.innerHTML = ''

        TitleMenu.styleUsageCount = 0
        
        titleMenu = new TitleMenu()
    })

    afterEach(() => {
        document.head.querySelectorAll('style[id$="-styles"]').forEach(style => style.remove())
        document.body.innerHTML = ''
        vi.restoreAllMocks()
    })


    test('extends PerkyComponent', () => {
        expect(titleMenu).toBeInstanceOf(PerkyComponent)
        expect(titleMenu).toBeInstanceOf(TitleMenu)
    })


    test('static properties are correctly defined', () => {
        expect(TitleMenu.tagName).toBe('title-menu')
        expect(TitleMenu.css).toContain('title-menu {')
    })


    test('default properties', () => {
        expect(titleMenu.gameTitle).toBe('Game')
        expect(titleMenu.menuItems).toEqual([])
    })


    test('gameTitle property is reactive', async () => {
        titleMenu.gameTitle = 'Test Game'
        document.body.appendChild(titleMenu)
        
        await titleMenu.updateComplete
        
        const titleElement = titleMenu.querySelector('.game-title')
        expect(titleElement.textContent).toBe('Test Game')
    })


    test('addButton method adds menu item', () => {
        const result = titleMenu.addButton({
            label: 'Start Game',
            action: 'start',
            cssClass: 'primary'
        })
        
        expect(titleMenu.menuItems).toHaveLength(1)
        expect(titleMenu.menuItems[0]).toEqual({
            label: 'Start Game',
            action: 'start',
            cssClass: 'primary'
        })
        expect(result).toBe(titleMenu)
    })


    test('addButton without cssClass', () => {
        titleMenu.addButton({
            label: 'Options',
            action: 'options'
        })
        
        expect(titleMenu.menuItems[0]).toEqual({
            label: 'Options',
            action: 'options',
            cssClass: undefined
        })
    })


    test('clearButtons method clears all menu items', () => {
        titleMenu.addButton({label: 'Test 1', action: 'test1'})
        titleMenu.addButton({label: 'Test 2', action: 'test2'})
        
        expect(titleMenu.menuItems).toHaveLength(2)
        
        const result = titleMenu.clearButtons()
        
        expect(titleMenu.menuItems).toHaveLength(0)
        expect(result).toBe(titleMenu)
    })


    test('renders menu items correctly', async () => {
        titleMenu.gameTitle = 'My Game'
        titleMenu.addButton({label: 'New Game', action: 'new-game', cssClass: 'primary'})
        titleMenu.addButton({label: 'Load Game', action: 'load-game'})
        
        document.body.appendChild(titleMenu)
        await titleMenu.updateComplete
        
        const titleElement = titleMenu.querySelector('.game-title')
        expect(titleElement.textContent).toBe('My Game')
        
        const buttons = titleMenu.querySelectorAll('.menu-button')
        expect(buttons).toHaveLength(2)
        
        expect(buttons[0].textContent.trim()).toBe('New Game')
        expect(buttons[0].classList.contains('primary')).toBe(true)
        
        expect(buttons[1].textContent.trim()).toBe('Load Game')
        expect(buttons[1].classList.contains('menu-button')).toBe(true)
    })


    test('button click dispatches menu:action event', async () => {
        titleMenu.addButton({label: 'Test Button', action: 'test-action'})
        
        document.body.appendChild(titleMenu)
        await titleMenu.updateComplete
        
        const eventSpy = vi.fn()
        titleMenu.addEventListener('menu:action', eventSpy)
        
        const button = titleMenu.querySelector('.menu-button')
        button.click()
        
        expect(eventSpy).toHaveBeenCalledWith(
            expect.objectContaining({
                type: 'menu:action',
                detail: {action: 'test-action'},
                bubbles: true
            })
        )
    })


    test('handleAction method dispatches correct event', () => {
        const eventSpy = vi.fn()
        titleMenu.addEventListener('menu:action', eventSpy)
        
        titleMenu.handleAction('test-action')
        
        expect(eventSpy).toHaveBeenCalledWith(
            expect.objectContaining({
                type: 'menu:action',
                detail: {action: 'test-action'},
                bubbles: true
            })
        )
    })


    test('renders empty menu when no items', async () => {
        titleMenu.gameTitle = 'Empty Menu'
        
        document.body.appendChild(titleMenu)
        await titleMenu.updateComplete
        
        const titleElement = titleMenu.querySelector('.game-title')
        expect(titleElement.textContent).toBe('Empty Menu')
        
        const buttons = titleMenu.querySelectorAll('.menu-button')
        expect(buttons).toHaveLength(0)
    })


    test('method chaining works correctly', () => {
        const result = titleMenu
            .addButton({label: 'Button 1', action: 'action1'})
            .addButton({label: 'Button 2', action: 'action2'})
            .clearButtons()
            .addButton({label: 'Button 3', action: 'action3'})
        
        expect(result).toBe(titleMenu)
        expect(titleMenu.menuItems).toHaveLength(1)
        expect(titleMenu.menuItems[0].label).toBe('Button 3')
    })


    test('CSS injection works through PerkyComponent', () => {
        document.body.appendChild(titleMenu)
        
        const styleElement = document.getElementById('title-menu-styles')
        expect(styleElement).toBeTruthy()
        expect(TitleMenu.styleUsageCount).toBe(1)
    })


    test('multiple instances share styles correctly', () => {
        const menu1 = new TitleMenu()
        const menu2 = new TitleMenu()
        
        document.body.appendChild(menu1)
        document.body.appendChild(menu2)
        
        const styleElements = document.querySelectorAll('#title-menu-styles')
        expect(styleElements).toHaveLength(1)
        expect(TitleMenu.styleUsageCount).toBe(2)
        
        document.body.removeChild(menu1)
        expect(TitleMenu.styleUsageCount).toBe(1)
        expect(document.getElementById('title-menu-styles')).toBeTruthy()
        
        document.body.removeChild(menu2)
        expect(TitleMenu.styleUsageCount).toBe(0)
        expect(document.getElementById('title-menu-styles')).toBeFalsy()
    })


    test('requestUpdate is called when adding buttons', () => {
        const updateSpy = vi.spyOn(titleMenu, 'requestUpdate')
        
        titleMenu.addButton({label: 'Test', action: 'test'})
        
        expect(updateSpy).toHaveBeenCalled()
    })


    test('requestUpdate is called when clearing buttons', () => {
        titleMenu.addButton({label: 'Test', action: 'test'})
        
        const updateSpy = vi.spyOn(titleMenu, 'requestUpdate')
        titleMenu.clearButtons()
        
        expect(updateSpy).toHaveBeenCalled()
    })


    test('custom element is properly defined', () => {
        expect(customElements.get('title-menu')).toBe(TitleMenu)
    })

})
