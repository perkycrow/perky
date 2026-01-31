import {doc, section, text, code, action, logger} from '../doc/runtime.js'
import ApplicationManager from './application_manager.js'
import Application from './application.js'


export default doc('ApplicationManager', {advanced: true}, () => {

    text(`
        Manages multiple [[Application@application]] instances.
        Handles registration, creation, lifecycle, and lookup of apps.
        Extends [[PerkyModule]] and stores app constructors in a [[Registry]].
    `)


    section('Registering Apps', () => {

        text('Register application constructors by name before creating instances.')

        action('register / unregister', () => {
            const manager = new ApplicationManager({$id: 'manager'})

            manager.register('demo', Application)
            logger.log('registered:', manager.constructors.has('demo'))

            manager.unregister('demo')
            logger.log('after unregister:', manager.constructors.has('demo'))
        })

    })


    section('Creating Apps', () => {

        text('Create app instances from registered constructors.')

        action('createApp', () => {
            const manager = new ApplicationManager({$id: 'manager'})
            manager.register('demo', Application)

            const app = manager.createApp('demo', {$id: 'myApp'})
            logger.log('app id:', app.$id)
            logger.log('children:', manager.children.length)
        })

    })


    section('Lifecycle', () => {

        text('Start, stop, and dispose apps by name or id.')

        action('startApp / stopApp', () => {
            const manager = new ApplicationManager({$id: 'manager'})
            manager.register('demo', Application)
            const app = manager.createApp('demo', {$id: 'myApp'})

            manager.startApp('myApp')
            logger.log('running:', app.running)

            manager.stopApp('myApp')
            logger.log('after stop:', app.running)
        })

        action('disposeApp', () => {
            const manager = new ApplicationManager({$id: 'manager'})
            manager.register('demo', Application)
            manager.createApp('demo', {$id: 'temp'})

            logger.log('before:', manager.children.length)
            manager.disposeApp('temp')
            logger.log('after:', manager.children.length)
        })

    })


    section('Listing Apps', () => {

        text('List all apps or filter by name.')

        action('list', () => {
            const manager = new ApplicationManager({$id: 'manager'})
            manager.register('demo', Application)
            manager.createApp('demo', {$id: 'app1', $name: 'Game One'})
            manager.createApp('demo', {$id: 'app2', $name: 'Game Two'})
            manager.createApp('demo', {$id: 'app3', $name: 'Editor'})

            logger.log('all:', manager.list().map(a => a.$name))
            logger.log('games:', manager.list('Game').map(a => a.$name))
        })

    })


    section('Execute', () => {

        text('Call a method on a specific app by name or id.')

        code('execute', () => {
            const manager = new ApplicationManager({$id: 'manager'})
            manager.register('demo', Application)
            manager.createApp('demo', {$id: 'myApp'})

            manager.execute('myApp', 'start')
        })

    })

})
