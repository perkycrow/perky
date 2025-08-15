import ActiveWorker from '/core/active_worker.js'
import PerkyLogger from '/editor/perky_logger.js'
import {createControlPanel, addButtonFolder} from './example_utils.js'

const container = document.querySelector('.example-content')

const logger = new PerkyLogger()
container.appendChild(logger)

let worker = null
let isWorkerStarted = false

function init () {
    logger.info('ActiveWorker Request Demo initialized')
    setupUI()
}

function setupUI () {
    const controlPane = createControlPanel({
        title: 'Request API Demo',
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
        }
    ])
    
    // Request tests
    addButtonFolder(controlPane, 'Request API', [
        {
            title: 'Request Add',
            action: () => testRequestAdd()
        },
        {
            title: 'Request Greeting',
            action: () => testRequestGreeting()
        },
        {
            title: 'Request Ping',
            action: () => testRequestPing()
        },
        {
            title: 'Slow Task (3s)',
            action: () => testSlowTask()
        },
        {
            title: 'Timeout Test (1s)',
            action: () => testTimeout()
        }
    ])

    addButtonFolder(controlPane, 'Event API', [
        {
            title: 'Send Add (Event)',
            action: () => testEventAdd()
        },
        {
            title: 'Send Ping (Event)',
            action: () => testEventPing()
        }
    ])
}

function startWorker () {
    if (isWorkerStarted) {
        logger.info('Worker already started')
        return
    }
    
    try {
        worker = new ActiveWorker('/examples/workers/request_worker.js', {
            defaultTimeout: 2000
        })

        worker.on('ready', (data) => {
            logger.success('Worker ready:', data.message)
        })
        
        worker.on('result', (data) => {
            logger.info('Event result:', data.message)
        })
        
        worker.on('greeting', (data) => {
            logger.info('Event greeting:', data.message)
        })
        
        worker.on('pong', (data) => {
            logger.info('Event pong:', data.message)
        })
        
        worker.on('taskComplete', (data) => {
            logger.info('Event task complete:', data.message)
        })
        
        worker.on('error', (error) => {
            logger.error('Worker error:', error.message)
        })
        
        worker.start()
        isWorkerStarted = true
        logger.info('Worker started with 2s default timeout')
        
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

async function testRequestAdd () {
    if (!isWorkerStarted) {
        logger.error('Worker not started!')
        return
    }
    
    const a = Math.floor(Math.random() * 100)
    const b = Math.floor(Math.random() * 100)
    
    logger.info(`Requesting add: ${a} + ${b}`)
    
    try {
        const result = await worker.request('add', {a, b})
        logger.success('Request result:', result.message)
    } catch (error) {
        logger.error('Request failed:', error.message)
    }
}

async function testRequestGreeting () {
    if (!isWorkerStarted) {
        logger.error('Worker not started!')
        return
    }
    
    const names = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve']
    const name = names[Math.floor(Math.random() * names.length)]
    
    logger.info(`Requesting greeting for: ${name}`)
    
    try {
        const result = await worker.request('greet', {name})
        logger.success('Request result:', result.message)
    } catch (error) {
        logger.error('Request failed:', error.message)
    }
}

async function testRequestPing () {
    if (!isWorkerStarted) {
        logger.error('Worker not started!')
        return
    }
    
    logger.info('Requesting ping')
    
    try {
        const result = await worker.request('ping')
        logger.success('Request result:', result.message)
    } catch (error) {
        logger.error('Request failed:', error.message)
    }
}

async function testSlowTask () {
    if (!isWorkerStarted) {
        logger.error('Worker not started!')
        return
    }
    
    logger.info('Starting slow task (3s)...')
    
    try {
        const result = await worker.request('slowTask', {delay: 3000}, 5000) // 5s timeout
        logger.success('Slow task completed:', result.message)
    } catch (error) {
        logger.error('Slow task failed:', error.message)
    }
}

async function testTimeout () {
    if (!isWorkerStarted) {
        logger.error('Worker not started!')
        return
    }
    
    logger.info('Testing timeout (task 3s, timeout 1s)...')
    
    try {
        const result = await worker.request('slowTask', {delay: 3000}, 1000) // 1s timeout
        logger.success('Should not see this:', result.message)
    } catch (error) {
        logger.error('Expected timeout:', error.message)
    }
}

function testEventAdd () {
    if (!isWorkerStarted) {
        logger.error('Worker not started!')
        return
    }
    
    const a = Math.floor(Math.random() * 100)
    const b = Math.floor(Math.random() * 100)
    
    logger.info(`Sending add event: ${a} + ${b}`)
    worker.send('add', {a, b})
}

function testEventPing () {
    if (!isWorkerStarted) {
        logger.error('Worker not started!')
        return
    }
    
    logger.info('Sending ping event')
    worker.send('ping')
}


document.addEventListener('DOMContentLoaded', init)
