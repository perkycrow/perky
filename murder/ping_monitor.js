const DEFAULT_INTERVAL = 2000
const DEFAULT_HISTORY_SIZE = 20
const EMA_ALPHA = 0.2


export default class PingMonitor {

    constructor (pingFn, options = {}) {
        this.pingFn = pingFn
        this.interval = options.interval || DEFAULT_INTERVAL
        this.historySize = options.historySize || DEFAULT_HISTORY_SIZE

        this.history = []
        this.smoothedRtt = 0
        this.jitter = 0
        this.lastRtt = 0
        this.failures = 0
        this.totalPings = 0
        this.timerId = null
        this.onStats = options.onStats || null
    }


    start () {
        this.stop()
        this.measure()
        this.timerId = setInterval(() => this.measure(), this.interval)
    }


    stop () {
        if (this.timerId) {
            clearInterval(this.timerId)
            this.timerId = null
        }
    }


    async measure () {
        this.totalPings++

        try {
            const result = await this.pingFn()
            const rtt = result.rtt
            this.lastRtt = rtt
            this.failures = Math.max(0, this.failures - 1)

            this.history.push(rtt)

            if (this.history.length > this.historySize) {
                this.history.shift()
            }

            this.smoothedRtt = computeEma(this.history, EMA_ALPHA)
            this.jitter = computeJitter(this.history)
        } catch {
            this.failures++
        }

        if (this.onStats) {
            this.onStats(this.stats)
        }
    }


    get packetLoss () {
        if (this.totalPings === 0) {
            return 0
        }
        return this.failures / this.totalPings
    }


    get connectionScore () {
        return computeConnectionScore(this.smoothedRtt, this.jitter, this.packetLoss)
    }


    get stats () {
        return {
            rtt: this.lastRtt,
            smoothedRtt: this.smoothedRtt,
            jitter: this.jitter,
            packetLoss: this.packetLoss,
            connectionScore: this.connectionScore
        }
    }


    get running () {
        return this.timerId !== null
    }

}


function computeEma (values, alpha) {
    if (values.length === 0) {
        return 0
    }

    let ema = values[0]

    for (let i = 1; i < values.length; i++) {
        ema = alpha * values[i] + (1 - alpha) * ema
    }

    return Math.round(ema * 100) / 100
}


function computeJitter (values) {
    if (values.length < 2) {
        return 0
    }

    let sum = 0

    for (let i = 1; i < values.length; i++) {
        sum += Math.abs(values[i] - values[i - 1])
    }

    return Math.round((sum / (values.length - 1)) * 100) / 100
}


function computeConnectionScore (smoothedRtt, jitter, packetLoss) {
    const rttScore = Math.max(0, 100 - smoothedRtt / 2)
    const jitterScore = Math.max(0, 100 - jitter * 2)
    const lossScore = Math.max(0, 100 - packetLoss * 500)

    const score = rttScore * 0.5 + jitterScore * 0.3 + lossScore * 0.2

    return Math.round(Math.max(0, Math.min(100, score)))
}
