import {doc, text, code, action, logger} from '../docs/runtime.js'
import Vec2 from './vec2.js'


export default doc('Vec2', {context: 'simple'}, () => {

    text(`
        Vecteur 2D mutable avec chainage de methodes.
        Utilise pour les positions, directions, et dimensions.
    `)


    code('Creation', () => {
        const a = new Vec2(3, 4)
        const b = new Vec2({x: 1, y: 2})
        const c = new Vec2([5, 6])
    })


    action('Addition', () => {
        const a = new Vec2(3, 4)
        const b = new Vec2(1, 2)
        logger.log('a:', a)
        logger.log('b:', b)
        logger.log('a + b:', a.clone().add(b))
    })


    action('Soustraction', () => {
        const a = new Vec2(3, 4)
        const b = new Vec2(1, 2)
        logger.log('a:', a)
        logger.log('b:', b)
        logger.log('a - b:', a.clone().sub(b))
    })


    action('Multiplication scalaire', () => {
        const v = new Vec2(3, 4)
        logger.log('v:', v)
        logger.log('v * 2:', v.clone().multiplyScalar(2))
    })


    text(`Les methodes de mesure retournent des nombres.`)


    action('Length', () => {
        const v = new Vec2(3, 4)
        logger.log('v:', v)
        logger.log('length:', v.length())
    })


    action('Normalize', () => {
        const v = new Vec2(3, 4)
        logger.log('original:', v.clone())
        logger.log('normalized:', v.normalize())
        logger.log('new length:', v.length())
    })


    action('Distance', () => {
        const a = new Vec2(0, 0)
        const b = new Vec2(3, 4)
        logger.log('a:', a)
        logger.log('b:', b)
        logger.log('distance:', a.distanceTo(b))
    })


    text(`Transformations geometriques.`)


    action('Rotation', () => {
        const v = new Vec2(1, 0)
        const center = new Vec2(0, 0)
        logger.log('original:', v.clone())
        logger.log('rotated 90deg:', v.rotateAround(center, Math.PI / 2))
    })


    action('Lerp', () => {
        const a = new Vec2(0, 0)
        const b = new Vec2(10, 10)
        logger.log('a:', a)
        logger.log('b:', b)
        logger.log('25%:', a.clone().lerp(b, 0.25))
        logger.log('50%:', a.clone().lerp(b, 0.5))
        logger.log('75%:', a.clone().lerp(b, 0.75))
    })


    text(`Les methodes retournent \`this\` pour le chainage.`)


    action('Chainage', () => {
        const result = new Vec2(1, 0)
            .multiplyScalar(5)
            .add(new Vec2(0, 3))
            .normalize()
        logger.log('result:', result)
    })

})
