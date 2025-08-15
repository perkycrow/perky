import ActiveWorker from './active_worker'
import {vi} from 'vitest'


// Mock Worker pour les tests
global.Worker = vi.fn().mockImplementation((path, options) => ({
    terminate: vi.fn(),
    path,
    options
}))


describe('ActiveWorker', () => {

    let worker

    afterEach(() => {
        if (worker) {
            worker.stop()
        }
        vi.clearAllMocks()
    })


    test('constructor', () => {
        worker = new ActiveWorker('/test/worker.js')
        
        expect(worker.workerPath).toBe('/test/worker.js')
        expect(worker.worker).toBeNull()
        expect(worker.isStarted).toBe(false)
    })


    test('start', () => {
        worker = new ActiveWorker('/test/worker.js')
        
        const result = worker.start()
        
        expect(result).toBe(worker)
        expect(worker.worker).toBeTruthy()
        expect(worker.isStarted).toBe(true)
        expect(Worker).toHaveBeenCalledWith('/test/worker.js', { type: 'module' })
    })


    test('start twice', () => {
        worker = new ActiveWorker('/test/worker.js')
        
        worker.start()
        const firstWorker = worker.worker
        
        worker.start()
        expect(worker.worker).toBe(firstWorker)
        expect(Worker).toHaveBeenCalledTimes(1)
    })


    test('stop', () => {
        worker = new ActiveWorker('/test/worker.js')
        worker.start()
        
        const mockWorker = worker.worker
        const result = worker.stop()
        
        expect(result).toBe(worker)
        expect(worker.worker).toBeNull()
        expect(worker.isStarted).toBe(false)
        expect(mockWorker.terminate).toHaveBeenCalled()
    })


    test('restart', () => {
        worker = new ActiveWorker('/test/worker.js')
        worker.start()
        const firstWorker = worker.worker
        
        const result = worker.restart()
        
        expect(result).toBe(worker)
        expect(worker.worker).not.toBe(firstWorker)
        expect(worker.isStarted).toBe(true)
        expect(firstWorker.terminate).toHaveBeenCalled()
        expect(Worker).toHaveBeenCalledTimes(2)
    })

})
