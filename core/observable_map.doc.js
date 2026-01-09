import {doc, section, setup, text, code, action, logger} from '../doc/runtime.js'
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

            const withData = new ObservableMap([
                ['a', 1],
                ['b', 2],
                ['c', 3]
            ])
            logger.log('with data:', withData.size)
            logger.log('entries:', withData.entries)
        })

        action('set / get', () => {
            const map = new ObservableMap()

            map.on('set', (key, value) => {
                logger.log(`set: ${key} = ${value}`)
            })

            map.set('player', {name: 'Alice'})
            map.set('score', 100)

            logger.log('get player:', map.get('player'))
            logger.log('get score:', map.get('score'))
        })

        action('has', () => {
            const map = new ObservableMap([
                ['x', 10],
                ['y', 20]
            ])

            logger.log('has x:', map.has('x'))
            logger.log('has z:', map.has('z'))
        })

        action('delete', () => {
            const map = new ObservableMap([
                ['a', 1],
                ['b', 2]
            ])

            map.on('delete', (key, value) => {
                logger.log(`deleted: ${key} = ${value}`)
            })

            logger.log('deleted a:', map.delete('a'))
            logger.log('deleted missing:', map.delete('z'))
            logger.log('size:', map.size)
        })

    })


    section('Bidirectional Lookup', () => {

        setup(ctx => {
            ctx.map = new ObservableMap([
                ['player1', {name: 'Alice'}],
                ['player2', {name: 'Bob'}]
            ])
            ctx.alice = ctx.map.get('player1')
            ctx.bob = ctx.map.get('player2')
        })

        text('Look up values by key or keys by value.')

        action('hasValue', ctx => {
            logger.log('has Alice object:', ctx.map.hasValue(ctx.alice))
            logger.log('has different object:', ctx.map.hasValue({name: 'Alice'}))
        })

        action('keyFor', ctx => {
            logger.log('key for Alice:', ctx.map.keyFor(ctx.alice))
            logger.log('key for Bob:', ctx.map.keyFor(ctx.bob))
            logger.log('key for unknown:', ctx.map.keyFor({name: 'Charlie'}))
        })

        action('hasEntry', ctx => {
            logger.log('has entry player1→Alice:', ctx.map.hasEntry('player1', ctx.alice))
            logger.log('has entry player1→Bob:', ctx.map.hasEntry('player1', ctx.bob))
        })

        action('isKeyOf', ctx => {
            logger.log('player1 is key of Alice:', ctx.map.isKeyOf('player1', ctx.alice))
            logger.log('player2 is key of Alice:', ctx.map.isKeyOf('player2', ctx.alice))
        })

    })


    section('Accessing Data', () => {

        setup(ctx => {
            ctx.map = new ObservableMap([
                ['red', '#ff0000'],
                ['green', '#00ff00'],
                ['blue', '#0000ff']
            ])
        })

        text('Various ways to access map contents.')

        action('entries', ctx => {
            logger.log('entries:', ctx.map.entries)
        })

        action('keys', ctx => {
            const keys = Array.from(ctx.map.keys)
            logger.log('keys:', keys)
        })

        action('values', ctx => {
            const values = Array.from(ctx.map.values)
            logger.log('values:', values)
        })

        action('all', ctx => {
            logger.log('all values:', ctx.map.all)
        })

        action('forEach', ctx => {
            ctx.map.forEach((value, key) => {
                logger.log(`${key}: ${value}`)
            })
        })

    })


    section('Collection Operations', () => {

        text('Add multiple entries at once or convert to plain object.')

        action('addCollection (array)', () => {
            const map = new ObservableMap()

            map.on('set', (key, value) => {
                logger.log(`added: ${key}`)
            })

            map.addCollection([
                ['a', 1],
                ['b', 2],
                ['c', 3]
            ])

            logger.log('size:', map.size)
        })

        action('addCollection (object)', () => {
            const map = new ObservableMap()

            map.addCollection({
                name: 'Game',
                version: '1.0',
                active: true
            })

            logger.log('entries:', map.entries)
        })

        action('addCollection (Map)', () => {
            const map = new ObservableMap()
            const source = new Map([['x', 10], ['y', 20]])

            map.addCollection(source)

            logger.log('size:', map.size)
            logger.log('values:', map.all)
        })

        action('toObject', () => {
            const map = new ObservableMap([
                ['name', 'Player'],
                ['health', 100],
                ['level', 5]
            ])

            const obj = map.toObject()
            logger.log('as object:', obj)
            logger.log('is plain object:', obj.constructor === Object)
        })

    })


    section('Key Management', () => {

        text('Update keys while preserving values.')

        action('updateKey', () => {
            const map = new ObservableMap([
                ['temp_id', {name: 'Alice'}]
            ])

            map.on('key:updated', (oldKey, newKey, value) => {
                logger.log(`key updated: ${oldKey} → ${newKey}`)
            })

            const success = map.updateKey('temp_id', 'player1')
            logger.log('updated:', success)
            logger.log('has temp_id:', map.has('temp_id'))
            logger.log('has player1:', map.has('player1'))
        })

        action('updateKey (with validation)', () => {
            const alice = {name: 'Alice'}
            const bob = {name: 'Bob'}
            const map = new ObservableMap([
                ['p1', alice],
                ['p2', bob]
            ])

            // Update only if value matches
            const success1 = map.updateKey('p1', 'player1', alice)
            logger.log('update p1 with alice:', success1)

            const success2 = map.updateKey('p2', 'player2', alice)
            logger.log('update p2 with alice:', success2)

            logger.log('keys:', Array.from(map.keys))
        })

    })


    section('Events', () => {

        text('Listen to map modifications.')

        action('set event', () => {
            const map = new ObservableMap()

            map.on('set', (key, value, oldValue) => {
                if (oldValue === undefined) {
                    logger.log(`added ${key}: ${value}`)
                } else {
                    logger.log(`updated ${key}: ${oldValue} → ${value}`)
                }
            })

            map.set('count', 0)
            map.set('count', 1)
            map.set('count', 2)
        })

        action('delete event', () => {
            const map = new ObservableMap([
                ['a', 1],
                ['b', 2]
            ])

            map.on('delete', (key, value) => {
                logger.log(`removed ${key} (was ${value})`)
            })

            map.delete('a')
            map.delete('b')
        })

        action('set replacing value', () => {
            const map = new ObservableMap()

            map.on('set', (key, value, oldValue) => {
                logger.log('set event:', {key, value, oldValue})
            })

            map.on('delete', (key, value) => {
                logger.log('delete event:', {key, value})
            })

            map.set('key', 'first')
            logger.log('---')
            map.set('key', 'second')  // Triggers both delete and set
        })

        action('clear event', () => {
            const map = new ObservableMap([
                ['a', 1],
                ['b', 2],
                ['c', 3]
            ])

            let deleteCount = 0
            map.on('delete', () => deleteCount++)
            map.on('clear', () => logger.log('map cleared'))

            map.clear()
            logger.log('delete events:', deleteCount)
            logger.log('size:', map.size)
        })

    })


    section('Practical Examples', () => {

        text('Real-world usage patterns.')

        action('Entity registry', () => {
            const entities = new ObservableMap()

            entities.on('set', (id, entity) => {
                logger.log(`Spawned: ${entity.name} (${id})`)
            })

            entities.on('delete', (id, entity) => {
                logger.log(`Destroyed: ${entity.name} (${id})`)
            })

            entities.set('e1', {name: 'Player', health: 100})
            entities.set('e2', {name: 'Enemy', health: 50})
            entities.delete('e2')

            logger.log('active entities:', entities.size)
        })

        action('Reverse lookup', () => {
            const players = new ObservableMap()

            const alice = {name: 'Alice', score: 100}
            const bob = {name: 'Bob', score: 75}

            players.set('player1', alice)
            players.set('player2', bob)

            // Find ID by object reference
            logger.log('Alice ID:', players.keyFor(alice))
            logger.log('Bob ID:', players.keyFor(bob))

            // Verify associations
            logger.log('player1 → alice?', players.isKeyOf('player1', alice))
        })

        action('Configuration store', () => {
            const config = new ObservableMap()

            config.on('set', (key, value, oldValue) => {
                if (oldValue !== undefined) {
                    logger.log(`Config changed: ${key} = ${value}`)
                }
            })

            config.addCollection({
                volume: 0.8,
                fullscreen: false,
                quality: 'high'
            })

            logger.log('current config:', config.toObject())

            config.set('volume', 0.5)
            config.set('fullscreen', true)
        })

    })


    section('Advanced Patterns', () => {

        text('Complex use cases and patterns.')

        action('Reactive cache', () => {
            const cache = new ObservableMap()
            let hits = 0
            let misses = 0

            cache.on('set', (key, value, oldValue) => {
                if (oldValue === undefined) {
                    logger.log(`Cache miss: ${key}`)
                    misses++
                } else {
                    logger.log(`Cache update: ${key}`)
                }
            })

            const getCached = (key, compute) => {
                if (cache.has(key)) {
                    hits++
                    return cache.get(key)
                }
                const value = compute()
                cache.set(key, value)
                return value
            }

            getCached('data1', () => 'computed1')
            getCached('data1', () => 'computed1')
            getCached('data2', () => 'computed2')

            logger.log(`hits: ${hits}, misses: ${misses}`)
        })

        code('Syncing maps', () => {
            const primary = new ObservableMap()
            const replica = new ObservableMap()

            // Sync changes from primary to replica
            primary.on('set', (key, value) => {
                replica.set(key, value)
            })

            primary.on('delete', (key) => {
                replica.delete(key)
            })

            primary.set('sync', 'test')

            // replica now also has 'sync' → 'test'
        })

    })


    section('Comparison with Map', () => {

        text('ObservableMap extends native Map with events and bidirectional lookup.')

        code('Native Map equivalence', () => {
            const nativeMap = new Map([['a', 1]])
            const observableMap = new ObservableMap([['a', 1]])

            // Both support standard Map operations
            nativeMap.set('b', 2)
            observableMap.set('b', 2)  // Also emits 'set' event

            nativeMap.get('a')
            observableMap.get('a')

            // ObservableMap adds extras
            observableMap.hasValue(1)      // Reverse lookup
            observableMap.keyFor(1)        // Get key by value
            observableMap.toObject()       // Export as plain object
        })

        code('When to use ObservableMap', () => {
            // Use for reactive state management
            const reactiveState = new ObservableMap()
            reactiveState.on('set', updateUI)

            // Use native Map for simple storage
            const simpleCache = new Map()
        })

    })

})
