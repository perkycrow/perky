import ServiceHost from '../../service/service_host'

export default class SimpleMathService extends ServiceHost {

    static serviceMethods = ['add', 'multiply', 'fibonacci', 'getInfo']

    constructor (config = {}) {
        super(config) // Passe transport si fourni, sinon auto-détecte
        
        this.precision = config.precision || 'normal'
        this.startTime = Date.now()
        this.log('🧮 SimpleMathService started with precision:', this.precision)
    }


    add (req, res) {
        const {a, b} = req.params
        const result = a + b
        
        this.log(`Addition: ${a} + ${b} = ${result}`)
        res.send({result, operation: 'add', inputs: {a, b}})
    }


    multiply (req, res) {
        const {a, b} = req.params
        const result = a * b
        
        this.log(`Multiplication: ${a} × ${b} = ${result}`)
        res.send({result, operation: 'multiply', inputs: {a, b}})
    }


    fibonacci (req, res) {
        const {n} = req.params
        
        if (n < 0 || n > 45) {
            res.error('n must be between 0 and 45')
            return
        }
        
        const startTime = performance.now()
        const result = this.calculateFibonacci(n)
        const duration = performance.now() - startTime
        
        this.log(`Fibonacci(${n}) = ${result} (${duration.toFixed(2)}ms)`)
        res.send({
            result,
            n,
            calculationTime: duration,
            precision: this.precision
        })
    }


    getInfo (req, res) {
        res.send({
            serviceName: 'SimpleMathService',
            version: '1.0.0',
            precision: this.precision,
            capabilities: ['add', 'multiply', 'fibonacci'],
            uptime: Date.now() - this.startTime
        })
    }


    calculateFibonacci (n) {
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
        console.log(`[${timestamp}] [SimpleMathService] ${message}`)
    }

}
