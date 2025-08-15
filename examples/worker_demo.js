import ActiveWorker from '/core/active_worker.js'
import PerkyLogger from '/editor/perky_logger.js'
import {createControlPanel, addButtonFolder} from './example_utils.js'

const container = document.querySelector('.example-content')

const logger = new PerkyLogger()
container.appendChild(logger)

// Create worker
let worker = null
let isWorkerStarted = false

function init () {
    logger.info('ActiveWorker Demo initialized')
    
    setupUI()
}

function setupUI () {
    const controlPane = createControlPanel({
        title: 'Worker Controls',
        container,
        position: 'top-right'
    })
    
    // Worker lifecycle controls
    addButtonFolder(controlPane, 'Lifecycle', [
        {
            title: 'Start Worker',
            action: () => startWorker()
        },
        {
            title: 'Stop Worker',
            action: () => stopWorker()
        },
        {
            title: 'Restart Worker',
            action: () => restartWorker()
        }
    ])
    
    // Test commands
    addButtonFolder(controlPane, 'Commands', [
        {
            title: 'Add Numbers',
            action: () => testAdd()
        },
        {
            title: 'Send Greeting',
            action: () => testGreeting()
        },
        {
            title: 'Send Ping',
            action: () => testInvalid()
        }
    ])
}

function startWorker () {
    if (isWorkerStarted) {
        logger.info('Worker already started')
        return
    }
    
    try {
        worker = new ActiveWorker('/examples/workers/clean_worker.js')
        
        // Setup event listeners using the clean API
        worker.on('ready', (data) => {
            logger.success('Worker ready:', data.message)
            logger.info('Available actions:', data.actions)
        })
        
        worker.on('result', (data) => {
            logger.success('Calculation result:', data.message)
        })
        
        worker.on('greeting', (data) => {
            logger.success('Greeting received:', data.message)
        })
        
        worker.on('pong', (data) => {
            logger.success('Pong received:', data.message)
        })
        
        worker.on('error', (error) => {
            logger.error('Worker error:', error.message)
        })
        
        worker.start()
        isWorkerStarted = true
        logger.info('Worker started successfully')
        
    } catch (error) {
        logger.error('Failed to start worker:', error.message)
    }
}

function stopWorker () {
    if (!isWorkerStarted) {
        logger.info('Worker not started')
        return
    }
    
    try {
        worker.stop()
        worker = null
        isWorkerStarted = false
        logger.info('Worker stopped')
        
    } catch (error) {
        logger.error('Failed to stop worker:', error.message)
    }
}

function restartWorker () {
    if (!isWorkerStarted) {
        logger.info('Starting worker for the first time')
        startWorker()
        return
    }
    
    try {
        // Restart worker (listeners are auto-setup in start())
        worker.restart()
        logger.info('Worker restarted')
        
    } catch (error) {
        logger.error('Failed to restart worker:', error.message)
    }
}

function testAdd () {
    if (!isWorkerStarted) {
        logger.error('Worker not started! Start the worker first.')
        return
    }
    
    const a = Math.floor(Math.random() * 100)
    const b = Math.floor(Math.random() * 100)
    
    logger.info(`Sending add command: ${a} + ${b}`)
    worker.send('add', { a, b })
}

function testGreeting () {
    if (!isWorkerStarted) {
        logger.error('Worker not started! Start the worker first.')
        return
    }
    
    const names = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve']
    const name = names[Math.floor(Math.random() * names.length)]
    
    logger.info(`Sending greeting for: ${name}`)
    worker.send('greet', { name })
}

function testInvalid () {
    if (!isWorkerStarted) {
        logger.error('Worker not started! Start the worker first.')
        return
    }
    
    logger.info('Sending ping command')
    worker.send('ping')
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', init)
