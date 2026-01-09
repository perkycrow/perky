import {doc, section, setup, text, code, action, logger} from '../doc/runtime.js'
import PerkyModule from './perky_module.js'


export default doc('PerkyModule', () => {

    text(`
        Base class for all Perky components.
        Provides lifecycle management, hierarchical composition, and event handling.

        For a conceptual introduction, see the [[PerkyModule:guide]] guide.
    `)


    section('$ Convention', () => {

        text(`
            All Perky configuration properties are prefixed with \`$\` to avoid conflicts
            with your own properties. This convention ensures that you can freely use
            any property name without risking collision with internal configuration.
        `)

        code('Reserved $ properties', () => {
            const module = new PerkyModule({
                $id: 'player',
                $name: 'Player',
                $category: 'entity',
                $tags: ['controllable'],
                $bind: 'player',
                $lifecycle: true,
                $eagerStart: true
            })

            // Your own properties are safe
            module.health = 100
            module.name = 'Hero'  // No conflict with $name
            module.id = 'custom'  // No conflict with $id
        })

    })


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
            Modules can contain child modules, stored in a [[Registry]] (\`childrenRegistry\`).
            Children inherit lifecycle from their parent.

            Use \`create()\` to add children - it handles installation and lifecycle binding.
            Using \`new\` directly won't call \`onInstall\` or set up the parent-child relationship.
        `)

        action('create', () => {
            const parent = new PerkyModule({$id: 'parent'})

            parent.create(PerkyModule, {$id: 'child1', $category: 'component'})
            parent.create(PerkyModule, {$id: 'child2', $category: 'component'})

            logger.log('children:', parent.children.map(c => c.$id))
            logger.log('hasChild:', parent.hasChild('child1'))
            logger.log('getChild:', parent.getChild('child1').$id)
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

        text(`
            By default, \`$eagerStart\` is \`true\`. When a child is created on an already
            started parent, the child will automatically start. Use \`$eagerStart: false\`
            to defer startup and control it manually.
        `)

        action('$eagerStart (default: true)', () => {
            const parent = new PerkyModule({$id: 'parent'})
            parent.start()
            logger.log('parent started:', parent.started)

            // Child auto-starts because $eagerStart is true by default
            const eager = parent.create(PerkyModule, {$id: 'eager'})
            logger.log('eager.started:', eager.started)

            // Disable auto-start with $eagerStart: false
            const lazy = parent.create(PerkyModule, {
                $id: 'lazy',
                $eagerStart: false
            })
            logger.log('lazy.started:', lazy.started)

            // Lazy child can be started manually
            lazy.start()
            logger.log('lazy after manual start:', lazy.started)
        })

        action('childrenByCategory', () => {
            const game = new PerkyModule({$id: 'game'})
            game.create(PerkyModule, {$id: 'player', $category: 'entity'})
            game.create(PerkyModule, {$id: 'enemy1', $category: 'entity'})
            game.create(PerkyModule, {$id: 'score', $category: 'ui'})

            const entities = game.childrenByCategory('entity')
            logger.log('entities:', entities.map(e => e.$id))
        })

        action('removeChild', () => {
            const game = new PerkyModule({$id: 'game'})
            const enemy = game.create(PerkyModule, {$id: 'enemy'})

            logger.log('before:', game.hasChild('enemy'))

            game.removeChild('enemy')
            logger.log('after:', game.hasChild('enemy'))
            logger.log('enemy disposed:', enemy.disposed)
        })

    })


    section('Tags', () => {

        text(`
            Tags allow flexible categorization and querying of modules.
            Internally, tags are stored as an [[ObservableSet]], accessible via \`module.tags\`.
        `)

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

        text(`
            Path-based selectors for finding modules in the hierarchy.
            \`#id\` matches by $id, \`.tag\` by tag, \`@category\` by $category.

            Each space-separated segment matches **direct children only** (not deep descendants).
            This is intentional for O(1) performance in gameloops.
            See [[PerkyQuery]] for full syntax.
        `)

        action('query / queryAll', () => {
            const app = new PerkyModule({$id: 'app'})
            const game = app.create(PerkyModule, {$id: 'game', $category: 'scene'})
            game.create(PerkyModule, {$id: 'player', $category: 'entity', $tags: ['controllable']})
            game.create(PerkyModule, {$id: 'enemy', $category: 'entity', $tags: ['hostile']})

            // Direct child queries
            logger.log('#game:', app.query('#game')?.$id)
            logger.log('#game @entity:', app.queryAll('#game @entity').map(e => e.$id))
            logger.log('#game .hostile:', app.query('#game .hostile')?.$id)
        })

    })


    section('Events', () => {

        text('PerkyModule extends [[Notifier]] for event handling.')

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


    section('Delegation', () => {

        text(`
            Modules can delegate methods and events to their parent.
            This is useful for creating facade patterns where a child exposes its API through the parent.
        `)

        action('delegateTo', () => {
            class AudioSystem extends PerkyModule {
                play (sound) {
                    logger.log('playing:', sound)
                }

                stop () {
                    logger.log('stopping audio')
                }

                onInstall (host) {
                    this.delegateTo(host, ['play', 'stop'])
                }
            }

            const game = new PerkyModule({$id: 'game'})
            game.create(AudioSystem, {$id: 'audio'})

            game.play('explosion.mp3')
            game.stop()
        })

        action('delegateEventsTo', () => {
            const game = new PerkyModule({$id: 'game'})
            const player = game.create(PerkyModule, {$id: 'player'})

            player.delegateEventsTo(game, ['damage', 'death'], 'player')

            game.on('player:damage', amount => logger.log('game heard player damage:', amount))
            game.on('player:death', () => logger.log('game heard player death'))

            player.emit('damage', 50)
            player.emit('death')
        })

    })

})
