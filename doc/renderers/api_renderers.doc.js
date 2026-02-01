import {doc, section, text, code} from '../runtime.js'


export default doc('API Renderers', {advanced: true}, () => {

    text(`
        Renderers for the API reference tab. Creates the DOM elements
        that display class members, functions, and constants with
        expandable source code.
    `)


    section('getApiItems', () => {

        text(`
            Returns the list of API items for a given category.
            Handles both single-value categories (like the class constructor)
            and array categories (like methods or properties).
        `)

        code('Usage', () => {
            const items = getApiItems(api, {key: 'methods', single: false})

            const constructor = getApiItems(api, {key: 'constructor', single: true})
        })

    })


    section('renderApiMember', () => {

        text(`
            Renders a single API member as a collapsible card. Shows the
            member signature (with params or value), an optional line number,
            and a toggle button to expand the source code.
        `)

        code('Signature formats', () => {
            renderApiMember({name: 'update', params: ['dt']}, file)

            renderApiMember({name: 'MAX_SPEED', value: '100'}, file)

            renderApiMember({name: 'enabled'}, file)
        })

    })

})
