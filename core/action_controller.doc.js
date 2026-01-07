import {doc, section, text, code, action, logger} from '../doc/runtime.js'
import ActionController from './action_controller.js'


export default doc('ActionController', () => {

    text(`
        Base class for action controllers. Methods defined on subclasses
        automatically become executable actions. Integrates with ActionDispatcher.
    `)


    section('Basic Usage', () => {

        text(`
            Extend ActionController and define methods. Each public method
            becomes an action that can be executed via \`execute()\`.
        `)

        code('Creating a controller', () => {
            class PlayerController extends ActionController {
                jump () {
                    console.log('Player jumps!')
                }

                shoot () {
                    console.log('Player shoots!')
                }
            }

            const controller = new PlayerController({$id: 'player'})
            controller.execute('jump')
            controller.execute('shoot')
        })

        action('Execute actions', () => {
            class GameController extends ActionController {
                start () {
                    logger.log('Game started')
                }

                pause () {
                    logger.log('Game paused')
                }
            }

            const controller = new GameController({$id: 'game'})
            controller.execute('start')
            controller.execute('pause')
            controller.dispose()
        })

    })


    section('Dynamic Actions', () => {

        text(`
            Use \`addAction()\` to register actions dynamically at runtime.
            These work alongside methods defined on the class.
        `)

        code('Adding actions', () => {
            const controller = new ActionController({$id: 'main'})

            controller.addAction('save', () => {
                console.log('Saving...')
            })

            controller.addAction('load', () => {
                console.log('Loading...')
            })

            controller.execute('save')
        })

        action('Dynamic actions', () => {
            const controller = new ActionController({$id: 'main'})

            controller.addAction('greet', (name) => {
                logger.log('Hello,', name)
            })

            controller.execute('greet', 'World')
            controller.dispose()
        })

    })


    section('Action Parameters', () => {

        text('Actions can receive parameters when executed.')

        code('With parameters', () => {
            class PlayerController extends ActionController {
                move (x, y) {
                    console.log(`Moving to ${x}, ${y}`)
                }

                heal (amount = 10) {
                    console.log(`Healing ${amount} HP`)
                }
            }

            const controller = new PlayerController({$id: 'player'})
            controller.execute('move', 5, 10)
            controller.execute('heal', 25)
            controller.execute('heal') // Uses default value
        })

        action('Parameters demo', () => {
            class MathController extends ActionController {
                add (a, b) {
                    logger.log(`${a} + ${b} =`, a + b)
                }

                multiply (a, b = 2) {
                    logger.log(`${a} × ${b} =`, a * b)
                }
            }

            const controller = new MathController({$id: 'math'})
            controller.execute('add', 3, 4)
            controller.execute('multiply', 5, 3)
            controller.execute('multiply', 10)
            controller.dispose()
        })

    })


    section('Listing Actions', () => {

        text(`
            Use \`listActions()\` to get action names or \`listActionsWithParams()\`
            for detailed info including parameter names and defaults.
        `)

        action('List actions', () => {
            class GameController extends ActionController {
                shoot () {}
                jump (height = 1) {}
                move (x, y) {}
            }

            const controller = new GameController({$id: 'game'})
            controller.addAction('save', () => {})

            logger.log('Actions:', controller.listActions())

            const detailed = controller.listActionsWithParams()
            for (const action of detailed) {
                const params = action.params.map(p => p.name).join(', ')
                logger.log(`${action.name}(${params})`)
            }

            controller.dispose()
        })

    })


    section('Ignored Methods', () => {

        text(`
            Methods starting with certain prefixes are not exposed as actions:
            \`_\`, \`#\`, \`on\`, \`update\`, \`get\`, \`check\`.
            Use these for internal logic.
        `)

        code('Internal methods', () => {
            class GameController extends ActionController {
                // Exposed as actions
                shoot () {}
                jump () {}

                // NOT exposed (internal)
                onStart () {}
                updateState () {}
                getPlayer () {}
                checkCollision () {}
            }

            const controller = new GameController({$id: 'game'})
            console.log(controller.listActions()) // ['shoot', 'jump']
        })

        action('Check exposed actions', () => {
            class TestController extends ActionController {
                publicAction () {}
                anotherAction () {}
                _internal () {}
                onInit () {}
                getState () {}
            }

            const controller = new TestController({$id: 'test'})
            logger.log('Exposed actions:', controller.listActions())
            controller.dispose()
        })

    })


    section('Propagation', () => {

        text(`
            When used with ActionDispatcher, actions can propagate through
            the controller stack. Define \`static propagable\` to allow propagation.
        `)

        code('Propagable actions', () => {
            class GameController extends ActionController {
                static propagable = ['move']

                move () {
                    console.log('Game: move')
                }

                shoot () {
                    console.log('Game: shoot')
                }
            }

            // 'move' will propagate to lower controllers
            // 'shoot' will stop at this controller
        })

    })

})
