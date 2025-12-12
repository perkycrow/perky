import ServiceClient from '../service/service_client'

class WorkerTestDemo {

    constructor () {
        this.client = null
        this.isReady = false
        
        this.initializeUI()
        this.startService()
    }


    initializeUI () {
        this.elements = {
            statusText: document.getElementById('statusText'),
            statusIndicator: document.querySelector('.status-indicator'),
            
            num1: document.getElementById('num1'),
            num2: document.getElementById('num2'),
            fibNum: document.getElementById('fibNum'),
            
            addBtn: document.getElementById('addBtn'),
            multiplyBtn: document.getElementById('multiplyBtn'),
            fibBtn: document.getElementById('fibBtn'),
            infoBtn: document.getElementById('infoBtn'),
            clearLogBtn: document.getElementById('clearLogBtn'),
            
            resultLog: document.getElementById('resultLog')
        }
        
        this.attachEventListeners()
    }


    attachEventListeners () {
        this.elements.addBtn.addEventListener('click', () => this.performAdd())
        this.elements.multiplyBtn.addEventListener('click', () => this.performMultiply())
        this.elements.fibBtn.addEventListener('click', () => this.performFibonacci())
        this.elements.infoBtn.addEventListener('click', () => this.getServiceInfo())
        this.elements.clearLogBtn.addEventListener('click', () => this.clearLog())
    }


    async startService () {
        try {
            this.log('🚀 Starting worker service with ServiceClient.fromWorker()...')
            this.updateStatus('loading', 'Loading service...')
            
            // TEST: Utiliser la nouvelle méthode fromWorker
            // Le chemin doit être relatif depuis la racine du projet car le worker est dans core/
            this.client = ServiceClient.fromWorker('../examples/services/simple_math_service.js', {
                precision: 'high'
            })
            
            this.log('✅ ServiceClient created, waiting for service initialization...')
            
            // Attendre un peu que le service s'initialise
            await new Promise(resolve => setTimeout(resolve, 100))
            
            // Tester la connexion avec un timeout plus court
            const info = await this.client.request('getInfo', {}, 2000)
            
            this.isReady = true
            this.updateStatus('ready', `Service ready: ${info.serviceName} v${info.version}`)
            this.enableButtons()
            
            this.log(`📋 Service info: ${JSON.stringify(info, null, 2)}`)
            
        } catch (error) {
            this.updateStatus('error', `Service failed: ${error.message}`)
            this.log(`❌ Service initialization failed: ${error.message}`)
        }
    }


    async performAdd () {
        if (!this.isReady) return
        
        const a = parseInt(this.elements.num1.value, 10) || 0
        const b = parseInt(this.elements.num2.value, 10) || 0
        
        try {
            this.log(`🧮 Requesting: ${a} + ${b}`)
            
            const startTime = performance.now()
            const result = await this.client.request('add', {a, b})
            const duration = performance.now() - startTime
            
            this.log(`✅ Result: ${result.result} (${duration.toFixed(2)}ms)`)
            
        } catch (error) {
            this.log(`❌ Addition failed: ${error.message}`)
        }
    }


    async performMultiply () {
        if (!this.isReady) return
        
        const a = parseInt(this.elements.num1.value, 10) || 0
        const b = parseInt(this.elements.num2.value, 10) || 0
        
        try {
            this.log(`🧮 Requesting: ${a} × ${b}`)
            
            const startTime = performance.now()
            const result = await this.client.request('multiply', {a, b})
            const duration = performance.now() - startTime
            
            this.log(`✅ Result: ${result.result} (${duration.toFixed(2)}ms)`)
            
        } catch (error) {
            this.log(`❌ Multiplication failed: ${error.message}`)
        }
    }


    async performFibonacci () {
        if (!this.isReady) return
        
        const n = parseInt(this.elements.fibNum.value, 10) || 30
        
        try {
            this.log(`🔢 Requesting: Fibonacci(${n}) - intensive calculation...`)
            
            const startTime = performance.now()
            const result = await this.client.request('fibonacci', {n})
            const duration = performance.now() - startTime
            
            this.log(`✅ Fibonacci(${n}) = ${result.result}`)
            this.log(`   Service calculation time: ${result.calculationTime.toFixed(2)}ms`)
            this.log(`   Total round-trip time: ${duration.toFixed(2)}ms`)
            
        } catch (error) {
            this.log(`❌ Fibonacci failed: ${error.message}`)
        }
    }


    async getServiceInfo () {
        if (!this.isReady) return
        
        try {
            this.log('📋 Requesting service information...')
            
            const info = await this.client.request('getInfo')
            this.log(`📊 Service Info:\n${JSON.stringify(info, null, 2)}`)
            
        } catch (error) {
            this.log(`❌ Info request failed: ${error.message}`)
        }
    }


    updateStatus (type, message) {
        this.elements.statusText.textContent = message
        this.elements.statusIndicator.className = `status-indicator status-${type}`
    }


    enableButtons () {
        this.elements.addBtn.disabled = false
        this.elements.multiplyBtn.disabled = false
        this.elements.fibBtn.disabled = false
        this.elements.infoBtn.disabled = false
    }


    log (message) {
        const timestamp = new Date().toLocaleTimeString()
        const logEntry = `[${timestamp}] ${message}\n`
        this.elements.resultLog.textContent += logEntry
        this.elements.resultLog.scrollTop = this.elements.resultLog.scrollHeight
    }


    clearLog () {
        this.elements.resultLog.textContent = 'Log cleared...\n'
    }

}

// Start the demo
document.addEventListener('DOMContentLoaded', () => {
    new WorkerTestDemo()
})
