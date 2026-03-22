import {doc, section, text, code, action, logger} from '../doc/runtime.js'
import ServiceClient from './service_client.js'
import ServiceHost from './service_host.js'


export default doc('ServiceClient', () => {

    text(`
        Sends requests and receives responses. Promise-based with configurable timeout.
        Extends PerkyModule.
    `)


    section('Request / Response', () => {

        text(`
            Use \`request()\` to call an action on the host.
            Returns a promise that resolves with the response data.
        `)

        action('Basic request', async () => {
            class EchoService extends ServiceHost {
                static serviceMethods = ['echo']

                echo (req, res) {
                    res.send(`echo: ${req.params.message}`)
                }
            }

            const client = await ServiceClient.fromService(EchoService)
            const result = await client.request('echo', {message: 'hello'})
            logger.log('result:', result)
        })

    })


    section('Error Handling', () => {

        text('When the host responds with an error, the promise rejects.')

        action('Error response', async () => {
            class FailService extends ServiceHost {
                static serviceMethods = ['fail']

                fail (req, res) {
                    res.error('Something went wrong')
                }
            }

            const client = await ServiceClient.fromService(FailService)

            try {
                await client.request('fail')
            } catch (error) {
                logger.log('caught:', error.message)
            }
        })

    })


    section('Events', () => {

        text(`
            Use \`emitToHost()\` to send events to the host.
            Listen for host events with \`on('host:eventName')\`.
        `)

        action('Client-host events', async () => {
            class PingService extends ServiceHost {
                constructor (options) {
                    super(options)
                    this.on('client:ping', () => {
                        logger.log('host received ping')
                        this.emitToClient('pong')
                    })
                }
            }

            const client = await ServiceClient.fromService(PingService)

            client.on('host:pong', () => {
                logger.log('client received pong')
            })

            client.emitToHost('ping')
        })

    })


    section('Factory Methods', () => {

        text(`
            \`ServiceClient.from()\` is the preferred way to create a client.
            It accepts one of \`worker\`, \`service\`, or \`path\`.
            The \`service\` and \`path\` options return a Promise.
        `)

        code('from() options', async () => {
            const clientFromWorker = ServiceClient.from({worker: './my_service.js'})

            const clientFromService = await ServiceClient.from({service: MyService})

            const clientFromPath = await ServiceClient.from({path: './my_service.js'})
        })

    })

})
