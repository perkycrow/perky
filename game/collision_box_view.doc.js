import {doc, section, text, code, action, logger} from '../doc/runtime.js'
import CollisionBoxView from './collision_box_view.js'
import Entity from './entity.js'


export default doc('CollisionBoxView', () => {

    text(`
        Debug view that renders a rectangle outline around an entity.
        Useful for visualizing collision boundaries during development.
    `)


    section('Usage', () => {

        text(`
            Register CollisionBoxView in a [[Stage@game]] to show collision boxes
            for specific entities.
        `)

        code('Register with Stage', () => {
            // worldView.register(
            //     (entity) => entity.hasTag('collidable'),
            //     CollisionBoxView,
            //     {width: 1, height: 1, strokeColor: '#ff0000'}
            // )
        })

        action('Create directly', () => {
            const entity = new Entity({x: 5, y: 3})

            const view = new CollisionBoxView(entity, {
                config: {
                    width: 2,
                    height: 1.5,
                    strokeColor: '#00ff00',
                    strokeWidth: 3
                }
            })

            logger.log('root width:', view.root.width)
            logger.log('root height:', view.root.height)
            logger.log('stroke color:', view.root.strokeColor)
            logger.log('stroke width:', view.root.strokeWidth)
            logger.log('fill color:', view.root.color)
        })

    })


    section('API', () => {

        code('Constructor', () => {
            // entity: The Entity instance
            // context: {
            //   config: {
            //     width: 1,              // Box width (default: 1)
            //     height: 1,             // Box height (default: 1)
            //     strokeColor: '#ff0000', // Outline color (default: red)
            //     strokeWidth: 2          // Outline thickness (default: 2)
            //   }
            // }
        })

    })

})
