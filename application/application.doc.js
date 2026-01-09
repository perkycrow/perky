import {doc, section, text, code, action, container, logger} from '../doc/runtime.js'
import Application from './application.js'
import ActionController from '../core/action_controller.js'


export default doc('Application', {context: 'simple'}, () => {

    text(`
        Main entry point for Perky applications.
        Extends [[PerkyModule]] with built-in systems for view, input, assets, and actions.
    `)


    section('Creation', () => {

        code('Subclass with manifest', () => {
            class MyGame extends Application {
                static manifest = {
                    config: {title: 'My Game'},
                    assets: {
                        hero: {type: 'sprite', url: '/hero.png', tags: ['preload']}
                    }
                }

                configureApplication () {
                    this.setConfig('debug', true)
                }
            }

            const game = new MyGame({$id: 'game'})
            game.mount(document.getElementById('app'))
            game.start()
        })

    })


    section('Built-in Systems', () => {

        text(`
            Application automatically creates these child modules:

            - \`manifest\` - [[Manifest]] for config and assets
            - \`actionDispatcher\` - [[ActionDispatcher]] for action routing
            - \`perkyView\` - [[PerkyView]] for DOM and display
            - \`sourceManager\` - [[SourceManager]] for asset loading
            - \`inputSystem\` - [[InputSystem]] for keyboard, mouse, touch
        `)

    })


    section('Configuration', () => {

        text('Config methods are delegated from [[Manifest]].')

        action('setConfig / getConfig', () => {
            const app = new Application({$id: 'demo'})

            // Nested path
            app.setConfig('game.title', 'My Game')
            logger.log('title:', app.getConfig('game.title'))

            // Direct key
            app.setConfig('debug', true)
            logger.log('debug:', app.getConfig('debug'))
        })

    })


    section('Assets', () => {

        text('Asset methods are delegated from [[Manifest]] and [[SourceManager]].')

        container({title: 'Load and display assets', height: 200, preset: 'centered'}, ctx => {
            const updateDisplay = ctx.display(content => content || 'Loading...')

            const app = new Application({
                $id: 'demo',
                manifest: {
                    assets: {
                        shroom: {type: 'image', url: './assets/images/shroom.png', tags: ['preload']}
                    }
                }
            })

            // Add asset dynamically
            app.addAsset({id: 'spore', type: 'image', url: './assets/images/spore.png', tags: ['preload']})

            app.start()

            app.on('loader:complete', () => {
                const wrapper = document.createElement('div')
                wrapper.style.cssText = 'display:flex;gap:20px;align-items:center'

                const img1 = app.getSource('shroom')
                const img2 = app.getSource('spore')
                img1.style.width = '80px'
                img2.style.width = '80px'

                wrapper.appendChild(img1)
                wrapper.appendChild(img2)
                updateDisplay(wrapper)
            })

            app.preload()

            ctx.setApp(app)
        })

        code('Loading events', () => {
            const app = new Application({$id: 'demo'})

            app.on('loader:progress', ({loaded, total}) => {
                console.log(`Loading: ${loaded}/${total}`)
            })

            app.on('loader:complete', () => {
                console.log('All assets loaded')
            })

            app.on('loader:error', ({asset, error}) => {
                console.error(`Failed to load ${asset.id}:`, error)
            })
        })

    })


    section('View', () => {

        text('View methods are delegated from [[PerkyView]].')

        container({title: 'Resize events', height: 200, preset: 'centered'}, ctx => {
            const app = new Application({$id: 'demo'})
            app.mount(ctx.container)
            app.start()

            app.on('resize', ({width, height}) => {
                logger.log('resize:', width, '×', height)
            })

            ctx.slider('Height', {min: 100, max: 400, default: 200, step: 10}, h => {
                ctx.container.style.height = h + 'px'
            })

            ctx.setApp(app)
        })

        code('mount / dismount', () => {
            const app = new Application({$id: 'demo'})
            const el = document.getElementById('app')

            app.mount(el)
            console.log(app.mounted) // true
            console.log(app.element) // DOM element

            app.dismount()
        })

    })


    section('Input', () => {

        text('Input methods are delegated from [[InputSystem]].')

        container({title: 'Move the box', height: 200, preset: 'interactive'}, ctx => {
            ctx.hint('Use WASD or arrow keys')

            const app = new Application({$id: 'demo'})
            app.mount(ctx.container)
            app.start()

            const box = ctx.box({size: 40})
            const w = ctx.container.offsetWidth
            const h = ctx.container.offsetHeight
            let x = w / 2
            let y = h / 2

            // Bind movement keys
            app.bindInput({controlName: 'KeyW', actionName: 'moveUp'})
            app.bindInput({controlName: 'KeyS', actionName: 'moveDown'})
            app.bindInput({controlName: 'KeyA', actionName: 'moveLeft'})
            app.bindInput({controlName: 'KeyD', actionName: 'moveRight'})
            app.bindInput({controlName: 'ArrowUp', actionName: 'moveUp'})
            app.bindInput({controlName: 'ArrowDown', actionName: 'moveDown'})
            app.bindInput({controlName: 'ArrowLeft', actionName: 'moveLeft'})
            app.bindInput({controlName: 'ArrowRight', actionName: 'moveRight'})

            // Game loop
            const speed = 3
            const loop = () => {
                const dir = app.getDirection('move')
                x = Math.max(20, Math.min(w - 20, x + dir.x * speed))
                y = Math.max(20, Math.min(h - 20, y - dir.y * speed))
                box.style.left = x + 'px'
                box.style.top = y + 'px'
                requestAnimationFrame(loop)
            }
            loop()

            ctx.setApp(app)
        })

        container({title: 'Action events', height: 150, preset: 'interactive-alt'}, ctx => {
            ctx.hint('Press C to change color')

            const app = new Application({$id: 'demo'})
            app.mount(ctx.container)
            app.start()

            const box = ctx.box({size: 60})
            const colors = ['#4a9eff', '#ff4a4a', '#4aff4a', '#ffff4a', '#ff4aff']
            let colorIndex = 0

            // Bind action key
            app.bindInput({controlName: 'KeyC', actionName: 'color', eventType: 'pressed'})

            // React to action
            app.on('input:triggered', () => {
                colorIndex = (colorIndex + 1) % colors.length
                box.style.background = colors[colorIndex]
            })

            ctx.setApp(app)
        })

        code('Input bindings', () => {
            const app = new Application({$id: 'demo'})

            // Bind keyboard to action
            app.bindInput({
                controlName: 'KeyJ',
                actionName: 'jump',
                eventType: 'pressed'
            })

            // Check if action is triggered
            if (app.isActionPressed('jump')) {
                // player jumps
            }

            // Listen for action triggers
            app.on('input:triggered', (binding) => {
                console.log('Action triggered:', binding.actionName)
            })
        })

    })


    section('Actions', () => {

        text('Action methods are delegated from [[ActionDispatcher]].')

        action('addAction / execute', () => {
            const app = new Application({$id: 'demo'})

            // Add action to main controller
            app.addAction('greet', () => {
                logger.log('Hello!')
            })

            // Execute action
            app.execute('greet')
        })

        container({title: 'Custom controller', height: 150, preset: 'interactive-alt'}, ctx => {
            ctx.hint('Press G to greet, F to farewell')

            const app = new Application({$id: 'demo'})
            app.mount(ctx.container)
            app.start()

            // Custom controller with methods as actions
            class GreetController extends ActionController {
                greet () {
                    logger.log('Hello!')
                }

                farewell () {
                    logger.log('Goodbye!')
                }
            }

            app.registerController('greeter', GreetController)
            app.pushActiveController('greeter')

            // Bind keys to controller actions
            app.bindInput({controlName: 'KeyG', actionName: 'greet'})
            app.bindInput({controlName: 'KeyF', actionName: 'farewell'})

            ctx.setApp(app)
        })

        code('Controller with bindings', () => {
            class GameController extends ActionController {
                static bindings = {
                    moveUp: ['KeyW', 'ArrowUp'],
                    moveDown: ['KeyS', 'ArrowDown'],
                    shoot: 'Space'
                }

                moveUp () {
                    console.log('up')
                }

                moveDown () {
                    console.log('down')
                }

                shoot () {
                    console.log('shoot')
                }
            }

            // Bindings are auto-registered when controller is added
            app.registerController('game', GameController)
        })

    })

})
