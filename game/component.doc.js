import {doc, section, text, code, action, logger} from '../doc/runtime.js'
import Component from './component.js'
import Entity from './entity.js'


export default doc('Component', () => {

    text(`
        Base class for entity components. Extends [[PerkyModule@core]] with
        \`$category = 'component'\`. Attach to entities via \`create()\`.
        Use \`onInstall\` to wire up the host entity.
    `)


    section('Basic Usage', () => {

        text(`
            Components add capabilities to entities.
            The built-in \`Velocity\` component is a typical example.
        `)

        code('Custom component', () => {
            class Armor extends Component {
                constructor (options = {}) {
                    super(options)
                    this.defense = options.defense ?? 10
                }

                onInstall (host) {
                    this.delegateTo(host, ['getDefense', 'reduceIncoming'])
                }

                getDefense () {
                    return this.defense
                }

                reduceIncoming (damage) {
                    return Math.max(0, damage - this.defense)
                }
            }
        })

        action('Attach component', () => {
            class Stamina extends Component {
                constructor (options = {}) {
                    super(options)
                    this.value = options.value ?? 100
                }

                onInstall (host) {
                    this.delegateTo(host, {value: 'stamina'})
                }
            }

            const entity = new Entity()
            entity.create(Stamina, {value: 50})

            logger.log('stamina:', entity.stamina)
        })

    })


    section('Delegation', () => {

        text(`
            Use \`delegateTo(host, ...)\` in \`onInstall\` to expose component
            properties and methods on the host entity.
        `)

        code('Property delegation', () => {
            class Speed extends Component {
                constructor (options = {}) {
                    super(options)
                    this.moveSpeed = options.speed ?? 5
                }

                onInstall (host) {
                    this.delegateTo(host, {moveSpeed: 'speed'})
                }
            }
        })

        code('Method delegation', () => {
            class Jumper extends Component {
                constructor (options = {}) {
                    super(options)
                    this.jumpForce = options.force ?? 10
                }

                onInstall (host) {
                    this.delegateTo(host, ['jump', 'canJump'])
                }

                jump () {
                    if (this.canJump()) {
                        this.host.velocity.y = this.jumpForce
                    }
                }

                canJump () {
                    return this.host.y <= 0
                }
            }
        })

    })


    section('API', () => {

        code('Static properties', () => {
            // Component.$category = 'component'
        })

        code('Lifecycle hooks', () => {
            // onInstall(host) - Called when attached to an entity
            // onUninstall() - Called when removed from an entity
        })

        code('Inherited from PerkyModule', () => {
            // delegateTo(host, mapping) - Expose properties/methods on host
            // host - Reference to the parent entity
        })

    })

})
