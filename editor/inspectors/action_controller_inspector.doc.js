import {doc, section, text, code, container, logger} from '../../doc/runtime.js'
import ActionController from '../../core/action_controller.js'
import './action_controller_inspector.js'


export default doc('ActionControllerInspector', () => {

    text(`
        Visual inspector for [[ActionController@application]] modules. Displays all registered
        actions with execute buttons. Used in [[PerkyExplorer@editor]] devtools.
    `)


    section('Basic Usage', () => {

        text(`
            Create the inspector and set a module with \`setModule()\`.
            The inspector displays all actions with "Run" buttons.
        `)

        code('Setup', () => {
            const inspector = document.createElement('action-controller-inspector')

            const controller = new ActionController({$id: 'main'})
            controller.addAction('save', () => logger.log('Saving...'))

            inspector.setModule(controller)
            document.body.appendChild(inspector)
        })

        container({title: 'Inspector demo', height: 280, preset: 'inspector'}, ctx => {
            class GameController extends ActionController {
                static propagable = ['move']

                shoot () {
                    logger.log('Shooting!')
                }

                jump (height = 1) {
                    logger.log(`Jumping ${height} units`)
                }

                move (x, y) {
                    logger.log(`Moving to ${x}, ${y}`)
                }

                heal () {
                    logger.log('Healing...')
                }
            }

            const controller = new GameController({$id: 'game'})

            const inspector = document.createElement('action-controller-inspector')
            inspector.setModule(controller)
            ctx.container.appendChild(inspector)

            ctx.setApp(controller)
        })

    })


    section('Features', () => {

        text(`
            The inspector shows:
            - Action count header
            - Each action with its name
            - "propagable" badge for actions in \`static propagable\` (see [[ActionController@application#propagable-actions]])
            - "Run" button to execute actions directly
        `)

        container({title: 'With propagable actions', height: 200, preset: 'inspector'}, ctx => {
            class MenuController extends ActionController {
                static propagable = ['navigate', 'back']

                select () {
                    logger.log('Selected!')
                }

                navigate () {
                    logger.log('Navigating...')
                }

                back () {
                    logger.log('Going back...')
                }
            }

            const controller = new MenuController({$id: 'menu'})

            const inspector = document.createElement('action-controller-inspector')
            inspector.setModule(controller)
            ctx.container.appendChild(inspector)

            ctx.setApp(controller)
        })

    })


    section('Empty State', () => {

        text('When a controller has no actions, an empty message is shown.')

        container({title: 'No actions', height: 120, preset: 'inspector'}, ctx => {
            const controller = new ActionController({$id: 'empty'})

            const inspector = document.createElement('action-controller-inspector')
            inspector.setModule(controller)
            ctx.container.appendChild(inspector)

            ctx.setApp(controller)
        })

    })

})
