import {doc, text, code} from '../doc/runtime.js'


export default doc('ServiceWorker', () => {

    text(`
        Web Worker bootstrap script. Receives an \`init-service\` message,
        dynamically imports the service class, and instantiates it.
        Used internally by \`ServiceClient.fromWorker()\`.
    `)


    code('How it works', () => {
        const client = ServiceClient.fromWorker('./my_service.js')
    })

})
