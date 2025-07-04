import Random from '/core/random.js'
import Logger from '/ui/logger.js'
import {Pane} from 'tweakpane'

const container = document.querySelector('.example-content')

const logger = new Logger()
logger.mountTo(container)

// Create Tweakpane for controls
const controlPane = new Pane({
    title: 'Random Controls',
    container: container
})

// Position the control panel
controlPane.element.style.position = 'absolute'
controlPane.element.style.top = '10px'
controlPane.element.style.right = '10px'
controlPane.element.style.zIndex = '1000'
controlPane.element.style.width = '250px'

let random = new Random('example-seed')
logger.info('Random:', random)
logger.info('Seed:', random.getSeed())

// Add control buttons
const basicFolder = controlPane.addFolder({
    title: 'Basic Functions',
    expanded: true
})

basicFolder.addButton({
    title: 'between(0, 100)'
}).on('click', () => {
    logger.info('between(0, 100) => ', random.between(0, 100))
})

basicFolder.addButton({
    title: 'intBetween(0, 100)'
}).on('click', () => {
    logger.info('intBetween(0, 100) => ', random.intBetween(0, 100))
})

basicFolder.addButton({
    title: 'pick([a, b, c, d])'
}).on('click', () => {
    logger.info("pick(['a', 'b', 'c', 'd']) => ", random.pick(['a', 'b', 'c', 'd']))
})

basicFolder.addButton({
    title: 'coinToss()'
}).on('click', () => {
    logger.info('coinToss() => ', random.coinToss())
})

const advancedFolder = controlPane.addFolder({
    title: 'Advanced Functions',
    expanded: true
})

advancedFolder.addButton({
    title: 'weightedChoice'
}).on('click', () => {
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

const chanceFolder = controlPane.addFolder({
    title: 'Chance Functions',
    expanded: true
})

chanceFolder.addButton({
    title: 'oneChanceIn(2)'
}).on('click', () => {
    logger.info('oneChanceIn(2) => ', random.oneChanceIn(2))
})

chanceFolder.addButton({
    title: 'oneChanceIn(10)'
}).on('click', () => {
    logger.info('oneChanceIn(10) => ', random.oneChanceIn(10))
})

const stateFolder = controlPane.addFolder({
    title: 'State Management',
    expanded: true
})

stateFolder.addButton({
    title: 'setState Demo'
}).on('click', () => {
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

