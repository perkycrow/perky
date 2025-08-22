import ServiceRequest from './service_request'


describe(ServiceRequest, () => {

    test('constructor', () => {
        const request = new ServiceRequest('testAction', {param1: 'value1'})
        
        expect(request.action).toBe('testAction')
        expect(request.params).toEqual({param1: 'value1'})
        expect(request.id).toBeDefined()
        expect(typeof request.id).toBe('string')
        expect(request.timestamp).toBeDefined()
        expect(typeof request.timestamp).toBe('number')
    })


    test('constructor with no params', () => {
        const request = new ServiceRequest('testAction')
        
        expect(request.action).toBe('testAction')
        expect(request.params).toEqual({})
        expect(request.id).toBeDefined()
        expect(request.timestamp).toBeDefined()
    })


    test('unique ids', () => {
        const request1 = new ServiceRequest('action1')
        const request2 = new ServiceRequest('action2')
        
        expect(request1.id).not.toBe(request2.id)
    })


    test('export', () => {
        const request = new ServiceRequest('testAction', {param1: 'value1'})
        const json = request.export()
        
        expect(json).toEqual({
            id: request.id,
            action: 'testAction',
            params: {param1: 'value1'},
            timestamp: request.timestamp
        })
    })


    test('fromJSON', () => {
        const data = {
            id: 'test-id',
            action: 'testAction',
            params: {param1: 'value1'},
            timestamp: 1234567890
        }
        
        const request = ServiceRequest.fromJSON(data)
        
        expect(request.id).toBe('test-id')
        expect(request.action).toBe('testAction')
        expect(request.params).toEqual({param1: 'value1'})
        expect(request.timestamp).toBe(1234567890)
    })


    test('fromJSON creates new instance', () => {
        const data = {
            id: 'test-id',
            action: 'testAction',
            params: {},
            timestamp: 1234567890
        }
        
        const request = ServiceRequest.fromJSON(data)
        
        expect(request).toBeInstanceOf(ServiceRequest)
    })


    test('export and fromJSON roundtrip', () => {
        const originalRequest = new ServiceRequest('testAction', {param1: 'value1'})
        const json = originalRequest.export()
        const restoredRequest = ServiceRequest.fromJSON(json)
        
        expect(restoredRequest.id).toBe(originalRequest.id)
        expect(restoredRequest.action).toBe(originalRequest.action)
        expect(restoredRequest.params).toEqual(originalRequest.params)
        expect(restoredRequest.timestamp).toBe(originalRequest.timestamp)
    })

})
