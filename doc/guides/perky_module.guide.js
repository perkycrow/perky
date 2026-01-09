import {doc, section, text, code, action, logger} from '../runtime.js'
import PerkyModule from '../../core/perky_module.js'


export default doc('PerkyModule', () => {

    text(`
        This is the foundation. Most things in Perky are modules.

        Your game? Module. Player? Module. Systems, levels, entities - modules.
        Once you understand how modules work, you understand most of the framework.

        See [[PerkyModule]] for the full API reference.
    `)


    section('Modules Are Trees', () => {

        text(`
            A module can have children. Children can have children.
            It's trees all the way down.

            This structure is intentional. Games are hierarchies:
            Game → Levels → Entities → Components.
            Perky just makes it explicit.
        `)

        action('Parent and children', () => {
            const game = new PerkyModule({$id: 'game'})

            const player = game.create(PerkyModule, {$id: 'player'})
            const enemy = game.create(PerkyModule, {$id: 'enemy'})

            logger.log('game has', game.children.length, 'children')
            logger.log('player host:', player.host.$id)
            logger.log('enemy host:', enemy.host.$id)
        })

        text(`
            Use \`create()\` to add children. Never \`new\` directly.

            \`create()\` sets up the parent-child relationship, calls \`onInstall\`,
            and binds lifecycles. \`new\` alone gives you an orphan module.

            Children are stored in a [[Registry]] - fast O(1) lookups by $id or $category.
        `)

    })


    section('The $ Convention', () => {

        text(`
            Notice the \`$id\`, \`$category\`, \`$tags\`? The dollar sign is intentional.

            All Perky configuration uses \`$\` prefixes. Your own properties don't.
            This means you can name your stuff whatever you want - no collisions.
        `)

        action('Your properties are safe', () => {
            const player = new PerkyModule({
                $id: 'player',
                $name: 'Hero',
                $category: 'entity'
            })

            player.name = 'Alice'
            player.health = 100
            player.id = 'custom-id'

            logger.log('$name (config):', player.$name)
            logger.log('name (yours):', player.name)
            logger.log('$id (config):', player.$id)
            logger.log('id (yours):', player.id)
        })

        text(`
            The reserved \`$\` properties:
            - \`$id\` - unique identifier in parent's registry
            - \`$name\` - human-readable name
            - \`$category\` - for grouping and queries
            - \`$tags\` - flexible labels for filtering
            - \`$bind\` - auto-assign to parent property
            - \`$lifecycle\` - participate in start/stop
            - \`$eagerStart\` - auto-start when parent is running

            All of these are optional. When you use \`create()\`, missing values are
            derived automatically: \`$category\` from the class, \`$name\` from category,
            \`$id\` from name. IDs auto-increment to stay unique: \`enemy\`, \`enemy_1\`, \`enemy_2\`.
        `)

        action('Auto-generated IDs', () => {
            const game = new PerkyModule({$id: 'game'})

            const m1 = game.create(PerkyModule)
            const m2 = game.create(PerkyModule)
            const e1 = game.create(PerkyModule, {$name: 'enemy'})
            const e2 = game.create(PerkyModule, {$name: 'enemy'})

            logger.log('m1.$id:', m1.$id)
            logger.log('m2.$id:', m2.$id)
            logger.log('e1.$id:', e1.$id)
            logger.log('e2.$id:', e2.$id)
        })

    })


    section('Lifecycle Is Automatic', () => {

        text(`
            Modules have three states: **stopped**, **started**, **disposed**.

            Here's the beautiful part: children follow their parent.
            Start the parent → children start. Stop the parent → children stop.
            No manual wiring needed.
        `)

        action('Lifecycle flows down', () => {
            const game = new PerkyModule({$id: 'game'})
            const player = game.create(PerkyModule, {$id: 'player'})

            player.on('start', () => logger.log('player: started'))
            player.on('stop', () => logger.log('player: stopped'))

            logger.log('Starting game...')
            game.start()

            logger.log('Stopping game...')
            game.stop()
        })

        text(`
            Disposed means dead. Resources cleaned up, listeners removed, children disposed.
            There's no coming back. Create a new module instead.
        `)

    })


    section('Eager Start', () => {

        text(`
            What happens when you create a child on an already-running parent?

            By default, the child starts immediately. This is \`$eagerStart: true\`.
            It's what you want 99% of the time - spawn an enemy mid-game, it's ready to go.
        `)

        action('Eager vs lazy', () => {
            const game = new PerkyModule({$id: 'game'})
            game.start()
            logger.log('game started:', game.started)

            const eager = game.create(PerkyModule, {$id: 'eager'})
            logger.log('eager.started:', eager.started)

            const lazy = game.create(PerkyModule, {
                $id: 'lazy',
                $eagerStart: false
            })
            logger.log('lazy.started:', lazy.started)

            lazy.start()
            logger.log('lazy after manual start:', lazy.started)
        })

    })


    section('Finding Things', () => {

        text(`
            Queries let you find modules without keeping references everywhere.

            The syntax: \`#id\` for $id, \`@category\` for $category, \`.tag\` for tags.
            Combine them: \`@entity.hostile\` finds entities with the hostile tag.
        `)

        action('Query examples', () => {
            const game = new PerkyModule({$id: 'game'})
            game.create(PerkyModule, {$id: 'player', $category: 'entity', $tags: ['controllable']})
            game.create(PerkyModule, {$id: 'enemy1', $category: 'entity', $tags: ['hostile']})
            game.create(PerkyModule, {$id: 'enemy2', $category: 'entity', $tags: ['hostile']})

            logger.log('#player:', game.query('#player')?.$id)
            logger.log('@entity:', game.queryAll('@entity').map(e => e.$id))
            logger.log('.hostile:', game.queryAll('.hostile').map(e => e.$id))
            logger.log('@entity.hostile:', game.queryAll('@entity.hostile').map(e => e.$id))
        })

        text(`
            **Important**: queries match **direct children only**.

            This isn't CSS descendant matching. Each space-separated segment
            goes one level deeper. \`#game #level #player\` means:
            game's child level's child player.

            Why? O(1) lookups. In a gameloop, you need predictable performance.
            See [[PerkyQuery]] for the full selector syntax.
        `)

        action('Multi-level paths', () => {
            const app = new PerkyModule({$id: 'app'})
            const game = app.create(PerkyModule, {$id: 'game'})
            const level = game.create(PerkyModule, {$id: 'level'})
            level.create(PerkyModule, {$id: 'player', $tags: ['hero']})

            logger.log('Wrong (skips levels):', app.query('#player'))
            logger.log('Right (full path):', app.query('#game #level #player')?.$id)
        })

    })


    section('Events', () => {

        text(`
            Modules are event emitters. Use \`on()\` to listen, \`emit()\` to broadcast.
            This comes from [[Notifier]], the event system underneath.

            The pattern is simple: things happen, other things react.
            Damage dealt, score updated, level completed - all events.
        `)

        action('Emit and listen', () => {
            const player = new PerkyModule({$id: 'player'})

            player.on('damage', (amount) => {
                logger.log('took', amount, 'damage')
            })

            player.emit('damage', 25)
            player.emit('damage', 50)
        })

        text(`
            When listening to **other** modules, use \`listenTo()\` instead of \`on()\`.

            Why? Memory leaks. Say an enemy follows the player with
            \`player.on('move', () => enemy.follow())\`. The player keeps a reference
            to enemy in that callback. When the enemy dies and you call \`enemy.dispose()\`,
            the garbage collector can't clean it up - player still holds that callback.

            \`listenTo()\` tracks these external listeners. When the enemy is disposed,
            its listeners on other modules are automatically removed. No leaks.
        `)

        action('Listen to others', () => {
            const player = new PerkyModule({$id: 'player'})
            const enemy = new PerkyModule({$id: 'enemy'})

            enemy.listenTo(player, 'move', (x, y) => {
                logger.log('enemy follows player to', x, y)
            })

            player.emit('move', 100, 50)
        })

    })


    section('Extending Modules', () => {

        text(`
            The real power comes from subclassing.

            Define static \`$category\` and \`$tags\` on your class.
            Override \`onStart\`, \`onStop\`, \`onInstall\` for lifecycle hooks.
        `)

        code('Custom module class', () => {
            class Player extends PerkyModule {
                static $category = 'entity'
                static $tags = ['controllable']

                health = 100

                onStart () {
                    this.health = 100
                }

                takeDamage (amount) {
                    this.health -= amount
                    this.emit('damage', amount)

                    if (this.health <= 0) {
                        this.emit('death')
                    }
                }
            }
        })

        text(`
            Lifecycle hooks:
            - \`onInstall(host, options)\` - called when added to parent
            - \`onUninstall(host)\` - called when removed from parent
            - \`onStart()\` - called when started
            - \`onStop()\` - called when stopped
            - \`onDispose()\` - called when disposed (cleanup time)
        `)

    })


    section('When To Use What', () => {

        text(`
            **Use \`$id\`** when you need to reference a specific module.
            The player, the main menu, the boss.

            **Use \`$category\`** for type-based lookups.
            All entities, all UI elements, all audio sources.

            **Use \`$tags\`** for dynamic filtering.
            Hostile enemies, visible objects, selected items.
            Tags are stored as an [[ObservableSet]] - add and remove at runtime.

            **Use \`$bind\`** for quick access.
            \`$bind: 'player'\` makes \`parent.player\` point to this module.
        `)

        action('$bind in action', () => {
            const game = new PerkyModule({$id: 'game'})

            game.create(PerkyModule, {
                $id: 'playerModule',
                $bind: 'player'
            })

            logger.log('game.player:', game.player.$id)
        })

    })


    section('The Mental Model', () => {

        text(`
            Think of your game as a living tree.

            - **Root** - your Game module
            - **Branches** - systems and levels
            - **Leaves** - entities, particles, UI elements

            Events flow through the tree. Lifecycle cascades from root to leaves.
            Queries let you reach into any branch.

            Keep it shallow when you can. Deep hierarchies are harder to debug.

            ---

            That said, PerkyModule is entirely optional. It's the backbone of Perky,
            but not a requirement. Structure your game or app however you want.
            Use only what you need.
        `)

    })

})
