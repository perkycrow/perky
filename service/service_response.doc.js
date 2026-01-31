import {doc, section, text, action, logger} from '../doc/runtime.js'
import ServiceResponse from './service_response.js'


export default doc('ServiceResponse', () => {

    text(`
        Data class representing an RPC response. Has a \`requestId\`, \`success\` flag,
        \`data\`, and \`error\`. Created by the host — you rarely instantiate these directly.
    `)


    section('Success Response', () => {

        text('Use `send()` to set the response data and mark it as successful.')

        action('send', () => {
            const response = new ServiceResponse('req-123')
            response.send({greeting: 'Hello, Perky'})

            logger.log('success:', response.success)
            logger.log('data:', response.data)
            logger.log('error:', response.error)
        })

    })


    section('Error Response', () => {

        text('Use `fail()` to mark the response as failed with an error message.')

        action('fail', () => {
            const response = new ServiceResponse('req-456')
            response.fail('Something went wrong')

            logger.log('success:', response.success)
            logger.log('data:', response.data)
            logger.log('error:', response.error)
        })

    })


    section('Serialization', () => {

        text('Use `export()` to serialize the response for transport.')

        action('export', () => {
            const response = new ServiceResponse('req-789')
            response.send({score: 100})

            const data = response.export()
            logger.log('exported:', data)
        })

    })

})
