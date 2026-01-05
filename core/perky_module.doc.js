import {doc, section, setup, text, code, action, logger} from '../docs/runtime.js'
import PerkyModule from './perky_module.js'


export default doc('PerkyModule', {context: 'simple'}, () => {

    text(`
        Base class for all Perky components.
        Provides lifecycle management, hierarchical composition, and event handling.
    `)


    section('Creation', () => {

        text('Modules can be created directly or via subclassing.')

        code('Direct instantiation', () => {
            const module = new PerkyModule({
                $id: 'myModule',
                $category: 'custom',
                $tags: ['active', 'visible']
            })
        })

        code('Subclassing', () => {
            class Player extends PerkyModule {
                static $category = 'entity'
                static $tags = ['controllable']

                onStart () {
                    // Called when module starts
                }
            }
        })

        action('Instance properties', () => {
            const module = new PerkyModule({
                $id: 'player',
                $category: 'entity'
            })
            logger.log('$id:', module.$id)
            logger.log('$name:', module.$name)
            logger.log('$category:', module.$category)
            logger.log('$status:', module.$status)
        })

    })


    section('Lifecycle', () => {

        text(`
            Modules have a lifecycle: stopped -> started -> disposed.
            Lifecycle hooks: \`onStart\`, \`onStop\`, \`onDispose\`.
        `)

        action('start / stop', () => {
            const module = new PerkyModule({$id: 'test'})
            logger.log('initial status:', module.$status)

            module.start()
            logger.log('after start:', module.$status, 'running:', module.running)

            module.stop()
            logger.log('after stop:', module.$status, 'running:', module.running)
        })

        action('dispose', () => {
            const module = new PerkyModule({$id: 'test'})
            module.start()
            logger.log('before dispose:', module.$status)

            module.dispose()
            logger.log('after dispose:', module.$status, 'disposed:', module.disposed)
        })

        action('Lifecycle events', () => {
            const module = new PerkyModule({$id: 'test'})
            module.on('start', () => logger.log('event: start'))
            module.on('stop', () => logger.log('event: stop'))
            module.on('dispose', () => logger.log('event: dispose'))

            module.start()
            module.stop()
            module.dispose()
        })

    })


    section('Children', () => {

        text(`
            Modules can contain child modules.
            Children inherit lifecycle from their parent.
        `)

        action('create', () => {
            const parent = new PerkyModule({$id: 'parent'})

            const child = parent.create(PerkyModule, {
                $id: 'child',
                $category: 'component'
            })

            logger.log('children count:', parent.children.length)
            logger.log('child.$id:', child.$id)
            logger.log('child.host:', child.host.$id)
        })

        action('getChild / hasChild', () => {
            const parent = new PerkyModule({$id: 'parent'})
            parent.create(PerkyModule, {$id: 'player'})
            parent.create(PerkyModule, {$id: 'enemy'})

            logger.log('hasChild player:', parent.hasChild('player'))
            logger.log('hasChild boss:', parent.hasChild('boss'))
            logger.log('getChild:', parent.getChild('player').$id)
        })

        action('Lifecycle propagation', () => {
            const parent = new PerkyModule({$id: 'parent'})
            const child = parent.create(PerkyModule, {$id: 'child'})

            child.on('start', () => logger.log('child started'))
            child.on('stop', () => logger.log('child stopped'))

            logger.log('Starting parent...')
            parent.start()

            logger.log('Stopping parent...')
            parent.stop()
        })

        action('childrenByCategory', () => {
            const game = new PerkyModule({$id: 'game'})
            game.create(PerkyModule, {$id: 'player', $category: 'entity'})
            game.create(PerkyModule, {$id: 'enemy1', $category: 'entity'})
            game.create(PerkyModule, {$id: 'score', $category: 'ui'})

            const entities = game.childrenByCategory('entity')
            logger.log('entities:', entities.map(e => e.$id))
        })

    })


    section('Tags', () => {

        text('Tags allow flexible categorization and querying of modules.')

        action('Basic tags', () => {
            const module = new PerkyModule({
                $id: 'player',
                $tags: ['controllable', 'visible']
            })

            logger.log('$tags:', module.$tags)
            logger.log('hasTag visible:', module.hasTag('visible'))
            logger.log('hasTags:', module.hasTags(['controllable', 'visible']))
        })

        action('addTag / removeTag', () => {
            const module = new PerkyModule({$id: 'enemy'})

            module.addTag('hostile')
            module.addTag('visible')
            logger.log('after adding:', module.$tags)

            module.removeTag('hostile')
            logger.log('after removing:', module.$tags)
        })

        action('childrenByTags', () => {
            const game = new PerkyModule({$id: 'game'})
            game.create(PerkyModule, {$id: 'player', $tags: ['entity', 'controllable']})
            game.create(PerkyModule, {$id: 'enemy', $tags: ['entity', 'hostile']})
            game.create(PerkyModule, {$id: 'rock', $tags: ['entity']})

            logger.log('entities:', game.childrenByTags('entity').map(c => c.$id))
            logger.log('hostile:', game.childrenByTags(['entity', 'hostile']).map(c => c.$id))
        })

    })


    section('Query', () => {

        text('CSS-like selectors for finding modules in the hierarchy.')

        action('query / queryAll', () => {
            const app = new PerkyModule({$id: 'app'})
            const game = app.create(PerkyModule, {$id: 'game', $category: 'scene'})
            game.create(PerkyModule, {$id: 'player', $category: 'entity', $tags: ['controllable']})
            game.create(PerkyModule, {$id: 'enemy', $category: 'entity', $tags: ['hostile']})

            logger.log('query #player:', app.query('#player')?.$id)
            logger.log('queryAll entity:', app.queryAll('entity').map(e => e.$id))
            logger.log('queryAll .hostile:', app.queryAll('.hostile').map(e => e.$id))
        })

    })


    section('Events', () => {

        text('PerkyModule extends Notifier for event handling.')

        action('on / emit', () => {
            const module = new PerkyModule({$id: 'test'})

            module.on('damage', amount => {
                logger.log('received damage:', amount)
            })

            module.emit('damage', 25)
            module.emit('damage', 50)
        })

        action('listenTo', () => {
            const player = new PerkyModule({$id: 'player'})
            const enemy = new PerkyModule({$id: 'enemy'})

            player.listenTo(enemy, 'attack', damage => {
                logger.log('player received attack:', damage)
            })

            enemy.emit('attack', 30)
        })

    })

})
