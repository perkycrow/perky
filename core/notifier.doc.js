import {doc, section, text, action, logger} from '../doc/runtime.js'
import Notifier from './notifier.js'


export default doc('Notifier', () => {

    text(`
        Event emitter for decoupled communication between components.
        Supports subscribing, emitting, and listening to external targets.
    `)


    section('Basic Events', () => {

        text('Subscribe to events with `on` and trigger them with `emit`.')

        action('on / emit', () => {
            const notifier = new Notifier()

            notifier.on('update', value => {
                logger.log('received:', value)
            })

            notifier.emit('update', 42)
            notifier.emit('update', 'hello')
        })

        action('Multiple listeners', () => {
            const notifier = new Notifier()

            notifier.on('event', () => logger.log('listener 1'))
            notifier.on('event', () => logger.log('listener 2'))

            notifier.emit('event')
        })

        action('once', () => {
            const notifier = new Notifier()

            notifier.once('signal', () => {
                logger.log('only called once')
            })

            notifier.emit('signal')
            notifier.emit('signal')
            notifier.emit('signal')
        })

    })


    section('Unsubscribing', () => {

        text('Remove listeners with `off`.')

        action('off (specific listener)', () => {
            const notifier = new Notifier()

            const listener = notifier.on('event', () => {
                logger.log('called')
            })

            notifier.emit('event')
            notifier.off('event', listener)
            logger.log('after off:')
            notifier.emit('event')
            logger.log('(nothing)')
        })

        action('off (all listeners for event)', () => {
            const notifier = new Notifier()

            notifier.on('event', () => logger.log('listener 1'))
            notifier.on('event', () => logger.log('listener 2'))

            notifier.emit('event')
            notifier.off('event')
            logger.log('after off:')
            notifier.emit('event')
            logger.log('(nothing)')
        })

        action('removeListeners', () => {
            const notifier = new Notifier()

            notifier.on('a', () => logger.log('a'))
            notifier.on('b', () => logger.log('b'))

            notifier.emit('a')
            notifier.emit('b')
            notifier.removeListeners()
            logger.log('after removeListeners:')
            notifier.emit('a')
            notifier.emit('b')
            logger.log('(nothing)')
        })

    })


    section('Emitter Helper', () => {

        text('Create a bound emitter function for convenience.')

        action('emitter', () => {
            const notifier = new Notifier()

            notifier.on('tick', frame => {
                logger.log('tick:', frame)
            })

            const tick = notifier.emitter('tick')
            tick(1)
            tick(2)
            tick(3)
        })

    })


    section('External Listening', () => {

        text(`
            Listen to events from other notifiers.
            External listeners are tracked for easy cleanup.
        `)

        action('listenTo', () => {
            const player = new Notifier()
            const game = new Notifier()

            game.listenTo(player, 'jump', height => {
                logger.log('player jumped:', height)
            })

            player.emit('jump', 10)
        })

        action('listenToOnce', () => {
            const enemy = new Notifier()
            const game = new Notifier()

            game.listenToOnce(enemy, 'spawn', () => {
                logger.log('enemy spawned (once)')
            })

            enemy.emit('spawn')
            enemy.emit('spawn')
            enemy.emit('spawn')
        })

        action('cleanExternalListeners', () => {
            const source = new Notifier()
            const listener = new Notifier()

            listener.listenTo(source, 'event', () => {
                logger.log('received')
            })

            source.emit('event')
            listener.cleanExternalListeners()
            logger.log('after cleanup:')
            source.emit('event')
            logger.log('(nothing)')
        })

    })


    section('Event Delegation', () => {

        text('Forward events from one notifier to another, optionally with a namespace.')

        action('delegateEvents', () => {
            const input = new Notifier()
            const game = new Notifier()

            game.delegateEvents(input, ['press', 'release'], 'input')

            game.on('input:press', key => logger.log('press:', key))
            game.on('input:release', key => logger.log('release:', key))

            input.emit('press', 'space')
            input.emit('release', 'space')
        })

    })


})
