import {doc, section, text, code, action, logger} from '../doc/runtime.js'
import ServiceTransport from './service_transport.js'


export default doc('ServiceTransport', () => {

    text(`
        Messaging layer that abstracts how messages travel between client and host.
        Swappable — same code runs over a Worker, a MessageChannel, or in-memory.
    `)


    section('Local Transport', () => {

        text('A local transport sends messages within the same context. Useful for testing.')

        action('local', () => {
            const transport = ServiceTransport.local()

            transport.onMessage(message => {
                logger.log('received:', message)
            })

            transport.send({type: 'ping'})
            transport.send({type: 'pong', data: 42})
        })

    })


    section('Paired Transports', () => {

        text(`
            \`pair()\` returns two transports wired together. Messages sent on one
            arrive on the other. Useful for testing or in-memory services.
        `)

        action('pair', () => {
            const [transportA, transportB] = ServiceTransport.pair()

            transportA.onMessage(message => {
                logger.log('A received:', message.text)
            })

            transportB.onMessage(message => {
                logger.log('B received:', message.text)
            })

            transportA.send({text: 'hello from A'})
            transportB.send({text: 'hello from B'})
        })

    })


    section('Message Handlers', () => {

        text('Register and unregister message handlers with `onMessage` and `offMessage`.')

        action('onMessage / offMessage', () => {
            const transport = ServiceTransport.local()

            const handler = message => {
                logger.log('handled:', message.value)
            }

            transport.onMessage(handler)
            transport.send({value: 1})
            transport.send({value: 2})

            transport.offMessage(handler)
            transport.send({value: 3})
            logger.log('(handler removed, 3 not received)')
        })

    })


    section('Factory Methods', () => {

        text(`
            Multiple factory methods to create transports for different environments:
        `)

        code('Available factories', () => {
            ServiceTransport.local()
            ServiceTransport.pair()
            ServiceTransport.auto()
            ServiceTransport.auto(worker)
            ServiceTransport.worker(worker)
            ServiceTransport.main()
            ServiceTransport.channel(port)
        })

    })

})
