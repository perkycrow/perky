import ServiceResponse from './service_response'


describe(ServiceResponse, () => {

    test('constructor', () => {
        const response = new ServiceResponse('test-request-id')
        
        expect(response.requestId).toBe('test-request-id')
        expect(response.success).toBe(true)
        expect(response.data).toBeNull()
        expect(response.error).toBeNull()
    })


    test('send with data', () => {
        const response = new ServiceResponse('test-request-id')
        const testData = {result: 'success', value: 42}
        
        const returnValue = response.send(testData)
        
        expect(response.success).toBe(true)
        expect(response.data).toBe(testData)
        expect(response.error).toBeNull()
        expect(returnValue).toBe(response)
    })


    test('send with null data', () => {
        const response = new ServiceResponse('test-request-id')
        
        response.send(null)
        
        expect(response.success).toBe(true)
        expect(response.data).toBeNull()
        expect(response.error).toBeNull()
    })


    test('send with undefined data', () => {
        const response = new ServiceResponse('test-request-id')
        
        response.send(undefined)
        
        expect(response.success).toBe(true)
        expect(response.data).toBeUndefined()
        expect(response.error).toBeNull()
    })


    test('fail with error message', () => {
        const response = new ServiceResponse('test-request-id')
        const errorMessage = 'Something went wrong'
        
        const returnValue = response.fail(errorMessage)
        
        expect(response.success).toBe(false)
        expect(response.data).toBeNull()
        expect(response.error).toBe(errorMessage)
        expect(returnValue).toBe(response)
    })


    test('fail with error object', () => {
        const response = new ServiceResponse('test-request-id')
        const error = new Error('Test error')
        
        response.fail(error)
        
        expect(response.success).toBe(false)
        expect(response.data).toBeNull()
        expect(response.error).toBe(error)
    })


    test('export success response', () => {
        const response = new ServiceResponse('test-request-id')
        const testData = {result: 'success'}
        
        response.send(testData)
        const json = response.export()
        
        expect(json).toEqual({
            requestId: 'test-request-id',
            success: true,
            data: testData,
            error: null
        })
    })


    test('export error response', () => {
        const response = new ServiceResponse('test-request-id')
        const errorMessage = 'Test error'
        
        response.fail(errorMessage)
        const json = response.export()
        
        expect(json).toEqual({
            requestId: 'test-request-id',
            success: false,
            data: null,
            error: errorMessage
        })
    })


    test('export default response', () => {
        const response = new ServiceResponse('test-request-id')
        const json = response.export()
        
        expect(json).toEqual({
            requestId: 'test-request-id',
            success: true,
            data: null,
            error: null
        })
    })


    test('overwrite success with fail', () => {
        const response = new ServiceResponse('test-request-id')
        
        response.send({result: 'success'})
        expect(response.success).toBe(true)
        
        response.fail('Error occurred')
        expect(response.success).toBe(false)
        expect(response.data).toEqual({result: 'success'})
        expect(response.error).toBe('Error occurred')
    })


    test('overwrite fail with send', () => {
        const response = new ServiceResponse('test-request-id')
        
        response.fail('Error occurred')
        expect(response.success).toBe(false)
        
        response.send({result: 'success'})
        expect(response.success).toBe(true)
        expect(response.data).toEqual({result: 'success'})
        expect(response.error).toBe('Error occurred')
    })

})
