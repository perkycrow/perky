import {doc, section, text, code, action, logger} from '../runtime.js'
import PerkyModule from '../../core/perky_module.js'


export default doc('PerkyModule', () => {

    text(`
        If there's one thing to learn in Perky, it's this: everything is a module.

        Your game, your player, that enemy AI you're slightly proud of - all modules.
        Get comfortable with how they work and the rest will follow.

        See [[PerkyModule]] for the full API reference.
    `)


    section('Modules Are Trees', () => {

        text(`
            A module can have children. Children can have children. You get the idea.

            This maps well to how games are often structured:
            Game → Levels → Entities.
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
            Use \`create()\` to add children - it's the standard way.
            For special cases, \`addChild()\` lets you create a module first and attach it later.

            Under the hood, children live in a [[Registry]] with O(1) lookups by $id or $category.
        `)

    })


    section('The $ Convention', () => {

        text(`
            You've probably noticed the \`$id\`, \`$category\`, \`$tags\`. The dollar sign isn't random.

            All Perky config uses \`$\` prefixes. Your own properties don't. So go ahead, use \`id\`,
            \`name\`, \`category\` for your game logic - they won't collide with Perky's internals.
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
            Here's the full list of reserved \`$\` properties:

            **\`$id\`** - unique identifier. Use when you need a specific module (the player, the boss).

            **\`$name\`** - human-readable name. Defaults to category if not set.

            **\`$category\`** - for type-based lookups. All entities, all UI panels, all audio sources.

            **\`$tags\`** - for dynamic filtering. Hostile enemies, visible objects, selected items.
            Tags live in an [[ObservableSet]], so you can add and remove them at runtime.

            **\`$bind\`** - convenience shortcut. \`$bind: 'player'\` makes \`parent.player\` point to this module.

            **\`$lifecycle\`** - whether the module participates in start/stop.

            **\`$eagerStart\`** - auto-start when created on a running parent (default: true).

            All optional. When you use \`create()\` without specifying them, Perky figures it out:
            \`$category\` from the class name, \`$name\` from category, \`$id\` from name.
            Multiple modules with the same name? IDs auto-increment: \`enemy\`, \`enemy_1\`, \`enemy_2\`.
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


    section('Lifecycle', () => {

        text(`
            Modules have three states: **stopped**, **started**, **disposed**.

            Children follow their parent automatically.
            Start the game, all entities start. Stop the game, everything stops.
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
            If you spawn a child while the parent is already running, the child starts immediately.
            That's \`$eagerStart: true\` (the default). Set it to \`false\` if you need manual control.

            Once disposed, a module is gone for good - listeners removed, children disposed,
            resources cleaned up. There's no resurrection. Just create a new one.
        `)

    })


    section('Finding Things', () => {

        text(`
            Need to find a module without passing references everywhere? Queries.

            The syntax: \`#id\` for $id, \`@category\` for $category, \`.tag\` for tags.
            Mix them: \`@entity.hostile\` finds entities tagged as hostile.
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
            One thing to know: queries only match **direct children**.

            This isn't CSS. \`#game #level #player\` means: game's child "level", then level's child "player".
            Each space goes one level deeper.

            Why this constraint? O(1) lookups. In a game loop, predictable performance matters.
            See [[PerkyQuery]] for the full syntax.
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
            Modules are event emitters. \`on()\` to listen, \`emit()\` to broadcast.
            This comes from [[Notifier]], the event system underneath.

            The idea: things happen, other things react. Damage taken, score updated, level cleared.
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

            Here's why. Say an enemy follows the player:
            \`player.on('move', () => enemy.follow())\`

            The player now holds a reference to enemy in that callback. When the enemy dies
            and you call \`dispose()\`, the garbage collector can't clean it up - player still
            has that callback.

            \`listenTo()\` solves this. It tracks which modules you're listening to, and when
            you're disposed, those listeners are automatically removed.
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
            Most of the time, you'll subclass PerkyModule to make your own.

            Add static \`$category\` and \`$tags\` on the class itself.
            Override lifecycle hooks like \`onStart\`, \`onStop\`, \`onInstall\`.
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
            Available lifecycle hooks:
            - \`onInstall(host, options)\` - added to a parent
            - \`onUninstall(host)\` - removed from parent
            - \`onStart()\` - module started
            - \`onStop()\` - module stopped
            - \`onDispose()\` - cleanup time
        `)

    })


    section('The Mental Model', () => {

        text(`
            Picture your game as a tree.

            The root is your Game. Branches are systems and levels. Leaves are entities,
            particles, UI bits. Lifecycle flows from root to leaves. Queries let you reach
            into any branch.

            Keep it shallow when you can - deep hierarchies get tricky to debug.

            ---

            That said, PerkyModule is just one way to structure things. It's the backbone
            of Perky, but not mandatory. Use what helps, skip what doesn't.
        `)

    })

})
