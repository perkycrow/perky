import {doc, section, text, code, action, logger} from '../doc/runtime.js'
import ActionDispatcher from './action_dispatcher.js'
import ActionController from './action_controller.js'


export default doc('ActionDispatcher', () => {

    text(`
        Manages action controllers and dispatches actions to them.
        Controllers are organized in a stack - actions propagate from top to bottom.
    `)


    section('Basic Setup', () => {

        text(`
            Create an ActionDispatcher and register controllers with \`register()\`.
            Add actions to controllers and execute them.
        `)

        code('Creation', () => {
            const dispatcher = new ActionDispatcher({$id: 'dispatcher'})

            // Register a controller and add an action
            const main = dispatcher.register('main')
            main.addAction('jump', () => {
                logger.log('Jump!')
            })

            // Set it active and execute
            dispatcher.setActive('main')
            dispatcher.execute('jump')
        })

        action('Add and execute action', () => {
            const dispatcher = new ActionDispatcher({$id: 'dispatcher'})

            const main = dispatcher.register('main')
            main.addAction('greet', (name) => {
                logger.log('Hello,', name)
            })

            dispatcher.setActive('main')
            dispatcher.execute('greet', 'World')
            dispatcher.dispose()
        })

    })


    section('Controllers', () => {

        text(`
            Register multiple controllers to organize actions by context.
            Use \`setActive\` to control which controllers receive actions.
        `)

        code('Multiple controllers', () => {
            const dispatcher = new ActionDispatcher({$id: 'dispatcher'})

            // Register a game controller
            const gameCtrl = dispatcher.register('game')
            gameCtrl.addAction('pause', () => logger.log('Paused'))

            // Register a menu controller
            const menuCtrl = dispatcher.register('menu')
            menuCtrl.addAction('select', () => logger.log('Selected'))

            // Set active controllers
            dispatcher.setActive(['game', 'menu'])
        })

        action('Controller stack', () => {
            const dispatcher = new ActionDispatcher({$id: 'dispatcher'})

            dispatcher.register('game')
            dispatcher.register('menu')

            logger.log('Initial active:', dispatcher.getActive())

            dispatcher.pushActive('game')
            logger.log('After push game:', dispatcher.getActive())

            dispatcher.pushActive('menu')
            logger.log('After push menu:', dispatcher.getActive())

            dispatcher.popActive()
            logger.log('After pop:', dispatcher.getActive())

            dispatcher.dispose()
        })

    })


    section('Direct Execution', () => {

        text(`
            Use \`executeTo\` to target a specific controller directly,
            bypassing the active stack propagation.
        `)

        action('executeTo', () => {
            const dispatcher = new ActionDispatcher({$id: 'dispatcher'})

            const ctrl = dispatcher.register('myController')
            ctrl.addAction('test', () => {
                logger.log('Action executed on myController')
            })

            dispatcher.setActive('myController')
            dispatcher.executeTo('myController', 'test')

            dispatcher.dispose()
        })

    })


    section('Custom Controllers', () => {

        text(`
            Extend \`ActionController\` to create custom controllers.
            Public methods automatically become executable actions.
        `)

        code('Custom controller class', () => {
            class GameController extends ActionController {
                shoot () {
                    logger.log('Shooting!')
                }

                jump (height = 1) {
                    logger.log(`Jumping ${height} units`)
                }

                setSpeed (speed) {
                    this.speed = speed
                }
            }

            const dispatcher = new ActionDispatcher({$id: 'dispatcher'})
            const ctrl = dispatcher.register('game', GameController)

            dispatcher.setActive('game')
            dispatcher.execute('shoot')
            dispatcher.execute('jump', 2)
        })

        action('Methods as actions', () => {
            class PlayerController extends ActionController {
                shoot () {
                    logger.log('Player shoots!')
                }

                heal (amount = 10) {
                    logger.log(`Healing ${amount} HP`)
                }
            }

            const dispatcher = new ActionDispatcher({$id: 'dispatcher'})
            dispatcher.register('player', PlayerController)
            dispatcher.setActive('player')

            dispatcher.execute('shoot')
            dispatcher.execute('heal', 25)

            dispatcher.dispose()
        })

    })


    section('Listing Actions', () => {

        text('Query registered controllers and their actions.')

        action('List all actions', () => {
            class GameController extends ActionController {
                shoot () {}
                jump () {}
            }

            const dispatcher = new ActionDispatcher({$id: 'dispatcher'})

            const main = dispatcher.register('main')
            main.addAction('save', () => {})
            main.addAction('load', () => {})

            dispatcher.register('game', GameController)

            const actionsMap = dispatcher.listAllActions()

            for (const [controllerName, actions] of actionsMap) {
                logger.log(`${controllerName}:`, actions.map(a => a.name).join(', '))
            }

            dispatcher.dispose()
        })

    })

})
