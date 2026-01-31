import {doc, section, text, code, action, logger} from '../doc/runtime.js'
import ServiceHost from './service_host.js'
import ServiceTransport from './service_transport.js'
import ServiceRequest from './service_request.js'
import ActionController from '../core/action_controller.js'


export default doc('ServiceHost', () => {

    text(`
        Receives requests and dispatches them to registered handlers.
        Express-style \`(req, res)\` API. Extends PerkyModule.
    `)


    section('Registering Handlers', () => {

        text('Use `register()` to add request handlers by action name.')

        action('register', () => {
            const host = new ServiceHost({
                transport: ServiceTransport.local()
            })

            host.register('greet', (req, res) => {
                res.send(`Hello ${req.params.name}`)
            })

            host.register('add', (req, res) => {
                res.send(req.params.a + req.params.b)
            })

            logger.log('actions registered:', [...host.actions.keys()])
        })

    })


    section('Subclass with serviceMethods', () => {

        text(`
            Extend ServiceHost and declare \`static serviceMethods\` to
            automatically register class methods as handlers.
        `)

        code('serviceMethods', () => {
            class MathService extends ServiceHost {
                static serviceMethods = ['add', 'multiply']

                add (req, res) {
                    res.send(req.params.a + req.params.b)
                }

                multiply (req, res) {
                    res.send(req.params.a * req.params.b)
                }
            }
        })

    })


    section('Unregistering', () => {

        text('Use `unregister()` to remove a handler.')

        action('unregister', () => {
            const host = new ServiceHost({
                transport: ServiceTransport.local()
            })

            host.register('temp', (req, res) => res.send('ok'))
            logger.log('before:', [...host.actions.keys()])

            host.unregister('temp')
            logger.log('after:', [...host.actions.keys()])
        })

    })


    section('Events from Client', () => {

        text(`
            Events sent by the client arrive as \`client:eventName\`.
            Use \`emitToClient()\` to send events back.
        `)

        code('Event handling', () => {
            const host = new ServiceHost()

            host.on('client:ping', () => {
                host.emitToClient('pong')
            })
        })

    })

})
