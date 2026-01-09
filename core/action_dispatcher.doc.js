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

        action('Add and execute action', () => {
            const dispatcher = new ActionDispatcher({$id: 'dispatcher'})

            const main = dispatcher.register('main')
            main.addAction('greet', (name) => {
                logger.log('Hello,', name)
            })

            dispatcher.setActive('main')
            dispatcher.execute('greet', 'World')
        })

    })


    section('Controller Stack', () => {

        text(`
            Register multiple controllers to organize actions by context.
            Use \`pushActive\` and \`popActive\` to manage the stack.
        `)

        action('Stack operations', () => {
            const dispatcher = new ActionDispatcher({$id: 'dispatcher'})

            dispatcher.register('game')
            dispatcher.register('menu')

            logger.log('Initial:', dispatcher.getActive())

            dispatcher.pushActive('game')
            logger.log('After push game:', dispatcher.getActive())

            dispatcher.pushActive('menu')
            logger.log('After push menu:', dispatcher.getActive())

            dispatcher.popActive()
            logger.log('After pop:', dispatcher.getActive())
        })

    })


    section('Custom Controllers', () => {

        text(`
            Extend \`ActionController\` to create custom controllers.
            Public methods automatically become executable actions.
        `)

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
        })

    })


    section('Direct Execution', () => {

        text(`
            Use \`executeTo\` to target a specific controller directly,
            bypassing the stack propagation.
        `)

        action('executeTo', () => {
            const dispatcher = new ActionDispatcher({$id: 'dispatcher'})

            const ctrl = dispatcher.register('myController')
            ctrl.addAction('test', () => {
                logger.log('Action executed on myController')
            })

            dispatcher.setActive('myController')
            dispatcher.executeTo('myController', 'test')
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
        })

    })


    section('Propagation', () => {

        text(`
            Actions propagate through the controller stack from top to bottom.
            By default, an action stops at the first controller that handles it.
            Use \`static propagable\` to let actions continue to lower controllers
            (see [[ActionController#Propagation]]).
        `)

        text(`
            Example: in Elden Ring, the player can move and jump. Opening a menu
            pushes a MenuController on top. Movement could still work (propagates
            to GameController), while confirm/cancel only affect the menu.
        `)

        action('Propagation demo', () => {
            class GameController extends ActionController {
                move () {
                    logger.log('Game: player moves')
                }

                jump () {
                    logger.log('Game: player jumps')
                }
            }

            class MenuController extends ActionController {
                static propagable = ['move']

                move () {
                    logger.log('Menu: navigate')
                }

                confirm () {
                    logger.log('Menu: confirm selection')
                }
            }

            const dispatcher = new ActionDispatcher({$id: 'dispatcher'})

            dispatcher.register('game', GameController)
            dispatcher.register('menu', MenuController)

            dispatcher.setActive(['game', 'menu'])

            logger.log('--- move action (propagates) ---')
            dispatcher.execute('move')

            logger.log('--- confirm action (stops at menu) ---')
            dispatcher.execute('confirm')

            logger.log('--- jump action (only on game) ---')
            dispatcher.execute('jump')
        })

    })

})
