import {doc, section, text, code, action, logger} from '../doc/runtime.js'
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

        code('preload', async () => {
            const app = new Application({
                $id: 'demo',
                manifest: {
                    assets: {
                        hero: {type: 'image', url: '/hero.png', tags: ['preload']},
                        music: {type: 'audio', url: '/music.mp3'}
                    }
                }
            })

            // Load all assets tagged 'preload'
            await app.preload()

            // Or load specific assets
            await app.loadAsset('music')
            await app.loadTag('preload')
            await app.loadAll()
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
            const container = document.getElementById('app')

            app.mount(container)
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

        code('Check input state', () => {
            const app = new Application({$id: 'demo'})
            app.mount(document.body)
            app.start()

            // Keyboard
            if (app.isKeyPressed('Space')) {
                // jump
            }

            // Mouse
            if (app.isMousePressed('left')) {
                // shoot
            }

            // Touch
            if (app.isTouchPressed('touch0')) {
                // interact
            }
        })

        code('Input bindings', () => {
            const app = new Application({$id: 'demo'})

            // Bind keyboard to action
            app.bindInput({
                controlName: 'Space',
                actionName: 'jump',
                eventType: 'pressed'
            })

            // Check if action is triggered
            if (app.isActionPressed('jump')) {
                // player jumps
            }

            // Listen for action triggers
            app.on('input:triggered', (binding, event) => {
                console.log('Action triggered:', binding.actionName)
            })
        })

        code('Direction helper', () => {
            const app = new Application({$id: 'demo'})

            // Bind WASD or arrows to movement
            app.bindInput({controlName: 'KeyW', actionName: 'moveUp'})
            app.bindInput({controlName: 'KeyS', actionName: 'moveDown'})
            app.bindInput({controlName: 'KeyA', actionName: 'moveLeft'})
            app.bindInput({controlName: 'KeyD', actionName: 'moveRight'})

            // Get normalized direction vector
            const dir = app.getDirection('move') // Vec2
            player.x += dir.x * speed
            player.y += dir.y * speed
        })

    })

})
