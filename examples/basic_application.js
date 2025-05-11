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
                
        await app.loadSource('audio', 'tac')
        logger.info('Loaded audio: tac')
                
        logger.success('All assets loaded successfully')
        console.log('Assets loaded successfully')
    } catch (error) {
        logger.error(`Error loading assets: ${error.message}`)
        console.error('Error loading assets:', error)
    }
})


toolbar.add('Get Config', () => {
    const config = app.config()
    logger.info(`Config: ${JSON.stringify(config, null, 2)}`)
})