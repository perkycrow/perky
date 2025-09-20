import GateComponent from './gate_component'
import PerkyComponent from './perky_component'
import {vi, beforeEach, describe, test, expect, afterEach} from 'vitest'


describe('GateComponent', () => {
    
    let gateComponent
    
    beforeEach(() => {
        document.head.querySelectorAll('style[id$="-styles"]').forEach(style => style.remove())
        document.body.innerHTML = ''

        GateComponent.styleUsageCount = 0
        
        gateComponent = new GateComponent()
    })

    afterEach(() => {
        document.head.querySelectorAll('style[id$="-styles"]').forEach(style => style.remove())
        document.body.innerHTML = ''
        vi.restoreAllMocks()
    })


    test('extends PerkyComponent', () => {
        expect(gateComponent).toBeInstanceOf(PerkyComponent)
        expect(gateComponent).toBeInstanceOf(GateComponent)
    })


    test('static properties are correctly defined', () => {
        expect(GateComponent.tagName).toBe('gate-component')
        expect(GateComponent.css).toContain('gate-component {')
    })


    test('default properties', () => {
        expect(gateComponent.title).toBe('Game')
        expect(gateComponent.showInstructions).toBe(false)
    })


    test('title property is reactive', async () => {
        gateComponent.title = 'Test Game'
        document.body.appendChild(gateComponent)
        
        await gateComponent.updateComplete
        
        const titleElement = gateComponent.querySelector('.gate-title')
        expect(titleElement.textContent).toBe('Test Game')
    })


    test('renders title correctly', async () => {
        gateComponent.title = 'My Game'
        
        document.body.appendChild(gateComponent)
        await gateComponent.updateComplete
        
        const titleElement = gateComponent.querySelector('.gate-title')
        expect(titleElement.textContent).toBe('My Game')
    })


    test('shows instructions when showInstructions is true', async () => {
        gateComponent.showInstructions = true
        
        document.body.appendChild(gateComponent)
        await gateComponent.updateComplete
        
        const instructionsElement = gateComponent.querySelector('.gate-instructions')
        expect(instructionsElement).toBeTruthy()
        expect(instructionsElement.textContent).toBe('Press any key to start')
    })


    test('hides instructions when showInstructions is false', async () => {
        gateComponent.showInstructions = false
        
        document.body.appendChild(gateComponent)
        await gateComponent.updateComplete
        
        const instructionsElement = gateComponent.querySelector('.gate-instructions')
        expect(instructionsElement).toBeFalsy()
    })


    test('toggles instructions visibility', async () => {
        document.body.appendChild(gateComponent)
        await gateComponent.updateComplete
        
        expect(gateComponent.querySelector('.gate-instructions')).toBeFalsy()
        
        gateComponent.showInstructions = true
        await gateComponent.updateComplete
        
        expect(gateComponent.querySelector('.gate-instructions')).toBeTruthy()
        
        gateComponent.showInstructions = false
        await gateComponent.updateComplete
        
        expect(gateComponent.querySelector('.gate-instructions')).toBeFalsy()
    })


    test('CSS injection works through PerkyComponent', () => {
        document.body.appendChild(gateComponent)
        
        const styleElement = document.getElementById('gate-component-styles')
        expect(styleElement).toBeTruthy()
        expect(GateComponent.styleUsageCount).toBe(1)
    })


    test('multiple instances share styles correctly', () => {
        const gate1 = new GateComponent()
        const gate2 = new GateComponent()
        
        document.body.appendChild(gate1)
        document.body.appendChild(gate2)
        
        const styleElements = document.querySelectorAll('#gate-component-styles')
        expect(styleElements).toHaveLength(1)
        expect(GateComponent.styleUsageCount).toBe(2)
        
        document.body.removeChild(gate1)
        expect(GateComponent.styleUsageCount).toBe(1)
        expect(document.getElementById('gate-component-styles')).toBeTruthy()
        
        document.body.removeChild(gate2)
        expect(GateComponent.styleUsageCount).toBe(0)
        expect(document.getElementById('gate-component-styles')).toBeFalsy()
    })


    test('custom element is properly defined', () => {
        expect(customElements.get('gate-component')).toBe(GateComponent)
    })

})
