import {doc, section, text, code, logger} from '../doc/runtime.js'


export default doc('PerkyView', () => {

    text(`
        DOM element wrapper that handles mounting, resizing, and fullscreen mode.
        Used internally by Application but can be used standalone.
    `)


    section('Creation', () => {

        text('PerkyView wraps a DOM element and provides size/visibility utilities.')

        code('Basic creation', () => {
            const view = new PerkyView({$id: 'myView'})

            // Uses a default div element
            logger.log(view.element.tagName) // 'DIV'
        })

        code('With custom element', () => {
            const canvas = document.createElement('canvas')
            const view = new PerkyView({
                $id: 'canvasView',
                element: canvas
            })
        })

        code('Mount to container', () => {
            const view = new PerkyView({$id: 'demo'})
            const container = document.getElementById('app')

            view.mount(container)

            logger.log(view.mounted) // true
            logger.log(view.width, view.height)
        })

    })


    section('Size', () => {

        text('Access and modify the element dimensions.')

        code('Size properties', () => {
            const view = new PerkyView({$id: 'demo'})

            logger.log(view.width)
            logger.log(view.height)
            logger.log(view.size) // {width, height}
            logger.log(view.aspectRatio)
        })

        code('setSize', () => {
            const view = new PerkyView({$id: 'demo'})

            view.setSize({width: 800, height: 600})
            view.setSize({width: 100, height: 100, unit: '%'})
        })

        code('fit', () => {
            const view = new PerkyView({$id: 'demo'})

            view.fit() // Fits to container
            view.fit(someElement) // Fits to specific element
        })

    })


    section('Visibility', () => {

        text('Show and hide the view element.')

        code('hide / show', () => {
            const view = new PerkyView({$id: 'demo'})

            logger.log(view.isVisible()) // true

            view.hide()
            logger.log(view.isVisible()) // false

            view.show()
            logger.log(view.isVisible()) // true
        })

        code('display property', () => {
            const view = new PerkyView({$id: 'demo'})

            view.display = 'flex'
            logger.log(view.display) // 'flex'
        })

    })


    section('CSS Classes', () => {

        text('Manipulate CSS classes on the element.')

        code('addClass / removeClass / hasClass', () => {
            const view = new PerkyView({$id: 'demo'})

            view.addClass('active')
            logger.log(view.hasClass('active')) // true

            view.removeClass('active')
            logger.log(view.hasClass('active')) // false
        })

    })


    section('Fullscreen', () => {

        text(`
            PerkyView supports fullscreen mode via the Fullscreen API.
            The \`displayMode\` property tracks the current state.
        `)

        code('Fullscreen methods', () => {
            const view = new PerkyView({$id: 'demo'})

            view.enterFullscreenMode()
            view.exitFullscreenMode()
            view.toggleFullscreen()

            // Or via setDisplayMode
            view.setDisplayMode('fullscreen')
            view.setDisplayMode('normal')
        })

        code('displayMode event', () => {
            const view = new PerkyView({$id: 'demo'})

            view.on('displayMode:changed', ({mode}) => {
                logger.log('mode changed:', mode)
            })

            logger.log(view.displayMode) // 'normal' or 'fullscreen'
        })

    })


    section('Mount / Dismount', () => {

        text('Attach and detach the view from a container element.')

        code('mount / dismount', () => {
            const view = new PerkyView({$id: 'demo'})
            const container = document.getElementById('app')

            view.on('mount', () => logger.log('mounted'))
            view.on('dismount', () => logger.log('dismounted'))

            view.mount(container)
            logger.log(view.container === container) // true
            logger.log(view.mounted) // true

            view.dismount()
            logger.log(view.mounted) // false
        })

    })


    section('Resize Observer', () => {

        text('PerkyView emits resize events when the element size changes.')

        code('Resize event', () => {
            const view = new PerkyView({$id: 'demo'})

            view.on('resize', ({width, height}) => {
                logger.log('resized:', width, height)
            })

            view.setSize({width: 300, height: 100})
        })

    })

})
