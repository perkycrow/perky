import FpsCounter from './fps_counter'
import {vi, beforeEach, describe, test, expect, afterEach} from 'vitest'


describe('FpsCounter', () => {
    let fpsCounter
    let mockGameLoop
    let mockCtx

    beforeEach(() => {
        global.ResizeObserver = vi.fn().mockImplementation(() => ({
            observe: vi.fn(),
            unobserve: vi.fn(),
            disconnect: vi.fn()
        }))

        mockCtx = {
            clearRect: vi.fn(),
            fillRect: vi.fn(),
            beginPath: vi.fn(),
            moveTo: vi.fn(),
            lineTo: vi.fn(),
            stroke: vi.fn(),
            fillStyle: '',
            strokeStyle: ''
        }

        HTMLCanvasElement.prototype.getContext = vi.fn(() => mockCtx)

        mockGameLoop = {
            on: vi.fn(),
            removeListenersFor: vi.fn()
        }

        fpsCounter = new FpsCounter()
        document.body.appendChild(fpsCounter.element)
    })


    afterEach(() => {
        vi.restoreAllMocks()
        document.body.innerHTML = ''
        delete global.ResizeObserver
        delete HTMLCanvasElement.prototype.getContext
    })


    test('constructor initializes with default options', () => {
        expect(fpsCounter.options.position).toBe('top-left')
        expect(fpsCounter.options.history).toBe(60)
        expect(fpsCounter.options.width).toBe(80)
        expect(fpsCounter.options.height).toBe(48)
        expect(fpsCounter.fpsData).toHaveLength(60)
        expect(fpsCounter.canvas.width).toBe(80)
        expect(fpsCounter.canvas.height).toBe(48)
        expect(fpsCounter.fpsCounter.classList.contains('perky-fps-top-left')).toBe(true)
    })


    test('constructor accepts custom options', () => {
        const customOptions = {
            position: 'bottom-right',
            history: 30,
            width: 100,
            height: 60
        }

        const customCounter = new FpsCounter({
            options: customOptions
        })

        expect(customCounter.options.position).toBe('bottom-right')
        expect(customCounter.options.history).toBe(30)
        expect(customCounter.options.width).toBe(100)
        expect(customCounter.options.height).toBe(60)
        expect(customCounter.fpsData).toHaveLength(30)
        expect(customCounter.canvas.width).toBe(100)
        expect(customCounter.canvas.height).toBe(60)
        expect(customCounter.fpsCounter.classList.contains('perky-fps-bottom-right')).toBe(true)
    })


    test('constructor with gameLoop starts monitoring', () => {
        new FpsCounter({
            gameLoop: mockGameLoop
        })

        expect(mockGameLoop.on).toHaveBeenCalledWith('render', expect.any(Function))
    })


    test('setPosition changes the position class', () => {
        expect(fpsCounter.fpsCounter.classList.contains('perky-fps-top-left')).toBe(true)
        
        fpsCounter.setPosition('bottom-right')
        
        expect(fpsCounter.options.position).toBe('bottom-right')
        expect(fpsCounter.fpsCounter.classList.contains('perky-fps-top-left')).toBe(false)
        expect(fpsCounter.fpsCounter.classList.contains('perky-fps-bottom-right')).toBe(true)
    })


    test('startMonitoring returns false when no gameLoop is present', () => {
        expect(fpsCounter.gameLoop).toBeUndefined()
        
        const result = fpsCounter.startMonitoring()
        
        expect(result).toBe(false)
    })


    test('startMonitoring returns true and registers listener when gameLoop is present', () => {
        fpsCounter.gameLoop = mockGameLoop
        
        const result = fpsCounter.startMonitoring()
        
        expect(result).toBe(true)
        expect(mockGameLoop.on).toHaveBeenCalledWith('render', expect.any(Function))
    })


    test('setGameLoop removes listeners from old gameLoop and adds to new one', () => {
        const oldGameLoop = {
            on: vi.fn(),
            removeListenersFor: vi.fn()
        }
        
        fpsCounter.gameLoop = oldGameLoop
        fpsCounter.setGameLoop(mockGameLoop)
        
        expect(oldGameLoop.removeListenersFor).toHaveBeenCalledWith('render', fpsCounter.onRender)
        expect(mockGameLoop.on).toHaveBeenCalledWith('render', expect.any(Function))
        expect(fpsCounter.gameLoop).toBe(mockGameLoop)
    })


    test('updateDisplay sets the correct text and color class', () => {
        // Test good FPS
        fpsCounter.updateDisplay(60)
        
        expect(fpsCounter.fpsElement.textContent).toBe('60')
        expect(fpsCounter.fpsElement.classList.contains('perky-fps-good')).toBe(true)
        expect(fpsCounter.fpsElement.classList.contains('perky-fps-ok')).toBe(false)
        expect(fpsCounter.fpsElement.classList.contains('perky-fps-bad')).toBe(false)
        
        // Test ok FPS
        fpsCounter.updateDisplay(40)
        
        expect(fpsCounter.fpsElement.textContent).toBe('40')
        expect(fpsCounter.fpsElement.classList.contains('perky-fps-good')).toBe(false)
        expect(fpsCounter.fpsElement.classList.contains('perky-fps-ok')).toBe(true)
        expect(fpsCounter.fpsElement.classList.contains('perky-fps-bad')).toBe(false)
        
        // Test bad FPS
        fpsCounter.updateDisplay(20)
        
        expect(fpsCounter.fpsElement.textContent).toBe('20')
        expect(fpsCounter.fpsElement.classList.contains('perky-fps-good')).toBe(false)
        expect(fpsCounter.fpsElement.classList.contains('perky-fps-ok')).toBe(false)
        expect(fpsCounter.fpsElement.classList.contains('perky-fps-bad')).toBe(true)
    })


    test('onRender updates fpsData and calls other methods', () => {
        vi.spyOn(fpsCounter, 'updateDisplay')
        vi.spyOn(fpsCounter, 'drawGraph')
        
        fpsCounter.fpsData = [0, 0, 0]
        fpsCounter.onRender(0, 50)
        
        expect(fpsCounter.fpsData).toEqual([0, 0, 50])
        expect(fpsCounter.updateDisplay).toHaveBeenCalledWith(50)
        expect(fpsCounter.drawGraph).toHaveBeenCalled()
    })


    test('clearGraph clears the canvas context', () => {
        fpsCounter.clearGraph()
        
        expect(mockCtx.clearRect).toHaveBeenCalledWith(0, 0, fpsCounter.canvas.width, fpsCounter.canvas.height)
    })


    test('drawGraph calls clearGraph and drawLine', () => {
        vi.spyOn(fpsCounter, 'clearGraph')
        vi.spyOn(fpsCounter, 'drawLine')
        
        fpsCounter.drawGraph()
        
        expect(fpsCounter.clearGraph).toHaveBeenCalled()
        expect(mockCtx.fillRect).toHaveBeenCalledWith(0, 0, fpsCounter.canvas.width, fpsCounter.canvas.height)
        expect(fpsCounter.drawLine).toHaveBeenCalledWith(fpsCounter.fpsData, '#4CAF50', 100)
    })


    test('drawLine does nothing when ctx is not available', () => {
        const tempCtx = fpsCounter.ctx
        fpsCounter.ctx = null
        
        // Should not throw an error
        fpsCounter.drawLine([], '#000', 100)
        
        fpsCounter.ctx = tempCtx
    })


    test('drawLine draws path on canvas', () => {
        const testData = [30, 60, 90]
        fpsCounter.drawLine(testData, '#ff0000', 100)
        
        expect(mockCtx.beginPath).toHaveBeenCalled()
        expect(mockCtx.moveTo).toHaveBeenCalledTimes(1)
        expect(mockCtx.lineTo).toHaveBeenCalledTimes(2)
        expect(mockCtx.stroke).toHaveBeenCalled()
        expect(mockCtx.strokeStyle).toBe('#ff0000')
    })

})
