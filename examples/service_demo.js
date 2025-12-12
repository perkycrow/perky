import ServiceClient from '../service/service_client'

class ServiceDemo {

    constructor () {
        this.client = null
        this.worker = null
        this.isConnected = false
        this.stats = {
            totalRequests: 0,
            totalResponseTime: 0,
            successCount: 0,
            requestsPerSecond: 0
        }
        this.lastData = null
        
        this.initializeUI()
    }


    initializeUI () {
        this.elements = {
            connectionStatus: document.getElementById('connectionStatus'),
            connectBtn: document.getElementById('connectBtn'),
            disconnectBtn: document.getElementById('disconnectBtn'),
            
            num1: document.getElementById('num1'),
            num2: document.getElementById('num2'),
            addBtn: document.getElementById('addBtn'),
            multiplyBtn: document.getElementById('multiplyBtn'),
            fibonacciBtn: document.getElementById('fibonacciBtn'),
            
            dataCount: document.getElementById('dataCount'),
            generateBtn: document.getElementById('generateBtn'),
            sortBtn: document.getElementById('sortBtn'),
            statsBtn: document.getElementById('statsBtn'),
            
            requestCount: document.getElementById('requestCount'),
            benchmarkBtn: document.getElementById('benchmarkBtn'),
            stressBtn: document.getElementById('stressBtn'),
            
            totalRequests: document.getElementById('totalRequests'),
            avgResponseTime: document.getElementById('avgResponseTime'),
            successRate: document.getElementById('successRate'),
            requestsPerSecond: document.getElementById('requestsPerSecond'),
            
            operationLog: document.getElementById('operationLog'),
            clearLogBtn: document.getElementById('clearLogBtn')
        }
        
        this.attachEventListeners()
        this.updateConnectionStatus()
    }


    attachEventListeners () {
        this.elements.connectBtn.addEventListener('click', () => this.connectWorker())
        this.elements.disconnectBtn.addEventListener('click', () => this.disconnectWorker())
        
        this.elements.addBtn.addEventListener('click', () => this.performCalculation('add'))
        this.elements.multiplyBtn.addEventListener('click', () => this.performCalculation('multiply'))
        this.elements.fibonacciBtn.addEventListener('click', () => this.performFibonacci())
        
        this.elements.generateBtn.addEventListener('click', () => this.generateData())
        this.elements.sortBtn.addEventListener('click', () => this.sortData())
        this.elements.statsBtn.addEventListener('click', () => this.calculateStats())
        
        this.elements.benchmarkBtn.addEventListener('click', () => this.runBenchmark())
        this.elements.stressBtn.addEventListener('click', () => this.runStressTest())
        
        this.elements.clearLogBtn.addEventListener('click', () => this.clearLog())
    }


    async connectWorker () {
        try {
            this.log('🔄 Connecting to worker...')
            
            this.worker = new Worker('./workers/service_worker.js', {type: 'module'})
            this.client = new ServiceClient({target: this.worker})
            
            this.worker.onerror = (error) => {
                this.log(`❌ Worker error: ${error.message}`)
                this.disconnectWorker()
            }
            
            await this.client.request('ping')
            
            this.isConnected = true
            this.updateConnectionStatus()
            this.log('✅ Worker connected successfully')
            
        } catch (error) {
            this.log(`❌ Connection failed: ${error.message}`)
            this.disconnectWorker()
        }
    }


    disconnectWorker () {
        if (this.worker) {
            this.worker.terminate()
            this.worker = null
        }
        
        this.client = null
        this.isConnected = false
        this.updateConnectionStatus()
        this.log('🔌 Worker disconnected')
    }


    updateConnectionStatus () {
        const status = this.elements.connectionStatus
        const connectBtn = this.elements.connectBtn
        const disconnectBtn = this.elements.disconnectBtn
        
        if (this.isConnected) {
            status.textContent = 'Worker connected and operational'
            status.className = 'demo-status status-connected'
            connectBtn.disabled = true
            disconnectBtn.disabled = false
        } else {
            status.textContent = 'Worker not connected'
            status.className = 'demo-status status-disconnected'
            connectBtn.disabled = false
            disconnectBtn.disabled = true
        }
        
        const actionButtons = [
            this.elements.addBtn, this.elements.multiplyBtn, this.elements.fibonacciBtn,
            this.elements.generateBtn, this.elements.sortBtn, this.elements.statsBtn,
            this.elements.benchmarkBtn, this.elements.stressBtn
        ]
        
        actionButtons.forEach(btn => {
            btn.disabled = !this.isConnected
        })
    }


    async performCalculation (operation) {
        if (!this.isConnected) {
            return
        }
        
        const num1 = parseInt(this.elements.num1.value, 10) || 0
        const num2 = parseInt(this.elements.num2.value, 10) || 0

        try {
            this.log(`🧮 Calculation: ${num1} ${operation === 'add' ? '+' : '×'} ${num2}`)
            
            const startTime = performance.now()
            const result = await this.client.request('calculate', {
                operation,
                a: num1,
                b: num2
            })
            const duration = performance.now() - startTime
            
            this.updateStats(duration, true)
            this.log(`✅ Result: ${result.result} (${duration.toFixed(2)}ms)`)
            
        } catch (error) {
            this.updateStats(0, false)
            this.log(`❌ Calculation error: ${error.message}`)
        }
    }


    async performFibonacci () {
        if (!this.isConnected) {
            return
        }

        const num = parseInt(this.elements.num1.value, 10) || 30

        try {
            this.log(`🔢 Calculating Fibonacci(${num}) - intensive computation...`)
            
            const startTime = performance.now()
            const result = await this.client.request('fibonacci', {n: num}, 10000)
            const duration = performance.now() - startTime
            
            this.updateStats(duration, true)
            this.log(`✅ Fibonacci(${num}) = ${result.result} (${duration.toFixed(2)}ms)`)
            
        } catch (error) {
            this.updateStats(0, false)
            this.log(`❌ Fibonacci error: ${error.message}`)
        }
    }


