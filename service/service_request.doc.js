import {doc, section, text, action, logger} from '../doc/runtime.js'
import ServiceRequest from './service_request.js'


export default doc('ServiceRequest', () => {

    text(`
        Data class representing an RPC request. Has an \`id\`, \`action\`, \`params\`,
        and \`timestamp\`. Created by the client — you rarely instantiate these directly.
    `)


    section('Creating a Request', () => {

        text('A request is created with an action name and optional parameters.')

        action('Constructor', () => {
            const request = new ServiceRequest('greet', {name: 'Perky'})

            logger.log('action:', request.action)
            logger.log('params:', request.params)
            logger.log('id:', request.id)
            logger.log('timestamp:', request.timestamp)
        })

    })


    section('Serialization', () => {

        text(`
            Use \`export()\` to serialize a request for transport,
            and \`ServiceRequest.import()\` to reconstruct it on the other side.
        `)

        action('export / import', () => {
            const original = new ServiceRequest('save', {slot: 1})
            const data = original.export()

            logger.log('exported:', data)

            const restored = ServiceRequest.import(data)
            logger.log('restored action:', restored.action)
            logger.log('restored params:', restored.params)
            logger.log('same id:', original.id === restored.id)
        })

    })

})
