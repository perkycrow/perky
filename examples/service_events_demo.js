import ServiceClient from '../core/service_client.js'

class ServiceEventsDemo {

    constructor () {
        this.client = null
        this.worker = null
        this.isConnected = false
        
        this.initializeUI()
    }


    initializeUI () {
        this.elements = {
            connectBtn: document.getElementById('connectBtn'),
            sendToWorkerBtn: document.getElementById('sendToWorkerBtn'),
            requestFromWorkerBtn: document.getElementById('requestFromWorkerBtn'),
            clearLogBtn: document.getElementById('clearLogBtn'),
            eventLog: document.getElementById('eventLog')
        }
        
        this.attachEventListeners()
    }


    attachEventListeners () {
        this.elements.connectBtn.addEventListener('click', () => this.connectWorker())
        this.elements.sendToWorkerBtn.addEventListener('click', () => this.sendEventToWorker())
        this.elements.requestFromWorkerBtn.addEventListener('click', () => this.requestWorkerStatus())
        this.elements.clearLogBtn.addEventListener('click', () => this.clearLog())
    }


    async connectWorker () {
        try {
            this.log('🔄 Connecting to events worker...')
            
            this.worker = new Worker('./workers/events_worker.js', {type: 'module'})
            this.client = new ServiceClient({target: this.worker})
            
            this.setupEventListeners()
            
            await this.client.request('ping')
            
            this.isConnected = true
            this.updateUI()
            this.log('✅ Worker connected and events set up')
            
        } catch (error) {
            this.log(`❌ Connection failed: ${error.message}`)
        }
    }


    setupEventListeners () {
        // Listen to events from the worker
        this.client.on('host:notification', (message, type) => {
            this.log(`🔔 [Host Event] ${type}: ${message}`)
        })
        
        this.client.on('host:dataUpdate', (data) => {
            this.log(`📊 [Host Event] Data update: ${JSON.stringify(data)}`)
        })
        
        this.client.on('host:workerReady', (workerId, capabilities) => {
            this.log(`🚀 [Host Event] Worker ready: ${workerId}, capabilities: ${capabilities.join(', ')}`)
        })
        
        this.client.on('host:progress', (current, total, operation) => {
            const percentage = Math.round((current / total) * 100)
            this.log(`📈 [Host Event] Progress: ${operation} ${percentage}% (${current}/${total})`)
        })
    }


    sendEventToWorker () {
        if (!this.isConnected) return
        
        const events = [
            ['userAction', 'button_click', {buttonId: 'demo', timestamp: Date.now()}],
            ['configChange', {theme: 'dark', language: 'en'}],
            ['statusRequest', 'full_status'],
            ['dataRequest', 'user_stats', {userId: 12345}]
        ]
        
        const randomEvent = events[Math.floor(Math.random() * events.length)]
        const [eventName, ...args] = randomEvent
        
        this.log(`📤 [Client Event] Sending: ${eventName}(${args.map(a => JSON.stringify(a)).join(', ')})`)
        this.client.emitToHost(eventName, ...args)
    }


    async requestWorkerStatus () {
        if (!this.isConnected) return
        
        try {
            this.log('📋 Requesting worker status...')
            const status = await this.client.request('getStatus')
            this.log(`📄 Worker status: ${JSON.stringify(status, null, 2)}`)
        } catch (error) {
            this.log(`❌ Status request failed: ${error.message}`)
        }
    }


    updateUI () {
        this.elements.connectBtn.disabled = this.isConnected
        this.elements.sendToWorkerBtn.disabled = !this.isConnected
        this.elements.requestFromWorkerBtn.disabled = !this.isConnected
    }


    log (message) {
        const timestamp = new Date().toLocaleTimeString()
        const logEntry = `[${timestamp}] ${message}\n`
        this.elements.eventLog.textContent += logEntry
        this.elements.eventLog.scrollTop = this.elements.eventLog.scrollHeight
    }


    clearLog () {
        this.elements.eventLog.textContent = 'Log cleared...\n'
    }

}

// Start the demo
document.addEventListener('DOMContentLoaded', () => {
    new ServiceEventsDemo()
})
