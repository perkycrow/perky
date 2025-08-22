import ServiceHost from '../../core/service_host'

class EventsWorker {

    constructor () {
        this.host = new ServiceHost()
        this.registerServices()
        this.setupEventListeners()
        this.log('🚀 Events Worker started')
        
        // Simulate worker ready after initialization
        setTimeout(() => {
            this.host.emitToClient('workerReady', 'events_worker_v1', ['events', 'notifications', 'data-processing'])
        }, 100)
    }


    registerServices () {
        this.host.register('ping', this.handlePing.bind(this))
        this.host.register('getStatus', this.handleGetStatus.bind(this))
    }


    setupEventListeners () {
        // Listen to events from the client
        this.host.on('client:userAction', (action, data) => {
            this.log(`👤 [Client Event] User action: ${action}`)
            
            // React to user actions
            if (action === 'button_click') {
                this.host.emitToClient('notification', `Button ${data.buttonId} was clicked`, 'info')
            }
        })
        
        this.host.on('client:configChange', (config) => {
            this.log(`⚙️  [Client Event] Config changed: ${JSON.stringify(config)}`)
            this.host.emitToClient('notification', 'Configuration updated', 'success')
        })
        
        this.host.on('client:statusRequest', (type) => {
            this.log(`📊 [Client Event] Status request: ${type}`)
            
            if (type === 'full_status') {
                this.sendFullStatus()
            }
        })
        
        this.host.on('client:dataRequest', (dataType, params) => {
            this.log(`📈 [Client Event] Data request: ${dataType}`)
            this.simulateDataProcessing(dataType, params)
        })
    }


    handlePing (req, res) {
        this.log(`🏓 Ping received (ID: ${req.id})`)
        res.send({
            message: 'pong',
            timestamp: Date.now(),
            workerId: 'events_worker_v1'
        })
    }


    handleGetStatus (req, res) {
        this.log('📋 Status requested via service call')
        
        res.send({
            workerId: 'events_worker_v1',
            status: 'running',
            uptime: Date.now() - this.startTime || 0,
            eventsProcessed: this.eventsProcessed || 0,
            features: ['real-time-events', 'notifications', 'data-processing'],
            memory: this.getMemoryInfo()
        })
    }


    sendFullStatus () {
        const status = {
            id: 'events_worker_v1',
            status: 'operational',
            capabilities: ['events', 'notifications', 'data-processing'],
            performance: {
                uptime: Date.now() - (this.startTime || Date.now()),
                eventsHandled: Math.floor(Math.random() * 1000),
                memory: this.getMemoryInfo()
            }
        }
        
        this.host.emitToClient('dataUpdate', status)
    }


    simulateDataProcessing (dataType, params) {
        this.host.emitToClient('notification', `Starting ${dataType} processing...`, 'info')
        
        // Simulate progress updates
        let current = 0
        const total = 10
        
        const progressInterval = setInterval(() => {
            current++
            this.host.emitToClient('progress', current, total, dataType)
            
            if (current >= total) {
                clearInterval(progressInterval)
                
                // Send final result
                const result = {
                    dataType,
                    params,
                    result: `Processed ${dataType} for user ${params?.userId || 'unknown'}`,
                    timestamp: Date.now(),
                    itemsProcessed: Math.floor(Math.random() * 1000) + 100
                }
                
                this.host.emitToClient('dataUpdate', result)
                this.host.emitToClient('notification', `${dataType} processing completed`, 'success')
            }
        }, 200)
    }


    getMemoryInfo () {
        return {
            used: Math.floor(Math.random() * 50) + 10,
            available: Math.floor(Math.random() * 100) + 50,
            unit: 'MB'
        }
    }


    log (message) {
        const timestamp = new Date().toISOString()
        console.log(`[${timestamp}] [EventsWorker] ${message}`)
    }

}

// Start the events worker
new EventsWorker()
