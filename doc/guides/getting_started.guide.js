import {doc, section, text, code, action, logger} from '../runtime.js'
import PerkyModule from '../../core/perky_module.js'
import Game from '../../game/game.js'
import Entity from '../../game/entity.js'


export default doc('Getting Started', () => {

    text(`
        Let's build something. By the end of this guide, you'll understand how Perky thinks.

        We'll start with the basics and work our way up to a simple interactive demo.
    `)


    section('Everything is a Module', () => {

        text(`
            The core of Perky is \`PerkyModule\`. Your game, your player, your UI — all modules.

            Modules can have children. Children can have children. It's modules all the way down.
        `)

        action('Create a module', () => {
            const module = new PerkyModule({$id: 'myModule'})

            logger.log('$id:', module.$id)
            logger.log('$status:', module.$status)
        })

        action('Add children', () => {
            const game = new PerkyModule({$id: 'game'})

            const player = game.create(PerkyModule, {$id: 'player'})
            const enemy = game.create(PerkyModule, {$id: 'enemy'})

            logger.log('children:', game.children.length)
            logger.log('player host:', player.host.$id)
        })

    })


    section('Lifecycle', () => {

        text(`
            Modules have a lifecycle: **stopped** → **started** → **disposed**.

            When a parent starts, its children start. When it stops, they stop. Simple.
        `)

        action('Start and stop', () => {
            const game = new PerkyModule({$id: 'game'})
            const player = game.create(PerkyModule, {$id: 'player'})

            player.on('start', () => logger.log('player started'))
            player.on('stop', () => logger.log('player stopped'))

            game.start()
            game.stop()
        })

    })


    section('Events', () => {

        text(`
            Modules can emit and listen to events. This is how they communicate.

            Use \`on()\` to listen, \`emit()\` to broadcast.
        `)

        action('Basic events', () => {
            const player = new PerkyModule({$id: 'player'})

            player.on('damage', (amount) => {
                logger.log('took damage:', amount)
            })

            player.emit('damage', 25)
            player.emit('damage', 50)
        })

        action('Listen to other modules', () => {
            const player = new PerkyModule({$id: 'player'})
            const enemy = new PerkyModule({$id: 'enemy'})

            player.listenTo(enemy, 'attack', (damage) => {
                logger.log('enemy attacked for', damage)
            })

            enemy.emit('attack', 30)
        })

    })


    section('Entities', () => {

        text(`
            For things that move, there's \`Entity\`. It adds \`position\` and \`velocity\` vectors.

            Entities are modules. Same patterns, more features.
        `)

        action('Position and velocity', () => {
            const player = new Entity({x: 0, y: 0})

            logger.log('position:', player.x, player.y)

            player.velocity.set(1, 0.5)
            player.position.add(player.velocity)

            logger.log('after move:', player.x, player.y)
        })

    })


    section('Querying', () => {

        text(`
            Find modules using CSS-like selectors. \`#id\`, \`category\`, \`.tag\`.

            \`query()\` returns the first match. \`queryAll()\` returns all matches.
        `)

        action('Find modules', () => {
            const game = new PerkyModule({$id: 'game'})
            game.create(PerkyModule, {$id: 'player', $category: 'entity', $tags: ['controllable']})
            game.create(PerkyModule, {$id: 'enemy1', $category: 'entity', $tags: ['hostile']})
            game.create(PerkyModule, {$id: 'enemy2', $category: 'entity', $tags: ['hostile']})

            logger.log('by id:', game.query('#player')?.$id)
            logger.log('by category:', game.queryAll('entity').map(e => e.$id))
            logger.log('by tag:', game.queryAll('.hostile').map(e => e.$id))
        })

    })


    section('Building a Game', () => {

        text(`
            The \`Game\` class brings it all together: a game loop, input handling, and a render system.

            Here's the basic structure. We'll get to interactive examples soon.
        `)

        code('Game class structure', () => {
            class MyGame extends Game {

                static $name = 'myGame'

                configureGame () {
                    this.world = this.create(PerkyModule, {$id: 'world'})

                    this.on('update', (delta) => {
                        // Game logic here
                    })

                    this.on('render', () => {
                        // Rendering here
                    })
                }


                onStart () {
                    // Called when game starts
                }

            }
        })

    })


    section('Next Steps', () => {

        text(`
            That's the foundation. From here you can:

            - Create custom entities with \`update()\` methods
            - Set up input handling with \`InputSystem\`
            - Add rendering with \`Canvas2d\` or \`WebglCanvas2d\`
            - Use \`ActionDispatcher\` for complex game logic

            Check the API docs for each module. Or just start building.
        `)

    })

})
