import Gate from './gate'
import Application from '../application/application'
import GateComponent from '../components/gate_component'
import {vi, beforeEach, describe, test, expect, afterEach} from 'vitest'


// Mock ResizeObserver for tests
global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn()
}))


describe('Gate', () => {
    
    let gate
    let mockContainer
    
    beforeEach(() => {
        document.head.querySelectorAll('style[id$="-styles"]').forEach(style => style.remove())
        document.body.innerHTML = ''

        mockContainer = document.createElement('div')
        mockContainer.id = 'test-container'
        document.body.appendChild(mockContainer)

        gate = new Gate({
            container: mockContainer,
            title: 'Test Gate',
            fadeDuration: 500
        })
    })

    afterEach(() => {
        document.head.querySelectorAll('style[id$="-styles"]').forEach(style => style.remove())
        document.body.innerHTML = ''
        vi.restoreAllMocks()
    })


    test('extends Application', () => {
        expect(gate).toBeInstanceOf(Application)
        expect(gate).toBeInstanceOf(Gate)
    })


    test('default properties', () => {
        const defaultGate = new Gate()
        expect(defaultGate.fadeDuration).toBe(1000)
        expect(defaultGate.title).toBe('Game')
        expect(defaultGate.readyToClose).toBe(false)
    })


    test('custom properties', () => {
        expect(gate.fadeDuration).toBe(500)
        expect(gate.title).toBe('Test Gate')
        expect(gate.readyToClose).toBe(false)
    })


    test('has correct event to action mappings', () => {
        const startSpy = vi.spyOn(gate, 'dispatchAction')
        const closeSpy = vi.spyOn(gate, 'dispatchAction')
        
        gate.emit('start')
        expect(startSpy).toHaveBeenCalledWith('startGate')
        
        gate.emit('control:pressed')
        expect(closeSpy).toHaveBeenCalledWith('closeGate')
    })


    test('startGate action creates and shows gate component', () => {
        gate.dispatchAction('startGate')
        
        expect(gate.gateComponent).toBeInstanceOf(GateComponent)
        expect(gate.gateComponent.title).toBe('Test Gate')
        expect(gate.gateComponent.showInstructions).toBe(false)
        expect(gate.element.contains(gate.gateComponent)).toBe(true)
    })


    test('closeGate action does nothing when not ready', () => {
        gate.dispatchAction('startGate')
        const closedSpy = vi.spyOn(gate, 'emit')
        
        gate.dispatchAction('closeGate')
        
        expect(closedSpy).not.toHaveBeenCalledWith('closed')
        expect(gate.gateComponent).toBeTruthy()
    })


    test('closeGate action hides gate when ready', (done) => {
        gate.dispatchAction('startGate')
        gate.dispatchAction('setReadyToClose')
        
        const closedSpy = vi.spyOn(gate, 'emit')
        
        gate.dispatchAction('closeGate')
        
        expect(closedSpy).toHaveBeenCalledWith('closed')
        expect(gate.gateComponent.style.opacity).toBe('0')
        
        setTimeout(() => {
            expect(gate.gateComponent).toBe(null)
            done()
        }, 600)
    })


    test('setReadyToClose action enables closing and shows instructions', () => {
        gate.dispatchAction('startGate')
        const readySpy = vi.spyOn(gate, 'emit')
        
        gate.dispatchAction('setReadyToClose')
        
        expect(gate.readyToClose).toBe(true)
        expect(gate.gateComponent.showInstructions).toBe(true)
        expect(readySpy).toHaveBeenCalledWith('readyToClose')
    })


    test('notifyPreloadComplete triggers setReadyToClose', () => {
        const actionSpy = vi.spyOn(gate, 'dispatchAction')
        
        gate.notifyPreloadComplete()
        
        expect(actionSpy).toHaveBeenCalledWith('setReadyToClose')
    })


    test('fade transitions use correct duration', () => {
        gate.dispatchAction('startGate')
        
        expect(gate.gateComponent.style.transition).toContain('500ms')
        
        gate.dispatchAction('setReadyToClose')
        gate.dispatchAction('closeGate')
        
        expect(gate.gateComponent.style.transition).toContain('500ms')
    })


    test('gate component fades in on show', (done) => {
        gate.dispatchAction('startGate')
        
        expect(gate.gateComponent.style.opacity).toBe('0')
        
        requestAnimationFrame(() => {
            // Use setTimeout to ensure the opacity change has been applied
            setTimeout(() => {
                expect(gate.gateComponent.style.opacity).toBe('1')
                done()
            }, 10)
        })
    })


    test('complete workflow: start -> ready -> close', (done) => {
        const readySpy = vi.spyOn(gate, 'emit')
        const closedSpy = vi.spyOn(gate, 'emit')
        
        gate.dispatchAction('startGate')
        expect(gate.gateComponent).toBeTruthy()
        expect(gate.gateComponent.showInstructions).toBe(false)
        
        gate.dispatchAction('setReadyToClose')
        expect(gate.readyToClose).toBe(true)
        expect(gate.gateComponent.showInstructions).toBe(true)
        expect(readySpy).toHaveBeenCalledWith('readyToClose')
        
        gate.dispatchAction('closeGate')
        expect(closedSpy).toHaveBeenCalledWith('closed')
        
        setTimeout(() => {
            expect(gate.gateComponent).toBe(null)
            done()
        }, 600)
    })


    test('handles missing gate component gracefully', () => {
        expect(() => {
            gate.dispatchAction('setReadyToClose')
        }).not.toThrow()
        
        expect(() => {
            gate.dispatchAction('closeGate')
        }).not.toThrow()
    })


    test('gate component cleanup on hide', (done) => {
        gate.dispatchAction('startGate')
        gate.dispatchAction('setReadyToClose')
        
        const gateComponent = gate.gateComponent
        expect(gateComponent.parentNode).toBe(gate.element)
        
        gate.dispatchAction('closeGate')
        
        setTimeout(() => {
            expect(gateComponent.parentNode).toBe(null)
            expect(gate.gateComponent).toBe(null)
            done()
        }, 600)
    })

})
