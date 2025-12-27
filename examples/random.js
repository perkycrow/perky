import Random from '/math/random.js'
import '/editor/components/perky_logger.js'


const container = document.querySelector('.example-content')

const logger = document.createElement('perky-logger')
container.appendChild(logger)

const random = new Random('example-seed')
logger.info('Random:', random)
logger.info('Seed:', random.getSeed())


const controlPanel = document.createElement('div')
controlPanel.className = 'control-panel'
container.appendChild(controlPanel)


function createFolder (title, buttons) {
    const folder = document.createElement('div')
    folder.className = 'control-folder'

    const header = document.createElement('div')
    header.className = 'folder-header'
    header.textContent = title

    folder.appendChild(header)

    buttons.forEach(({title: buttonTitle, action}) => {
        const button = document.createElement('button')
        button.className = 'control-button'
        button.textContent = buttonTitle
        button.addEventListener('click', action)
        folder.appendChild(button)
    })

    controlPanel.appendChild(folder)
}


createFolder('Basic Functions', [
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
        title: "pick(['a', 'b', 'c', 'd'])",
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


createFolder('Advanced Functions', [
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


createFolder('Chance Functions', [
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


createFolder('State Management', [
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


const style = document.createElement('style')
style.textContent = `
    .control-panel {
        position: absolute;
        top: 10px;
        right: 10px;
        width: 250px;
        font-family: "Source Code Pro", monospace;
        font-size: 12px;
    }

    .control-folder {
        background: #29292E;
        border-radius: 3px;
        margin-bottom: 8px;
        overflow: hidden;
    }

    .folder-header {
        background: #38383D;
        color: #BBBCC3;
        padding: 8px 12px;
        font-weight: 500;
        font-size: 0.75rem;
    }

    .control-button {
        display: block;
        width: 100%;
        background: #3a3a40;
        border: none;
        color: #8C8C93;
        padding: 8px 12px;
        text-align: left;
        cursor: pointer;
        font-family: "Source Code Pro", monospace;
        font-size: 0.7rem;
        border-bottom: 1px solid #212125;
    }

    .control-button:last-child {
        border-bottom: none;
    }

    .control-button:hover {
        background: #45454b;
        color: #BBBCC3;
    }
`
document.head.appendChild(style)
