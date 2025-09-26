import PerkyGate from './perky_gate'
import PerkyComponent from '../../application/perky_component'
import {vi, beforeEach, describe, test, expect, afterEach} from 'vitest'


describe('PerkyGate', () => {
    
    let perkyGate
    
    beforeEach(() => {
        document.head.querySelectorAll('style[id$="-styles"]').forEach(style => style.remove())
        document.body.innerHTML = ''

        PerkyGate.styleUsageCount = 0
        
        perkyGate = new PerkyGate()
    })

    afterEach(() => {
        document.head.querySelectorAll('style[id$="-styles"]').forEach(style => style.remove())
        document.body.innerHTML = ''
        vi.restoreAllMocks()
    })


    test('extends PerkyComponent', () => {
        expect(perkyGate).toBeInstanceOf(PerkyComponent)
        expect(perkyGate).toBeInstanceOf(PerkyGate)
    })


    test('static properties are correctly defined', () => {
        expect(PerkyGate.tagName).toBe('perky-gate')
        expect(PerkyGate.css).toContain('perky-gate {')
    })


    test('default properties', () => {
        expect(perkyGate.title).toBe('Game')
        expect(perkyGate.showInstructions).toBe(false)
    })


    test('title property is reactive', async () => {
        perkyGate.title = 'Test Game'
        document.body.appendChild(perkyGate)
        
        await perkyGate.updateComplete
        
        const titleElement = perkyGate.querySelector('.gate-title')
        expect(titleElement.textContent).toBe('Test Game')
    })


    test('renders title correctly', async () => {
        perkyGate.title = 'My Game'
        
        document.body.appendChild(perkyGate)
        await perkyGate.updateComplete
        
        const titleElement = perkyGate.querySelector('.gate-title')
        expect(titleElement.textContent).toBe('My Game')
    })


    test('shows instructions when showInstructions is true', async () => {
        perkyGate.showInstructions = true
        
        document.body.appendChild(perkyGate)
        await perkyGate.updateComplete
        
        const instructionsElement = perkyGate.querySelector('.gate-instructions')
        expect(instructionsElement).toBeTruthy()
        expect(instructionsElement.textContent).toBe('Press any key to start')
    })


    test('hides instructions when showInstructions is false', async () => {
        perkyGate.showInstructions = false
        
        document.body.appendChild(perkyGate)
        await perkyGate.updateComplete
        
        const instructionsElement = perkyGate.querySelector('.gate-instructions')
        expect(instructionsElement).toBeFalsy()
    })


    test('toggles instructions visibility', async () => {
        document.body.appendChild(perkyGate)
        await perkyGate.updateComplete
        
        expect(perkyGate.querySelector('.gate-instructions')).toBeFalsy()
        
        perkyGate.showInstructions = true
        await perkyGate.updateComplete
        
        expect(perkyGate.querySelector('.gate-instructions')).toBeTruthy()
        
        perkyGate.showInstructions = false
        await perkyGate.updateComplete
        
        expect(perkyGate.querySelector('.gate-instructions')).toBeFalsy()
    })


    test('CSS injection works through PerkyComponent', () => {
        document.body.appendChild(perkyGate)
        
        const styleElement = document.getElementById('perky-gate-styles')
        expect(styleElement).toBeTruthy()
        expect(PerkyGate.styleUsageCount).toBe(1)
    })


    test('multiple instances share styles correctly', () => {
        const gate1 = new PerkyGate()
        const gate2 = new PerkyGate()
        
        document.body.appendChild(gate1)
        document.body.appendChild(gate2)
        
        const styleElements = document.querySelectorAll('#perky-gate-styles')
        expect(styleElements).toHaveLength(1)
        expect(PerkyGate.styleUsageCount).toBe(2)
        
        document.body.removeChild(gate1)
        expect(PerkyGate.styleUsageCount).toBe(1)
        expect(document.getElementById('perky-gate-styles')).toBeTruthy()
        
        document.body.removeChild(gate2)
        expect(PerkyGate.styleUsageCount).toBe(0)
        expect(document.getElementById('perky-gate-styles')).toBeFalsy()
    })


    test('custom element is properly defined', () => {
        expect(customElements.get('perky-gate')).toBe(PerkyGate)
    })

})
