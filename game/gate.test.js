import Gate from './gate'
import Application from '../application/application'
import PerkyGate from './components/perky_gate'
import {vi, beforeEach, describe, test, expect, afterEach} from 'vitest'


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
        
        expect(gate.perkyGate).toBeInstanceOf(PerkyGate)
        expect(gate.perkyGate.title).toBe('Test Gate')
        expect(gate.perkyGate.showInstructions).toBe(false)
        expect(gate.element.contains(gate.perkyGate)).toBe(true)
    })


    test('closeGate action does nothing when not ready', () => {
        gate.dispatchAction('startGate')
        const closedSpy = vi.spyOn(gate, 'emit')
        
        gate.dispatchAction('closeGate')
        
        expect(closedSpy).not.toHaveBeenCalledWith('closed')
        expect(gate.perkyGate).toBeTruthy()
    })


    test('closeGate action hides gate when ready', (done) => {
        gate.dispatchAction('startGate')
        gate.dispatchAction('setReadyToClose')
        
        const closedSpy = vi.spyOn(gate, 'emit')
        
        gate.dispatchAction('closeGate')
        
        expect(gate.perkyGate.style.opacity).toBe('0')
        
        setTimeout(() => {
            expect(closedSpy).toHaveBeenCalledWith('closed')
            expect(gate.perkyGate).toBe(null)
            done()
        }, 600)
    })


    test('setReadyToClose action enables closing and shows instructions', () => {
        gate.dispatchAction('startGate')
        const readySpy = vi.spyOn(gate, 'emit')
        
        gate.dispatchAction('setReadyToClose')
        
        expect(gate.readyToClose).toBe(true)
        expect(gate.perkyGate.showInstructions).toBe(true)
        expect(readySpy).toHaveBeenCalledWith('readyToClose')
    })

    
    test('fade transitions use correct duration', () => {
        gate.dispatchAction('startGate')
        
        expect(gate.perkyGate.style.transition).toContain('500ms')
        
        gate.dispatchAction('setReadyToClose')
        gate.dispatchAction('closeGate')
        
        expect(gate.perkyGate.style.transition).toContain('500ms')
    })


    test('gate component fades in on show', (done) => {
        gate.dispatchAction('startGate')
        
        expect(gate.perkyGate.style.opacity).toBe('0')
        
        setTimeout(() => {
            expect(gate.perkyGate.style.opacity).toBe('1')
            done()
        }, 50)
    })


    test('complete workflow: start -> ready -> close', (done) => {
        const readySpy = vi.spyOn(gate, 'emit')
        const closedSpy = vi.spyOn(gate, 'emit')
        
        gate.dispatchAction('startGate')
        expect(gate.perkyGate).toBeTruthy()
        expect(gate.perkyGate.showInstructions).toBe(false)
        
        gate.dispatchAction('setReadyToClose')
        expect(gate.readyToClose).toBe(true)
        expect(gate.perkyGate.showInstructions).toBe(true)
        expect(readySpy).toHaveBeenCalledWith('readyToClose')
        
        gate.dispatchAction('closeGate')
        
        setTimeout(() => {
            expect(closedSpy).toHaveBeenCalledWith('closed')
            expect(gate.perkyGate).toBe(null)
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
        
        const perkyGate = gate.perkyGate
        expect(perkyGate.parentNode).toBe(gate.element)
        
        gate.dispatchAction('closeGate')
        
        setTimeout(() => {
            expect(perkyGate.parentNode).toBe(null)
            expect(gate.perkyGate).toBe(null)
            done()
        }, 600)
    })

})
