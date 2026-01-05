import {doc, section, text, code} from '../docs/runtime.js'


export default doc('Application', () => {

    text(`
        Main entry point for Perky applications.
        Manages view mounting, input system, and asset loading.
    `)


    section('Creation', () => {

        text('Applications extend PerkyModule with built-in view and input handling.')

        code('Basic setup', () => {
            class MyGame extends Application {
                static $category = 'game'

                configureApplication () {
                    // Called after all systems are created
                }
            }
        })

        code('Create and mount', () => {
            const app = new Application({$id: 'demo'})
            const container = document.getElementById('app')

            app.mount(container)
            app.start()

            console.log(app.mounted) // true
            console.log(app.element.tagName) // 'DIV'
            console.log(app.perkyView.width, app.perkyView.height)
        })

    })


    section('Built-in systems', () => {

        text(`
            Application creates several child modules automatically:
            \`manifest\`, \`actionDispatcher\`, \`perkyView\`, \`sourceManager\`, \`inputSystem\`.
        `)

        code('List children', () => {
            const app = new Application({$id: 'demo'})

            for (const child of app.children) {
                console.log(`${child.$id} (${child.$category})`)
            }

            app.dispose()
        })

        code('Access systems', () => {
            const app = new Application({$id: 'demo'})

            console.log(app.manifest.$id)
            console.log(app.perkyView.$id)
            console.log(app.inputSystem.$id)

            app.dispose()
        })

    })


    section('Lifecycle', () => {

        text('Applications inherit PerkyModule lifecycle.')

        code('start / stop', () => {
            const app = new Application({$id: 'demo'})

            app.on('start', () => console.log('app started'))
            app.on('stop', () => console.log('app stopped'))

            app.start()
            console.log(app.running) // true

            app.stop()
            console.log(app.running) // false

            app.dispose()
        })

    })


    section('View', () => {

        text('The perkyView handles DOM mounting and resizing.')

        code('View properties', () => {
            const app = new Application({$id: 'demo'})

            console.log(app.perkyView.width)
            console.log(app.perkyView.height)
            console.log(app.perkyView.aspectRatio)
        })

        code('Resize event', () => {
            const app = new Application({$id: 'demo'})

            app.on('resize', ({width, height}) => {
                console.log('resized to:', width, height)
            })

            app.perkyView.setSize({width: 800, height: 600})
        })

    })

})
