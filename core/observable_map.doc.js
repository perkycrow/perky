import {doc, section, setup, text, action, logger} from '../doc/runtime.js'
import ObservableMap from './observable_map.js'


export default doc('ObservableMap', {context: 'simple'}, () => {

    text(`
        Map data structure that emits events on modifications.
        Provides bidirectional lookups (key→value and value→key).
    `)


    section('Basic Operations', () => {

        text('Standard Map operations with automatic event emission.')

        action('Creation', () => {
            const empty = new ObservableMap()
            logger.log('empty size:', empty.size)

            const withData = new ObservableMap({a: 1, b: 2, c: 3})
            logger.log('with data:', withData.size)
            logger.log('entries:', withData.entries)
        })

        action('set / get / has / delete', () => {
            const map = new ObservableMap()

            map.set('x', 10)
            map.set('y', 20)

            logger.log('get x:', map.get('x'))
            logger.log('has x:', map.has('x'))
            logger.log('has z:', map.has('z'))

            map.delete('x')
            logger.log('after delete, has x:', map.has('x'))
        })

    })


    section('Bidirectional Lookup', () => {

        setup(ctx => {
            ctx.map = new ObservableMap()
            ctx.alice = {name: 'Alice'}
            ctx.bob = {name: 'Bob'}
            ctx.map.set('player1', ctx.alice)
            ctx.map.set('player2', ctx.bob)
        })

        text('Look up keys by value reference.')

        action('keyFor / hasValue', ctx => {
            logger.log('key for Alice:', ctx.map.keyFor(ctx.alice))
            logger.log('has Alice object:', ctx.map.hasValue(ctx.alice))
            logger.log('has different object:', ctx.map.hasValue({name: 'Alice'}))
        })

    })


    section('Accessing Data', () => {

        action('entries / keys / values', () => {
            const map = new ObservableMap({red: '#ff0000', green: '#00ff00'})

            logger.log('entries:', map.entries)
            logger.log('keys:', Array.from(map.keys))
            logger.log('values:', map.all)
        })

    })


    section('Events', () => {

        text('Listen to map modifications.')

        action('set / delete / clear', () => {
            const map = new ObservableMap()

            map.on('set', (key) => logger.log(`set: ${key}`))
            map.on('delete', (key) => logger.log(`delete: ${key}`))
            map.on('clear', () => logger.log('cleared'))

            map.set('a', 1)
            map.set('b', 2)
            map.delete('a')
            map.clear()
        })

    })


    section('Key Management', () => {

        text('Update keys while preserving values.')

        action('updateKey', () => {
            const map = new ObservableMap()
            map.set('temp_id', {name: 'Alice'})

            map.on('key:updated', (oldKey, newKey) => {
                logger.log(`key updated: ${oldKey} → ${newKey}`)
            })

            map.updateKey('temp_id', 'player1')
            logger.log('keys:', Array.from(map.keys))
        })

    })


    section('Collection Operations', () => {

        text('Add multiple entries at once or convert to plain object.')

        action('addCollection / toObject', () => {
            const map = new ObservableMap()

            map.addCollection({name: 'Game', version: '1.0'})
            logger.log('entries:', map.entries)

            const obj = map.toObject()
            logger.log('as object:', obj)
        })

    })

})
