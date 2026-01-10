import {doc, text, code, action, logger} from '../doc/runtime.js'
import Random from './random.js'


export default doc('Random', {featured: true}, () => {

    text(`
        Deterministic (seedable) random number generator.
        Uses the Alea algorithm for reproducible results.
    `)


    code('Creation', () => {
        const rng = new Random()
        const seeded = new Random('my-seed')
    })


    action('Random numbers', () => {
        const rng = new Random()
        logger.log('between(0, 100):', rng.between(0, 100))
        logger.log('between(0, 100):', rng.between(0, 100))
        logger.log('intBetween(1, 10):', rng.intBetween(1, 10))
    })


    action('Reproducibility', () => {
        const rng1 = new Random('test-seed')
        const rng2 = new Random('test-seed')
        logger.log('rng1:', rng1.between(0, 100))
        logger.log('rng2:', rng2.between(0, 100))
        logger.log('Same seed = same values')
    })


    text('Utility methods for games.')


    action('coinToss', () => {
        const rng = new Random()
        for (let i = 0; i < 5; i++) {
            logger.log('coinToss:', rng.coinToss())
        }
    })


    action('oneChanceIn', () => {
        const rng = new Random()
        for (let i = 0; i < 5; i++) {
            logger.log('oneChanceIn(4):', rng.oneChanceIn(4))
        }
    })


    action('pick', () => {
        const rng = new Random()
        const items = ['sword', 'shield', 'potion', 'scroll']
        for (let i = 0; i < 5; i++) {
            logger.log('pick:', rng.pick(items))
        }
    })


    action('weightedChoice', () => {
        const rng = new Random()
        const loot = [
            {value: 'common', weight: 70},
            {value: 'rare', weight: 25},
            {value: 'legendary', weight: 5}
        ]
        for (let i = 0; i < 5; i++) {
            logger.log('loot:', rng.weightedChoice(loot))
        }
    })


    text('State management for save/restore.')


    action('fork', () => {
        const rng = new Random('base')
        rng.between(0, 100)
        rng.between(0, 100)

        const forked = rng.fork()
        logger.log('original:', rng.between(0, 100))
        logger.log('forked:', forked.between(0, 100))
        logger.log('Both continue independently')
    })


    action('getState / setState', () => {
        const rng = new Random('save-test')
        logger.log('val 1:', rng.between(0, 100))

        const state = rng.getState()
        logger.log('val 2:', rng.between(0, 100))
        logger.log('val 3:', rng.between(0, 100))

        rng.setState(state)
        logger.log('after restore:', rng.between(0, 100))
    })

})
