import {doc, section, text, code} from '../doc/runtime.js'


export default doc('PerkyElement', {advanced: true}, () => {

    text(`
        Base class for Perky UI components built as Web Components.
        Handles Shadow DOM setup, stylesheet adoption, and event listener cleanup.
        All editor and studio components extend this class.
    `)


    section('Creating a Component', () => {

        text('Extend PerkyElement and define a custom element tag.')

        code('Basic component', () => {
            class MyPanel extends PerkyElement {

                onInit () {
                    this.shadowRoot.innerHTML = '<p>Hello</p>'
                }

            }

            customElements.define('my-panel', MyPanel)
        })

    })


    section('Lifecycle Hooks', () => {

        text(`
            PerkyElement provides optional lifecycle hooks instead of requiring
            you to call \`super\` on the Web Component callbacks.
        `)

        code('Available hooks', () => {
            class MyWidget extends PerkyElement {

                onInit () {
                    // Called during constructor
                }

                onConnected () {
                    // Called when added to the DOM
                }

                onDisconnected () {
                    // Called when removed from the DOM
                }

            }
        })

    })


    section('Styles', () => {

        text(`
            Define a static \`styles\` property to adopt stylesheets into the Shadow DOM.
            Supports strings, CSSStyleSheet instances, or arrays of both.
            Styles are cached per constructor and inherited from parent classes.
        `)

        code('Static styles', () => {
            class StyledPanel extends PerkyElement {
                static styles = `
                    :host { display: block; padding: 8px; }
                    p { color: #ccc; }
                `
            }
        })

        code('Multiple stylesheets', () => {
            class MultiStyled extends PerkyElement {
                static styles = [
                    ':host { display: block; }',
                    '.title { font-weight: bold; }'
                ]
            }
        })

    })


    section('Event Listener Management', () => {

        text(`
            Use \`listenTo\` to subscribe to PerkyModule events.
            Listeners are automatically cleaned up when the element is removed from the DOM.
        `)

        code('listenTo', () => {
            class AppInspector extends PerkyElement {

                observe (app) {
                    this.listenTo(app, 'start', () => this.render())
                    this.listenTo(app, 'stop', () => this.render())
                }

            }
        })

        code('Manual cleanup', () => {
            const element = new PerkyElement()
            element.cleanListeners()
        })

    })

})
