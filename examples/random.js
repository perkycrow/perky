import Random from '/core/random.js'
import Logger from '/ui/logger.js'
import Toolbar from '/ui/toolbar.js'

const container = document.querySelector('.example-content')

const toolbar = new Toolbar()
toolbar.mountTo(container)

const logger = new Logger()
logger.mountTo(container)


let random = new Random('example-seed')
logger.info('Random:', random)
logger.info('Seed:', random.getSeed())


toolbar.add('between', () => {
    logger.info('between(0, 100) => ', random.between(0, 100))
})


toolbar.add('intBetween', () => {
    logger.info('intBetween(0, 100) => ', random.intBetween(0, 100))
})


toolbar.add('pick', () => {
    logger.info("pick(['a', 'b', 'c', 'd']) => ", random.pick(['a', 'b', 'c', 'd']))
})


toolbar.add('weightedChoice', () => {
    const choices = [
        {value: 'legendary', weight: 1},
        {value: 'epic', weight: 2.5},
        {value: 'rare', weight: 5},
        {value: 'uncommon', weight: 7.5},
        {value: 'common', weight: 10}
    ]

    logger.spacer()
    logger.title('weightedChoice Example')
    logger.info('const choices = ', choices)
    logger.info('weightedChoice(choices) => ', random.weightedChoice(choices))
})


toolbar.add('oneChanceIn', () => {
    logger.info('oneChanceIn(2) => ', random.oneChanceIn(2))
    logger.info('oneChanceIn(10) => ', random.oneChanceIn(10))
})


toolbar.add('coinToss', () => {
    logger.info('coinToss() => ', random.coinToss())
})


toolbar.add('setState', () => {
    logger.spacer()
    logger.title('setState Example')
    logger.notice('You can get the state of the random generator and set it back to a previous state.')
    logger.notice('This is like a snapshot of the random generator at a specific point in time.')

    const oldState = random.getState()
    logger.info('const oldState = getState()')
    logger.info('between(0, 100) => ', random.between(0, 100))
    logger.info('between(0, 100) => ', random.between(0, 100))

    random.setState(oldState)
    logger.info('setState(oldState)')
    logger.info('between(0, 100) => ', random.between(0, 100))
    logger.info('between(0, 100) => ', random.between(0, 100))
})
