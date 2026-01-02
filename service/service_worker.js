import logger from '../core/logger.js'


let service = null

self.addEventListener('message', async (event) => {
    const {type, servicePath, config = {}} = event.data

    if (type !== 'init-service' || service !== null) {
        return
    }

    try {
        const module = await import(/* @vite-ignore */ servicePath)
        const ServiceClass = module.default || module[Object.keys(module)[0]]

        service = new ServiceClass(config)

    } catch (error) {
        logger.error('Service init failed:', error.message)
    }
})
