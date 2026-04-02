const DEFAULT_HISTORY_SIZE = 60
const TARGET_FRAME_TIME = 1000 / 60


export default class PerformanceMonitor {

    constructor (options = {}) {
        this.historySize = options.historySize || DEFAULT_HISTORY_SIZE
        this.targetFrameTime = options.targetFrameTime || TARGET_FRAME_TIME

        this.history = []
        this.lastTimestamp = 0
        this.averageFrameTime = 0
        this.averageFps = 0
    }


    tick (timestamp) {
        if (this.lastTimestamp > 0) {
            const frameTime = timestamp - this.lastTimestamp

            if (frameTime > 0 && frameTime < 1000) {
                this.history.push(frameTime)

                if (this.history.length > this.historySize) {
                    this.history.shift()
                }

                this.averageFrameTime = computeAverage(this.history)
                this.averageFps = Math.round(1000 / this.averageFrameTime)
            }
        }

        this.lastTimestamp = timestamp
    }


    get performanceScore () {
        if (this.history.length === 0) {
            return 100
        }

        const ratio = this.targetFrameTime / this.averageFrameTime
        const slowFrames = countSlowFrames(this.history, this.targetFrameTime * 1.5)
        const slowRatio = slowFrames / this.history.length

        const ratioScore = Math.min(100, ratio * 100)
        const stabilityScore = Math.max(0, 100 - slowRatio * 200)

        return Math.round(ratioScore * 0.6 + stabilityScore * 0.4)
    }


    get stats () {
        return {
            averageFrameTime: Math.round(this.averageFrameTime * 100) / 100,
            averageFps: this.averageFps,
            performanceScore: this.performanceScore
        }
    }


    reset () {
        this.history = []
        this.lastTimestamp = 0
        this.averageFrameTime = 0
        this.averageFps = 0
    }

}


function computeAverage (values) {
    if (values.length === 0) {
        return 0
    }

    let sum = 0

    for (let i = 0; i < values.length; i++) {
        sum += values[i]
    }

    return sum / values.length
}


function countSlowFrames (frameTimes, threshold) {
    let count = 0

    for (let i = 0; i < frameTimes.length; i++) {
        if (frameTimes[i] > threshold) {
            count++
        }
    }

    return count
}
