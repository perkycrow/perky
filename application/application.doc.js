import {doc, section, text, code, action, container, logger} from '../doc/runtime.js'
import Application from './application.js'


export default doc('Application', {context: 'simple'}, () => {

    text(`
        Main entry point for Perky applications.
        Extends [[PerkyModule]] with built-in systems for view, input, assets, and actions.
    `)


    section('Creation', () => {

        text('Create an application with optional manifest data and input bindings.')

        code('Basic setup', () => {
            const app = new Application({$id: 'game'})

            // Mount to DOM and start
            app.mount(document.getElementById('app'))
            app.start()
        })

        code('Subclassing', () => {
            class MyGame extends Application {
                static $category = 'game'

                configureApplication () {
                    // Called after all systems are created
                    this.setConfig('debug', true)
                }
            }
        })

        code('With manifest', () => {
            const app = new Application({
                $id: 'game',
                manifest: {
                    config: {title: 'My Game'},
                    assets: {
                        hero: {type: 'sprite', url: '/hero.png', tags: ['preload']}
                    }
                }
            })
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

        code('Access systems', () => {
            const app = new Application({$id: 'demo'})

            // Direct access via $bind
            app.manifest         // Manifest instance
            app.perkyView        // PerkyView instance
            app.inputSystem      // InputSystem instance
            app.sourceManager    // SourceManager instance
            app.actionDispatcher // ActionDispatcher instance
        })

    })


    section('Configuration', () => {

        text('Config methods are delegated from [[Manifest]].')

        action('getConfig / setConfig', () => {
            const app = new Application({$id: 'demo'})

            app.setConfig('game.title', 'My Game')
            app.setConfig('game.debug', true)

            logger.log('title:', app.getConfig('game.title'))
            logger.log('all:', app.getConfig())

            app.dispose()
        })

    })


    section('Assets', () => {

        text('Asset methods are delegated from [[Manifest]].')

        action('addAsset / getAsset', () => {
            const app = new Application({$id: 'demo'})

            app.addAsset({
                id: 'player',
                type: 'sprite',
                url: '/sprites/player.png',
                tags: ['preload', 'character']
            })

            logger.log('asset:', app.getAsset('player').url)
            logger.log('by type:', app.getAssetsByType('sprite').length)
            logger.log('by tag:', app.getAssetsByTag('character').length)

            app.dispose()
        })

    })


    section('Asset Loading', () => {

        text('Loading methods are delegated from [[SourceManager]].')

        container({title: 'Load and display image', height: 200, preset: 'centered'}, ctx => {
            const updateDisplay = ctx.display(content => content || 'Loading...')

            const app = new Application({
                $id: 'demo',
                manifest: {
                    assets: {
                        shroom: {
                            type: 'image',
                            url: './assets/images/shroom.png',
                            tags: ['preload']
                        }
                    }
                }
            })

            app.start()

            app.on('loader:complete', () => {
                const img = app.getSource('shroom')
                img.style.width = '100px'
                updateDisplay(img)
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

        code('mount / dismount', () => {
            const app = new Application({$id: 'demo'})
            const el = document.getElementById('app')

            app.mount(el)
            console.log(app.mounted) // true
            console.log(app.element) // DOM element

            app.dismount()
        })

        code('Fullscreen', () => {
            const app = new Application({$id: 'demo'})

            app.enterFullscreenMode()
            app.exitFullscreenMode()
            app.toggleFullscreen()

            app.on('displayMode:changed', ({mode}) => {
                console.log('Display mode:', mode) // 'normal' or 'fullscreen'
            })
        })

        code('Resize', () => {
            const app = new Application({$id: 'demo'})

            app.on('resize', ({width, height}) => {
                console.log('Resized to:', width, height)
            })
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
            let x = w / 2, y = h / 2

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

})
