import {doc, section, setup, text, code, action, logger} from '../doc/runtime.js'
import ObservableSet from './observable_set.js'


export default doc('ObservableSet', {context: 'simple'}, () => {

    text(`
        Set data structure that emits events on modifications.
        Wraps native Set with change notifications.
    `)


    section('Basic Operations', () => {

        text('Standard Set operations with automatic event emission.')

        action('Creation', () => {
            const empty = new ObservableSet()
            logger.log('empty size:', empty.size)

            const withValues = new ObservableSet([1, 2, 3, 2])
            logger.log('with values:', withValues.size)
            logger.log('values:', withValues.toArray())
        })

        action('add', () => {
            const set = new ObservableSet()

            set.on('add', value => {
                logger.log('added:', value)
            })

            set.add('apple')
            set.add('banana')
            set.add('apple')  // Duplicate - won't trigger event
            logger.log('size:', set.size)
        })

        action('delete', () => {
            const set = new ObservableSet(['apple', 'banana', 'cherry'])

            set.on('delete', value => {
                logger.log('deleted:', value)
            })

            logger.log('deleted apple:', set.delete('apple'))
            logger.log('deleted missing:', set.delete('grape'))
            logger.log('remaining:', set.toArray())
        })

        action('clear', () => {
            const set = new ObservableSet(['a', 'b', 'c'])

            set.on('clear', values => {
                logger.log('cleared:', values)
            })

            logger.log('before:', set.size)
            set.clear()
            logger.log('after:', set.size)
        })

    })


    section('Querying', () => {

        setup(ctx => {
            ctx.set = new ObservableSet(['red', 'green', 'blue'])
        })

        text('Check membership and size.')

        action('has', ctx => {
            logger.log('has red:', ctx.set.has('red'))
            logger.log('has yellow:', ctx.set.has('yellow'))
        })

        action('size', ctx => {
            logger.log('size:', ctx.set.size)
            ctx.set.add('yellow')
            logger.log('after add:', ctx.set.size)
        })

    })


    section('Iteration', () => {

        setup(ctx => {
            ctx.set = new ObservableSet(['player', 'enemy', 'item'])
        })

        text('Iterate over set values using various methods.')

        action('forEach', ctx => {
            ctx.set.forEach(value => {
                logger.log('value:', value)
            })
        })

        action('for...of', ctx => {
            for (const value of ctx.set) {
                logger.log('value:', value)
            }
        })

        action('values()', ctx => {
            const iterator = ctx.set.values()
            logger.log('first:', iterator.next().value)
            logger.log('second:', iterator.next().value)
        })

        action('toArray', ctx => {
            const arr = ctx.set.toArray()
            logger.log('as array:', arr)
            logger.log('is array:', Array.isArray(arr))
        })

    })


    section('Events', () => {

        text('Listen to set modifications.')

        action('add event', () => {
            const set = new ObservableSet()

            set.on('add', value => {
                logger.log('new value:', value)
            })

            set.add('first')
            set.add('second')
        })

        action('delete event', () => {
            const set = new ObservableSet(['a', 'b', 'c'])

            set.on('delete', value => {
                logger.log('removed:', value)
            })

            set.delete('b')
            set.delete('c')
        })

        action('clear event', () => {
            const set = new ObservableSet([1, 2, 3, 4, 5])

            set.on('clear', values => {
                logger.log('cleared values:', values)
                logger.log('count:', values.length)
            })

            set.clear()
        })

        action('Multiple listeners', () => {
            const set = new ObservableSet()

            set.on('add', value => logger.log('listener 1:', value))
            set.on('add', value => logger.log('listener 2:', value))

            set.add('test')
        })

    })


    section('Chaining', () => {

        text('add() returns this for method chaining.')

        action('Chain adds', () => {
            const set = new ObservableSet()

            set.on('add', value => logger.log('added:', value))

            set.add('a')
                .add('b')
                .add('c')

            logger.log('size:', set.size)
        })

    })


    section('Practical Examples', () => {

        text('Real-world usage patterns.')

        action('Track active players', () => {
            const activePlayers = new ObservableSet()

            activePlayers.on('add', id => {
                logger.log(`Player ${id} joined`)
            })

            activePlayers.on('delete', id => {
                logger.log(`Player ${id} left`)
            })

            activePlayers.add('player1')
            activePlayers.add('player2')
            activePlayers.delete('player1')
            logger.log('active:', activePlayers.toArray())
        })

        action('Unique tag collection', () => {
            const tags = new ObservableSet()

            tags.on('add', tag => {
                logger.log('new tag:', tag)
            })

            tags.add('important')
            tags.add('urgent')
            tags.add('important')  // Won't emit (duplicate)

            logger.log('all tags:', tags.toArray())
        })

        action('Event-driven UI sync', () => {
            const selectedItems = new ObservableSet()

            selectedItems.on('add', id => {
                logger.log(`UI: Highlight item ${id}`)
            })

            selectedItems.on('delete', id => {
                logger.log(`UI: Unhighlight item ${id}`)
            })

            selectedItems.on('clear', () => {
                logger.log('UI: Clear all highlights')
            })

            selectedItems.add('item1')
            selectedItems.add('item2')
            selectedItems.delete('item1')
            selectedItems.clear()
        })

    })


    section('Comparison with Set', () => {

        text('ObservableSet has identical API to native Set plus events.')

        code('Native Set equivalence', () => {
            const nativeSet = new Set([1, 2, 3])
            const observableSet = new ObservableSet([1, 2, 3])

            // Both support same methods
            nativeSet.add(4)
            observableSet.add(4)  // Also emits 'add' event

            nativeSet.has(2)
            observableSet.has(2)

            // Observable adds toArray() helper
            observableSet.toArray()
        })

        code('When to use ObservableSet', () => {
            // Use when you need reactivity
            const reactiveSet = new ObservableSet()
            reactiveSet.on('add', updateUI)

            // Use native Set for simple storage
            const simpleSet = new Set()
        })

    })


    section('Integration with Notifier', () => {

        text('ObservableSet extends Notifier, inheriting all event capabilities.')

        action('External listeners', () => {
            const set = new ObservableSet()
            const observer = {
                listenTo: (target, event, fn) => {
                    target.on(event, fn)
                }
            }

            // Can use Notifier methods
            set.once('add', value => {
                logger.log('first add only:', value)
            })

            set.add('first')
            set.add('second')
        })

        action('Event delegation', () => {
            const sourceSet = new ObservableSet()
            const targetSet = new ObservableSet()

            sourceSet.on('add', value => {
                logger.log('source added:', value)
                targetSet.add(value)
            })

            sourceSet.add('sync-test')
            logger.log('target has value:', targetSet.has('sync-test'))
        })

    })

})
