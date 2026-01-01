import ServiceClient from './service_client.js'
import {vi} from 'vitest'


describe('ServiceClient.fromWorker', () => {

    test('fromWorker creates client with worker', () => {
        const mockWorker = {
            postMessage: vi.fn(),
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
            terminate: vi.fn()
        }
        
        global.Worker = vi.fn(() => mockWorker)
        
        const client = ServiceClient.fromWorker('./test-service.js')
        
        expect(global.Worker).toHaveBeenCalledWith(expect.any(URL), {type: 'module'})
        expect(global.Worker.mock.calls[0][0].href).toContain('service_worker.js')
        expect(mockWorker.postMessage).toHaveBeenCalledWith({
            type: 'init-service',
            servicePath: './test-service.js',
            config: {}
        })
        expect(client).toBeInstanceOf(ServiceClient)
    })


    test('fromWorker with config', () => {
        const mockWorker = {
            postMessage: vi.fn(),
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
            terminate: vi.fn()
        }
        
        global.Worker = vi.fn(() => mockWorker)
        
        const config = {setting1: 'value1', setting2: 42}
        ServiceClient.fromWorker('./test-service.js', config)
        
        expect(mockWorker.postMessage).toHaveBeenCalledWith({
            type: 'init-service',
            servicePath: './test-service.js',
            config
        })
    })


    test('service worker message handling', async () => {
        const mockSelf = {
            addEventListener: vi.fn(),
            console: {error: vi.fn()}
        }
        
        global.self = mockSelf
        global.console = mockSelf.console

        await import('./service_worker.js')
        
        expect(mockSelf.addEventListener).toHaveBeenCalledWith('message', expect.any(Function))
    })

})
