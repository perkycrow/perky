import ServiceClient from '../core/service_client.js'
import SimpleMathService from './services/simple_math_service.js'

class DirectServiceDemo {

    constructor () {
        this.clients = {}
        this.hosts = {}
        
        this.initializeUI()
        this.log('🚀 Direct Service Demo initialized')
    }


    initializeUI () {
        this.elements = {
            testNum: document.getElementById('testNum'),
            
            workerBtn: document.getElementById('workerBtn'),
            directBtn: document.getElementById('directBtn'),
            pathBtn: document.getElementById('pathBtn'),
            benchmarkBtn: document.getElementById('benchmarkBtn'),
            clearLogBtn: document.getElementById('clearLogBtn'),
            
            resultLog: document.getElementById('resultLog')
        }
        
        this.attachEventListeners()
    }


    attachEventListeners () {
        this.elements.workerBtn.addEventListener('click', () => this.testWorkerService())
        this.elements.directBtn.addEventListener('click', () => this.testDirectService())
        this.elements.pathBtn.addEventListener('click', () => this.testPathService())
        this.elements.benchmarkBtn.addEventListener('click', () => this.runBenchmark())
        this.elements.clearLogBtn.addEventListener('click', () => this.clearLog())
    }


    async testWorkerService () {
        try {
            this.log('🧵 Testing Worker Service...')
            
            if (!this.clients.worker) {
                const startTime = performance.now()
                this.clients.worker = ServiceClient.fromWorker('../examples/services/simple_math_service.js')
                
                // Attendre que le service soit prêt
                await new Promise(resolve => setTimeout(resolve, 100))
                const setupTime = performance.now() - startTime
                
                this.log(`   Setup time: ${setupTime.toFixed(2)}ms`)
            }
            
            const result = await this.clients.worker.request('getInfo')
            this.log(`✅ Worker service: ${result.serviceName} (precision: ${result.precision})`)
            
        } catch (error) {
            this.log(`❌ Worker service failed: ${error.message}`)
        }
    }


    async testDirectService () {
        try {
            this.log('⚡ Testing Direct Service...')
            
            if (!this.clients.direct) {
                const startTime = performance.now()
                const client = await ServiceClient.fromService(SimpleMathService, {precision: 'ultra'})
                const setupTime = performance.now() - startTime
                
                this.clients.direct = client
                this.hosts.direct = client.host
                this.log(`   Setup time: ${setupTime.toFixed(2)}ms`)
            }
            
            const result = await this.clients.direct.request('getInfo')
            this.log(`✅ Direct service: ${result.serviceName} (precision: ${result.precision})`)
            
        } catch (error) {
            this.log(`❌ Direct service failed: ${error.message}`)
        }
    }


    async testPathService () {
        try {
            this.log('📂 Testing Service From Path...')
            
            if (!this.clients.path) {
                const startTime = performance.now()
                const client = await ServiceClient.fromPath('../examples/services/simple_math_service.js', {precision: 'max'})
                const setupTime = performance.now() - startTime
                
                this.clients.path = client
                this.hosts.path = client.host
                this.log(`   Setup time: ${setupTime.toFixed(2)}ms`)
            }
            
            const result = await this.clients.path.request('getInfo')
            this.log(`✅ Path service: ${result.serviceName} (precision: ${result.precision})`)
            
        } catch (error) {
            this.log(`❌ Path service failed: ${error.message}`)
        }
    }


    async runBenchmark () {
        const n = parseInt(this.elements.testNum.value) || 35
        
        this.log(`📊 Running performance benchmark for Fibonacci(${n})...`)
        this.log('   This may take a moment...\n')
        
        // Ensure all services are ready
        await this.testWorkerService()
        await this.testDirectService()
        await this.testPathService()
        
        const tests = [
            {name: 'Worker Service', client: this.clients.worker, color: '🧵'},
            {name: 'Direct Service', client: this.clients.direct, color: '⚡'},
            {name: 'Path Service', client: this.clients.path, color: '📂'}
        ]
        
        const results = []
        
        for (const test of tests) {
            if (!test.client) {
                this.log(`⚠️  ${test.name} not available`)
                continue
            }
            
            try {
                this.log(`${test.color} Testing ${test.name}...`)
                
                const startTime = performance.now()
                const result = await test.client.request('fibonacci', {n})
                const totalTime = performance.now() - startTime
                
                results.push({
                    name: test.name,
                    totalTime,
                    serviceTime: result.calculationTime,
                    result: result.result
                })
                
                this.log(`   Total time: ${totalTime.toFixed(2)}ms`)
                this.log(`   Service time: ${result.calculationTime.toFixed(2)}ms`)
                this.log(`   Communication overhead: ${(totalTime - result.calculationTime).toFixed(2)}ms`)
                
            } catch (error) {
                this.log(`   ❌ Failed: ${error.message}`)
            }
        }
        
        this.log('\n📈 BENCHMARK SUMMARY:')
        results.sort((a, b) => a.totalTime - b.totalTime)
        
        results.forEach((result, index) => {
            const position = index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'
            this.log(`${position} ${result.name}: ${result.totalTime.toFixed(2)}ms total`)
        })
        
        if (results.length > 1) {
            const fastest = results[0]
            const slowest = results[results.length - 1]
            const speedup = (slowest.totalTime / fastest.totalTime).toFixed(1)
            this.log(`\n⚡ ${fastest.name} is ${speedup}x faster than ${slowest.name}`)
        }
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
    new DirectServiceDemo()
})
