import {doc, section, setup, text, code, action, logger} from '../doc/runtime.js'
import Registry from './registry.js'


export default doc('Registry', {context: 'simple'}, () => {

    text(`
        Extended ObservableMap with indexing capabilities.
        Allows fast lookups by custom keys through secondary indexes.
    `)


    section('Basic Usage', () => {

        text('Registry extends ObservableMap, so it supports all Map operations.')

        action('set / get', () => {
            const registry = new Registry()

            registry.set('player1', {name: 'Alice', level: 10})
            registry.set('player2', {name: 'Bob', level: 15})

            logger.log('player1:', registry.get('player1'))
            logger.log('size:', registry.size)
        })

        action('delete / clear', () => {
            const registry = new Registry([
                ['a', {value: 1}],
                ['b', {value: 2}],
                ['c', {value: 3}]
            ])

            logger.log('initial size:', registry.size)
            registry.delete('a')
            logger.log('after delete:', registry.size)
            registry.clear()
            logger.log('after clear:', registry.size)
        })

    })


    section('Creating Indexes', () => {

        text(`
            Indexes allow fast lookups by custom keys.
            Use property names, functions, or multi-value functions.
        `)

        action('addIndex (property name)', () => {
            const registry = new Registry()

            registry.set('player1', {name: 'Alice', level: 10})
            registry.set('player2', {name: 'Bob', level: 15})
            registry.set('player3', {name: 'Charlie', level: 10})

            registry.addIndex('level')

            logger.log('level 10:', registry.lookup('level', 10))
            logger.log('level 15:', registry.lookup('level', 15))
        })

        action('addIndex (function)', () => {
            const registry = new Registry()

            registry.set('item1', {name: 'Sword', category: 'weapon'})
            registry.set('item2', {name: 'Shield', category: 'armor'})
            registry.set('item3', {name: 'Axe', category: 'weapon'})

            registry.addIndex('category', item => item.category)

            logger.log('weapons:', registry.lookup('category', 'weapon'))
            logger.log('armor:', registry.lookup('category', 'armor'))
        })

        code('Multi-value indexes', () => {
            const registry = new Registry()

            registry.set('player1', {
                name: 'Alice',
                tags: ['warrior', 'leader']
            })
            registry.set('player2', {
                name: 'Bob',
                tags: ['mage', 'leader']
            })

            // Return array for multi-value index
            registry.addIndex('tags', item => item.tags)

            // Now can lookup by any tag
            const leaders = registry.lookup('tags', 'leader')
            const warriors = registry.lookup('tags', 'warrior')
        })

    })


    section('Looking Up Values', () => {

        setup(ctx => {
            ctx.registry = new Registry()
            ctx.registry.set('p1', {name: 'Alice', team: 'red'})
            ctx.registry.set('p2', {name: 'Bob', team: 'blue'})
            ctx.registry.set('p3', {name: 'Charlie', team: 'red'})
            ctx.registry.addIndex('team')
        })

        text('Retrieve items or keys using indexes.')

        action('lookup', ctx => {
            logger.log('red team:', ctx.registry.lookup('team', 'red'))
            logger.log('blue team:', ctx.registry.lookup('team', 'blue'))
            logger.log('no match:', ctx.registry.lookup('team', 'green'))
        })

        action('lookupKeys', ctx => {
            logger.log('red team keys:', ctx.registry.lookupKeys('team', 'red'))
            logger.log('blue team keys:', ctx.registry.lookupKeys('team', 'blue'))
        })

    })


    section('Managing Indexes', () => {

        text('Check, remove, and update indexes.')

        action('hasIndex / removeIndex', () => {
            const registry = new Registry()
            registry.addIndex('category')

            logger.log('has category:', registry.hasIndex('category'))
            logger.log('has level:', registry.hasIndex('level'))

            registry.removeIndex('category')
            logger.log('after remove:', registry.hasIndex('category'))
        })

        action('updateIndexFor', () => {
            const registry = new Registry()
            const player = {name: 'Alice', team: 'red'}

            registry.set('p1', player)
            registry.addIndex('team')

            logger.log('before update:', registry.lookup('team', 'red'))

            // Manually update index when property changes
            player.team = 'blue'
            registry.updateIndexFor(player, 'team', 'red', 'blue')

            logger.log('red team:', registry.lookup('team', 'red'))
            logger.log('blue team:', registry.lookup('team', 'blue'))
        })

        action('refreshIndexFor', () => {
            const registry = new Registry()
            const player = {name: 'Alice', level: 10}

            registry.set('p1', player)
            registry.addIndex('level')

            logger.log('before:', registry.lookup('level', 10))

            // Change property and refresh index
            player.level = 15
            registry.refreshIndexFor(player, 'level')

            logger.log('level 10:', registry.lookup('level', 10))
            logger.log('level 15:', registry.lookup('level', 15))
        })

    })


    section('Automatic Index Updates', () => {

        text('Indexes automatically update when items are added or removed.')

        action('Auto-update on set', () => {
            const registry = new Registry()
            registry.addIndex('type')

            registry.set('enemy1', {type: 'goblin'})
            logger.log('goblins:', registry.lookup('type', 'goblin').length)

            registry.set('enemy2', {type: 'goblin'})
            logger.log('after adding:', registry.lookup('type', 'goblin').length)
        })

        action('Auto-update on delete', () => {
            const registry = new Registry()
            registry.addIndex('type')

            registry.set('e1', {type: 'orc'})
            registry.set('e2', {type: 'orc'})

            logger.log('before delete:', registry.lookup('type', 'orc').length)
            registry.delete('e1')
            logger.log('after delete:', registry.lookup('type', 'orc').length)
        })

    })


    section('Advanced Patterns', () => {

        text('Combine indexes for complex queries.')

        action('Multiple indexes', () => {
            const registry = new Registry()

            registry.set('i1', {name: 'Sword', rarity: 'common', type: 'weapon'})
            registry.set('i2', {name: 'Shield', rarity: 'rare', type: 'armor'})
            registry.set('i3', {name: 'Axe', rarity: 'common', type: 'weapon'})
            registry.set('i4', {name: 'Helmet', rarity: 'rare', type: 'armor'})

            registry.addIndex('rarity')
            registry.addIndex('type')

            logger.log('common items:', registry.lookup('rarity', 'common'))
            logger.log('weapons:', registry.lookup('type', 'weapon'))
            logger.log('rare armor:',
                registry.lookup('rarity', 'rare')
                    .filter(item => item.type === 'armor')
            )
        })

        code('Observable integration', () => {
            const registry = new Registry()

            // Registry extends ObservableMap
            registry.on('set', (key, value) => {
                console.log('added:', key, value)
            })

            registry.on('delete', (key, value) => {
                console.log('removed:', key, value)
            })

            registry.set('item', {data: 'test'})
        })

    })

})
