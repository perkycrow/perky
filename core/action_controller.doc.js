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
        })

    })


    section('Dynamic Actions', () => {

        text(`
            Use \`addAction()\` to register actions dynamically at runtime.
            These work alongside methods defined on the class.
        `)

        action('Dynamic actions', () => {
            const controller = new ActionController({$id: 'main'})

            controller.addAction('greet', (name) => {
                logger.log('Hello,', name)
            })

            controller.execute('greet', 'World')
        })

    })


    section('Action Parameters', () => {

        text('Actions can receive parameters when executed.')

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
            for (const actionInfo of detailed) {
                const params = actionInfo.params.map(p => p.name).join(', ')
                logger.log(`${actionInfo.name}(${params})`)
            }
        })

    })


    section('Ignored Methods', () => {

        text(`
            Methods starting with certain prefixes are not exposed as actions:
            \`_\`, \`#\`, \`on\`, \`update\`, \`get\`, \`check\`.
            Use these for internal logic.
        `)

        action('Check exposed actions', () => {
            class TestController extends ActionController {
                publicAction () {}
                anotherAction () {}
                onInit () {}
                getState () {}
            }

            const controller = new TestController({$id: 'test'})
            logger.log('Exposed actions:', controller.listActions())
        })

    })


    section('Propagation', () => {

        text(`
            When used with ActionDispatcher, actions propagate through a stack
            of controllers from top to bottom. By default, actions stop at the
            first controller that handles them. Use \`static propagable\` to let
            specific actions continue to lower controllers.
        `)

        text(`
            Example: in Elden Ring, opening a menu pushes a MenuController on top.
            Movement could still reach the GameController below, while confirm/cancel
            stop at the menu.
        `)

        code('Propagable actions', () => {
            class MenuController extends ActionController {
                static propagable = ['move']

                move () {
                    logger.log('Menu: navigate')
                }

                confirm () {
                    logger.log('Menu: confirm')
                }

                cancel () {
                    logger.log('Menu: cancel')
                }
            }

            // 'move' propagates to GameController below
            // 'confirm' and 'cancel' stop here
        })

    })

})