    async generateData () {
        if (!this.isConnected) {
            return
        }

        const count = parseInt(this.elements.dataCount.value, 10) || 1000

        try {
            this.log(`📊 Generating ${count} random numbers...`)
            
            const startTime = performance.now()
            const result = await this.client.request('generateData', {count})
            const duration = performance.now() - startTime
            
            this.lastData = result.data
            this.updateStats(duration, true)
            this.log(`✅ ${count} numbers generated (${duration.toFixed(2)}ms)`)
            
        } catch (error) {
            this.updateStats(0, false)
            this.log(`❌ Generation error: ${error.message}`)
        }
    }


    async sortData () {
        if (!this.isConnected || !this.lastData) {
            this.log('⚠️ No data to sort. Generate data first.')
            return
        }
        
        try {
            this.log(`🔄 Sorting ${this.lastData.length} elements...`)
            
            const startTime = performance.now()
            const result = await this.client.request('sortData', {data: this.lastData})
            const duration = performance.now() - startTime
            
            this.lastData = result.sortedData
            this.updateStats(duration, true)
            this.log(`✅ Data sorted (${duration.toFixed(2)}ms)`)
            
        } catch (error) {
            this.updateStats(0, false)
            this.log(`❌ Sort error: ${error.message}`)
        }
    }


    async calculateStats () {
        if (!this.isConnected || !this.lastData) {
            this.log('⚠️ No data for statistics.')
            return
        }
        
        try {
            this.log('📈 Calculating statistics...')
            
            const startTime = performance.now()
            const result = await this.client.request('calculateStats', {data: this.lastData})
            const duration = performance.now() - startTime
            
            this.updateStats(duration, true)
            this.log(`✅ Stats: min=${result.min}, max=${result.max}, mean=${result.mean.toFixed(2)}, median=${result.median} (${duration.toFixed(2)}ms)`)
            
        } catch (error) {
            this.updateStats(0, false)
            this.log(`❌ Stats error: ${error.message}`)
        }
    }


    async runBenchmark () {
        if (!this.isConnected) {
            return
        }

        const requestCount = parseInt(this.elements.requestCount.value, 10) || 100

        this.log(`🏃 Benchmark: ${requestCount} parallel requests...`)
        
        const startTime = performance.now()
        const promises = []
        
        for (let i = 0; i < requestCount; i++) {
            promises.push(
                this.client.request('calculate', {
                    operation: 'add',
                    a: Math.floor(Math.random() * 100),
                    b: Math.floor(Math.random() * 100)
                }).catch(error => ({error: error.message}))
            )
        }
        
        try {
            const results = await Promise.all(promises)
            const totalTime = performance.now() - startTime
            
            const successCount = results.filter(r => !r.error).length
            const errorCount = results.filter(r => r.error).length
            const requestsPerSecond = (requestCount / totalTime * 1000).toFixed(1)
            
            this.stats.totalRequests += requestCount
            this.stats.successCount += successCount
            this.stats.requestsPerSecond = parseFloat(requestsPerSecond)
            
            this.updateStatsDisplay()
            
            this.log(`✅ Benchmark completed: ${successCount} success, ${errorCount} errors, ${requestsPerSecond} req/sec`)
            
        } catch (error) {
            this.log(`❌ Benchmark error: ${error.message}`)
        }
    }


    async runStressTest () {
        if (!this.isConnected) {
            return
        }
        
        this.log('💪 Stress test: fast requests and heavy computations...')
        
        const promises = [
            this.client.request('fibonacci', {n: 35}),
            this.client.request('generateData', {count: 10000}),
            this.client.request('calculate', {operation: 'multiply', a: 999, b: 888}),
            this.client.request('fibonacci', {n: 30}),
            this.client.request('calculateStats', {data: Array.from({length: 1000}, () => Math.random())})
        ]
        
        try {
            const startTime = performance.now()
            await Promise.all(promises)
            const totalTime = performance.now() - startTime
            
            this.log(`✅ Stress test completed in ${totalTime.toFixed(2)}ms`)
            
        } catch (error) {
            this.log(`❌ Stress test failed: ${error.message}`)
        }
    }


    updateStats (responseTime, success) {
        this.stats.totalRequests++
        
        if (success) {
            this.stats.successCount++
            this.stats.totalResponseTime += responseTime
        }
        
        this.updateStatsDisplay()
    }


    updateStatsDisplay () {
        this.elements.totalRequests.textContent = this.stats.totalRequests
        
        const avgTime = this.stats.successCount > 0 
            ? (this.stats.totalResponseTime / this.stats.successCount).toFixed(1)
            : '0'
        this.elements.avgResponseTime.textContent = `${avgTime}ms`
        
        const successRate = this.stats.totalRequests > 0
            ? ((this.stats.successCount / this.stats.totalRequests) * 100).toFixed(1)
            : '0'
        this.elements.successRate.textContent = `${successRate}%`
        
        this.elements.requestsPerSecond.textContent = this.stats.requestsPerSecond
    }


    log (message) {
        const timestamp = new Date().toLocaleTimeString()
        const logEntry = `[${timestamp}] ${message}\n`
        this.elements.operationLog.textContent += logEntry
        this.elements.operationLog.scrollTop = this.elements.operationLog.scrollHeight
    }


    clearLog () {
        this.elements.operationLog.textContent = 'Log cleared...\n'
    }

}

// Start the demo
document.addEventListener('DOMContentLoaded', () => {
    new ServiceDemo()
})
