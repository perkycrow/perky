import {doc, section, text, action, logger} from '../doc/runtime.js'
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

        action('add / has / delete', () => {
            const set = new ObservableSet()

            set.add('apple')
            set.add('banana')
            set.add('apple')  // Duplicate - ignored

            logger.log('has apple:', set.has('apple'))
            logger.log('has grape:', set.has('grape'))
            logger.log('size:', set.size)

            set.delete('apple')
            logger.log('after delete:', set.toArray())
        })

    })


    section('Events', () => {

        text('Listen to set modifications.')

        action('add / delete / clear', () => {
            const set = new ObservableSet()

            set.on('add', (value) => logger.log(`add: ${value}`))
            set.on('delete', (value) => logger.log(`delete: ${value}`))
            set.on('clear', (values) => logger.log('cleared:', values))

            set.add('a')
            set.add('b')
            set.delete('a')
            set.clear()
        })

    })


    section('Iteration', () => {

        action('toArray / for...of', () => {
            const set = new ObservableSet(['red', 'green', 'blue'])

            logger.log('toArray:', set.toArray())

            for (const value of set) {
                logger.log('value:', value)
            }
        })

    })


    section('Chaining', () => {

        text('add() returns this for method chaining.')

        action('Chain adds', () => {
            const set = new ObservableSet()

            set.add('a').add('b').add('c')

            logger.log('size:', set.size)
        })

    })

})
