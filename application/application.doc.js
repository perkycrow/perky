import {doc, section, text, code, action, container, logger} from '../docs/runtime.js'
import Application from './application.js'


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

        container({title: 'Create and mount', width: 400, height: 200}, ctx => {
            const app = new Application({$id: 'demo'})
            app.mount(ctx.container)
            app.start()

            ctx.setApp(app)

            logger.log('mounted:', app.mounted)
            logger.log('element:', app.element.tagName)
            logger.log('size:', app.perkyView.width, 'x', app.perkyView.height)
        })

    })


    section('Built-in systems', () => {

        text(`
            Application creates several child modules automatically:
            \`manifest\`, \`actionDispatcher\`, \`perkyView\`, \`sourceManager\`, \`inputSystem\`.
        `)

        action('List children', () => {
            const app = new Application({$id: 'demo'})

            for (const child of app.children) {
                logger.log(`${child.$id} (${child.$category})`)
            }

            app.dispose()
        })

        action('Access systems', () => {
            const app = new Application({$id: 'demo'})

            logger.log('manifest:', app.manifest.$id)
            logger.log('perkyView:', app.perkyView.$id)
            logger.log('inputSystem:', app.inputSystem.$id)

            app.dispose()
        })

    })


    section('Lifecycle', () => {

        text('Applications inherit PerkyModule lifecycle.')

        action('start / stop', () => {
            const app = new Application({$id: 'demo'})

            app.on('start', () => logger.log('app started'))
            app.on('stop', () => logger.log('app stopped'))

            app.start()
            logger.log('running:', app.running)

            app.stop()
            logger.log('running:', app.running)

            app.dispose()
        })

    })


    section('View', () => {

        text('The perkyView handles DOM mounting and resizing.')

        container({title: 'View properties', width: 400, height: 200}, ctx => {
            const app = new Application({$id: 'demo'})
            app.mount(ctx.container)
            app.start()

            ctx.setApp(app)

            logger.log('width:', app.perkyView.width)
            logger.log('height:', app.perkyView.height)
            logger.log('aspectRatio:', app.perkyView.aspectRatio.toFixed(2))
        })

        container({title: 'Resize event', width: 400, height: 200}, ctx => {
            const app = new Application({$id: 'demo'})
            app.mount(ctx.container)
            app.start()

            ctx.setApp(app)

            app.on('resize', ({width, height}) => {
                logger.log('resized to:', width, 'x', height)
            })

            app.perkyView.setSize({width: 300, height: 200})
        })

    })

})
