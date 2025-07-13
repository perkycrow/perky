import Random from '/core/random.js'
import PerkyLogger from '/editor/perky_logger.js'
import {createControlPanel, addButtonFolder} from './example_utils.js'

const container = document.querySelector('.example-content')

const logger = new PerkyLogger()
container.appendChild(logger)

// Create control panel with utilities (much simpler!)
const controlPane = createControlPanel({
    title: 'Random Controls',
    container,
    position: 'top-right'
})

let random = new Random('example-seed')
logger.info('Random:', random)
logger.info('Seed:', random.getSeed())

// Add basic functions folder
addButtonFolder(controlPane, 'Basic Functions', [
    {
        title: 'between(0, 100)',
        action: () => {
            logger.info('between(0, 100) => ', random.between(0, 100))
        }
    },
    {
        title: 'intBetween(0, 100)',
        action: () => {
            logger.info('intBetween(0, 100) => ', random.intBetween(0, 100))
        }
    },
    {
        title: 'pick([a, b, c, d])',
        action: () => {
            logger.info("pick(['a', 'b', 'c', 'd']) => ", random.pick(['a', 'b', 'c', 'd']))
        }
    },
    {
        title: 'coinToss()',
        action: () => {
            logger.info('coinToss() => ', random.coinToss())
        }
    }
])

// Add advanced functions folder
addButtonFolder(controlPane, 'Advanced Functions', [
    {
        title: 'weightedChoice',
        action: () => {
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
        }
    }
])

// Add chance functions folder
addButtonFolder(controlPane, 'Chance Functions', [
    {
        title: 'oneChanceIn(2)',
        action: () => {
            logger.info('oneChanceIn(2) => ', random.oneChanceIn(2))
        }
    },
    {
        title: 'oneChanceIn(10)',
        action: () => {
            logger.info('oneChanceIn(10) => ', random.oneChanceIn(10))
        }
    }
])

// Add state management folder
addButtonFolder(controlPane, 'State Management', [
    {
        title: 'setState Demo',
        action: () => {
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
        }
    }
])

