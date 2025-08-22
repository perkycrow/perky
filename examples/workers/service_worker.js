import ServiceHost from '../../core/service_host.js'

class ServiceWorker {

    constructor () {
        this.host = new ServiceHost()
        this.registerServices()
        this.log('🚀 Service Worker started and ready')
    }


    registerServices () {
        this.host.register('ping', this.handlePing.bind(this))
        this.host.register('calculate', this.handleCalculate.bind(this))
        this.host.register('fibonacci', this.handleFibonacci.bind(this))
        this.host.register('generateData', this.handleGenerateData.bind(this))
        this.host.register('sortData', this.handleSortData.bind(this))
        this.host.register('calculateStats', this.handleCalculateStats.bind(this))
        
        this.log('📋 Services registered: ping, calculate, fibonacci, generateData, sortData, calculateStats')
    }


    handlePing (req, res) {
        this.log(`🏓 Ping received (ID: ${req.id})`)
        res.send({
            message: 'pong',
            timestamp: Date.now(),
            workerId: 'service_worker_v1'
        })
    }


    handleCalculate (req, res) {
        const {operation, a, b} = req.params
        
        this.log(`🧮 Calculation requested: ${a} ${operation} ${b}`)
        
        try {
            let result
            
            switch (operation) {
                case 'add':
                    result = a + b
                    break
                case 'subtract':
                    result = a - b
                    break
                case 'multiply':
                    result = a * b
                    break
                case 'divide':
                    if (b === 0) {
                        throw new Error('Division by zero')
                    }
                    result = a / b
                    break
                default:
                    throw new Error(`Unsupported operation: ${operation}`)
            }
            
            res.send({
                operation,
                operands: {a, b},
                result,
                timestamp: Date.now()
            })
            
        } catch (error) {
            this.log(`❌ Calculation error: ${error.message}`)
            res.error(error.message)
        }
    }


    handleFibonacci (req, res) {
        const {n} = req.params
        
        this.log(`🔢 Calculating Fibonacci(${n}) - intensive computation`)
        
        try {
            if (n < 0) {
                throw new Error('n must be positive')
            }
            
            if (n > 50) {
                throw new Error('n too large (max 50 to avoid timeouts)')
            }
            
            const startTime = performance.now()
            const result = this.fibonacci(n)
            const duration = performance.now() - startTime
            
            this.log(`✅ Fibonacci(${n}) calculated in ${duration.toFixed(2)}ms`)
            
            res.send({
                n,
                result,
                calculationTime: duration,
                timestamp: Date.now()
            })
            
        } catch (error) {
            this.log(`❌ Fibonacci error: ${error.message}`)
            res.error(error.message)
        }
    }


    handleGenerateData (req, res) {
        const {count = 1000} = req.params
        
        this.log(`📊 Generating ${count} random numbers`)
        
        try {
            if (count > 100000) {
                throw new Error('Element count too large (max 100000)')
            }
            
            const startTime = performance.now()
            const data = []
            
            for (let i = 0; i < count; i++) {
                data.push(Math.floor(Math.random() * 10000))
            }
            
            const duration = performance.now() - startTime
            
            this.log(`✅ ${count} numbers generated in ${duration.toFixed(2)}ms`)
            
            res.send({
                data,
                count: data.length,
                generationTime: duration,
                timestamp: Date.now()
            })
            
        } catch (error) {
            this.log(`❌ Generation error: ${error.message}`)
            res.error(error.message)
        }
    }


    handleSortData (req, res) {
        const {data} = req.params
        
        if (!Array.isArray(data)) {
            res.error('Data must be an array')
            return
        }
        
        this.log(`🔄 Sorting ${data.length} elements`)
        
        try {
            const startTime = performance.now()
            
            const sortedData = [...data].sort((a, b) => a - b)
            
            const duration = performance.now() - startTime
            
            this.log(`✅ Sort completed in ${duration.toFixed(2)}ms`)
            
            res.send({
                sortedData,
                originalLength: data.length,
                sortedLength: sortedData.length,
                sortTime: duration,
                timestamp: Date.now()
            })
            
        } catch (error) {
            this.log(`❌ Sort error: ${error.message}`)
            res.error(error.message)
        }
    }


    handleCalculateStats (req, res) {
        const {data} = req.params
        
        if (!Array.isArray(data) || data.length === 0) {
            res.error('Data must be a non-empty array')
            return
        }
        
        this.log(`📈 Calculating statistics on ${data.length} elements`)
        
        try {
            const startTime = performance.now()
            
            const numbers = data.filter(x => typeof x === 'number' && !isNaN(x))
            
            if (numbers.length === 0) {
                throw new Error('No valid numbers found')
            }
            
            const sorted = [...numbers].sort((a, b) => a - b)
            const sum = numbers.reduce((acc, val) => acc + val, 0)
            const mean = sum / numbers.length
            
            const min = sorted[0]
            const max = sorted[sorted.length - 1]
            
            const median = sorted.length % 2 === 0
                ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
                : sorted[Math.floor(sorted.length / 2)]
            
            const variance = numbers.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / numbers.length
            const standardDeviation = Math.sqrt(variance)
            
            const duration = performance.now() - startTime
            
            this.log(`✅ Statistics calculated in ${duration.toFixed(2)}ms`)
            
            res.send({
                count: numbers.length,
                min,
                max,
                sum,
                mean,
                median,
                variance,
                standardDeviation,
                calculationTime: duration,
                timestamp: Date.now()
            })
            
        } catch (error) {
            this.log(`❌ Stats error: ${error.message}`)
            res.error(error.message)
        }
    }


    fibonacci (n) {
        if (n <= 1) return n
        
        let a = 0
        let b = 1
        
        for (let i = 2; i <= n; i++) {
            const temp = a + b
            a = b
            b = temp
        }
        
        return b
    }


    log (message) {
        const timestamp = new Date().toISOString()
        console.log(`[${timestamp}] [ServiceWorker] ${message}`)
    }

}

// Start the service worker
new ServiceWorker()
