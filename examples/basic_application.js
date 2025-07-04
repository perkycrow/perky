import Application from '/application/application.js'
import Logger from '/ui/logger.js'
import {Pane} from 'tweakpane'

const manifest = ({
    config: {
        name: 'Basic Application Example',
        debug: true
    },
    sourceDescriptors: {
        images: {
            logo: {
                url: '/examples/assets/images/logo.png'
            }
        },
        audio: {
            tac: {
                url: '/examples/assets/audio/tac.mp3'
            }
        }
    }
})

const app = new Application({manifest})

const container = document.querySelector('.example-content')
app.mountTo(container)

const logger = new Logger()
logger.mountTo(container)

// Create Tweakpane for controls
const controlPane = new Pane({
    title: 'Application Controls',
    container: container
})

// Position the control panel
controlPane.element.style.position = 'absolute'
controlPane.element.style.top = '10px'
controlPane.element.style.right = '10px'
controlPane.element.style.zIndex = '1000'
controlPane.element.style.width = '250px'

logger.info('Application mounted')

// Add control buttons
const assetsFolder = controlPane.addFolder({
    title: 'Assets',
    expanded: true
})

assetsFolder.addButton({
    title: 'Load Assets'
}).on('click', loadAssets)

const configFolder = controlPane.addFolder({
    title: 'Configuration',
    expanded: true
})

configFolder.addButton({
    title: 'Config API'
}).on('click', displayConfig)

const actionFolder = controlPane.addFolder({
    title: 'Actions',
    expanded: true
})

actionFolder.addButton({
    title: 'Say Hello'
}).on('click', () => {
    app.dispatchAction('sayHello')
    logger.info('Dispatched action: sayHello')
})

actionExample()

function displayConfig () {
    logger.spacer()
    logger.title('Config API Example')
    logger.info(`Config: ${JSON.stringify(app.config(), null, 2)}`)
    logger.info('Debug:', app.config('debug'))

    app.config('debug', false)
    logger.info('Debug:', app.config('debug'))
    logger.info(`Config: ${JSON.stringify(app.config(), null, 2)}`)
}

async function loadAssets () {
    logger.spacer()
    logger.title('Assets Loading Example')
    try {
        logger.info('Starting assets loading...')

        await app.loadSource('images', 'logo')
        logger.info('Loaded image: logo')
        logger.info('Image URL:', app.getSourceDescriptor('images', 'logo').url)

        const img = app.getSource('images', 'logo')
        const logMessage = `<img src="${img.src}" alt="Logo" height="100" />`
        logger.log(logMessage, 'info', 'html')

        await app.loadSource('audio', 'tac')
        logger.info('Loaded audio: tac')

        logger.success('All assets loaded successfully')
    } catch (error) {
        logger.error(`Error loading assets: ${error.message}`)
    }
}

function actionExample () {
    logger.spacer()
    logger.title('Action Example')

    logger.info('Press "H" to trigger the sayHello action')

    app.addAction('sayHello', () => {
        logger.info('Hello from the application!')
    })

    app.setInputFor('sayHello', 'KeyH')
}
