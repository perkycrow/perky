import WorkerHost from './worker_host'
import {vi} from 'vitest'


// Mock self et postMessage pour les tests
global.self = {
    onmessage: null,
    postMessage: vi.fn()
}


describe('WorkerHost', () => {

    let host

    beforeEach(() => {
        host = new WorkerHost()
        vi.clearAllMocks()
    })


    test('constructor', () => {
        expect(host).toBeInstanceOf(WorkerHost)
        expect(typeof self.onmessage).toBe('function')
    })


    test('send', () => {
        host.send('test', {message: 'hello'})
        
        expect(self.postMessage).toHaveBeenCalledWith({
            action: 'test',
            data: {message: 'hello'}
        })
    })


    test('receive message and emit event', () => {
        const listener = vi.fn()
        host.on('testAction', listener)
        
        // Simuler un message reçu
        const event = {
            data: {
                action: 'testAction',
                data: {value: 42}
            }
        }
        
        self.onmessage(event)
        
        expect(listener).toHaveBeenCalledWith({value: 42})
    })


    test('message listener setup', () => {
        const newHost = new WorkerHost()
        expect(typeof self.onmessage).toBe('function')
    })

})
