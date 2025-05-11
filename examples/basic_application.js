import Application from '/application/application.js'
import Logger from '/ui/logger.js'
import Toolbar from '/ui/toolbar.js'

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



const toolbar = new Toolbar()
toolbar.mountTo(container)

const logger = new Logger()
logger.mountTo(container)

logger.info('Application mounted')

toolbar.add('Load Assets', async () => {
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
})


toolbar.add('Get Config', () => {
    const config = app.config()
    logger.info(`Config: ${JSON.stringify(config, null, 2)}`)
})


logger.info('Press "H" to trigger the sayHello action')

app.addAction('sayHello', () => {
    logger.info('Hello from the application!')
})


toolbar.add('Say Hello', () => {
    app.dispatchAction('sayHello')
    logger.info('Dispatched action: sayHello')
})


app.setInputFor('sayHello', 'KeyH')