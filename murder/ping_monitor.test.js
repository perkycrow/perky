import {describe, test, expect, vi, beforeEach, afterEach} from 'vitest'
import PingMonitor from './ping_monitor.js'


function createPingFn (rtt = 50) {
    return vi.fn(() => Promise.resolve({rtt}))
}


function createVariablePingFn (rtts) {
    let index = 0
    return vi.fn(() => {
        const rtt = rtts[index % rtts.length]
        index++
        return Promise.resolve({rtt})
    })
}


describe('PingMonitor', () => {

    beforeEach(() => {
        vi.useFakeTimers()
    })

    afterEach(() => {
        vi.useRealTimers()
    })


    test('constructor defaults', () => {
        const monitor = new PingMonitor(createPingFn())
        expect(monitor.interval).toBe(2000)
        expect(monitor.historySize).toBe(20)
        expect(monitor.history).toEqual([])
        expect(monitor.smoothedRtt).toBe(0)
        expect(monitor.jitter).toBe(0)
        expect(monitor.running).toBe(false)
    })


    test('constructor with options', () => {
        const monitor = new PingMonitor(createPingFn(), {
            interval: 1000,
            historySize: 10
        })
        expect(monitor.interval).toBe(1000)
        expect(monitor.historySize).toBe(10)
    })


    test('start and stop', () => {
        const monitor = new PingMonitor(createPingFn())
        monitor.start()
        expect(monitor.running).toBe(true)
        monitor.stop()
        expect(monitor.running).toBe(false)
    })


    test('measure records rtt', async () => {
        const monitor = new PingMonitor(createPingFn(42))

        await monitor.measure()

        expect(monitor.lastRtt).toBe(42)
        expect(monitor.history).toEqual([42])
        expect(monitor.smoothedRtt).toBe(42)
    })


    test('measure computes EMA over multiple samples', async () => {
        const pingFn = createVariablePingFn([100, 50, 50, 50])
        const monitor = new PingMonitor(pingFn)

        await monitor.measure()
        await monitor.measure()
        await monitor.measure()
        await monitor.measure()

        expect(monitor.smoothedRtt).toBeLessThan(100)
        expect(monitor.smoothedRtt).toBeGreaterThan(50)
    })


    test('measure computes jitter', async () => {
        const pingFn = createVariablePingFn([50, 100, 50, 100])
        const monitor = new PingMonitor(pingFn)

        await monitor.measure()
        await monitor.measure()
        await monitor.measure()
        await monitor.measure()

        expect(monitor.jitter).toBe(50)
    })


    test('jitter is zero with constant rtt', async () => {
        const monitor = new PingMonitor(createPingFn(50))

        await monitor.measure()
        await monitor.measure()
        await monitor.measure()

        expect(monitor.jitter).toBe(0)
    })


    test('history is capped at historySize', async () => {
        const monitor = new PingMonitor(createPingFn(50), {historySize: 3})

        await monitor.measure()
        await monitor.measure()
        await monitor.measure()
        await monitor.measure()
        await monitor.measure()

        expect(monitor.history.length).toBe(3)
    })


    test('packetLoss tracks failures', async () => {
        const failingPing = vi.fn(() => Promise.reject(new Error('timeout')))
        const monitor = new PingMonitor(failingPing)

        await monitor.measure()
        await monitor.measure()

        expect(monitor.totalPings).toBe(2)
        expect(monitor.failures).toBe(2)
        expect(monitor.packetLoss).toBe(1)
    })


    test('packetLoss recovers after success', async () => {
        let shouldFail = true
        const pingFn = vi.fn(() => {
            if (shouldFail) {
                return Promise.reject(new Error('timeout'))
            }
            return Promise.resolve({rtt: 50})
        })

        const monitor = new PingMonitor(pingFn)

        await monitor.measure()
        shouldFail = false
        await monitor.measure()

        expect(monitor.failures).toBe(0)
    })


    test('connectionScore is high for good connection', async () => {
        const monitor = new PingMonitor(createPingFn(20))

        await monitor.measure()

        expect(monitor.connectionScore).toBeGreaterThan(80)
    })


    test('connectionScore is low for bad connection', async () => {
        const monitor = new PingMonitor(createPingFn(300))

        await monitor.measure()

        expect(monitor.connectionScore).toBeLessThanOrEqual(50)
    })


    test('stats getter returns all metrics', async () => {
        const monitor = new PingMonitor(createPingFn(50))

        await monitor.measure()

        const stats = monitor.stats
        expect(stats).toHaveProperty('rtt')
        expect(stats).toHaveProperty('smoothedRtt')
        expect(stats).toHaveProperty('jitter')
        expect(stats).toHaveProperty('packetLoss')
        expect(stats).toHaveProperty('connectionScore')
    })


    test('onStats callback fires on measure', async () => {
        const onStats = vi.fn()
        const monitor = new PingMonitor(createPingFn(50), {onStats})

        await monitor.measure()

        expect(onStats).toHaveBeenCalledTimes(1)
        expect(onStats).toHaveBeenCalledWith(expect.objectContaining({
            rtt: 50,
            smoothedRtt: 50
        }))
    })


    test('onStats callback fires even on failure', async () => {
        const onStats = vi.fn()
        const failingPing = vi.fn(() => Promise.reject(new Error('timeout')))
        const monitor = new PingMonitor(failingPing, {onStats})

        await monitor.measure()

        expect(onStats).toHaveBeenCalledTimes(1)
    })


    test('start calls measure immediately then on interval', async () => {
        const pingFn = createPingFn(50)
        const monitor = new PingMonitor(pingFn, {interval: 1000})

        monitor.start()
        await vi.advanceTimersByTimeAsync(0)

        expect(pingFn).toHaveBeenCalledTimes(1)

        await vi.advanceTimersByTimeAsync(1000)
        expect(pingFn).toHaveBeenCalledTimes(2)

        await vi.advanceTimersByTimeAsync(1000)
        expect(pingFn).toHaveBeenCalledTimes(3)

        monitor.stop()
    })


    test('stop prevents further pings', async () => {
        const pingFn = createPingFn(50)
        const monitor = new PingMonitor(pingFn, {interval: 1000})

        monitor.start()
        await vi.advanceTimersByTimeAsync(0)
        monitor.stop()

        await vi.advanceTimersByTimeAsync(5000)
        expect(pingFn).toHaveBeenCalledTimes(1)
    })


    test('start stops previous timer', async () => {
        const pingFn = createPingFn(50)
        const monitor = new PingMonitor(pingFn, {interval: 1000})

        monitor.start()
        await vi.advanceTimersByTimeAsync(0)
        monitor.start()
        await vi.advanceTimersByTimeAsync(0)

        await vi.advanceTimersByTimeAsync(1000)
        expect(pingFn).toHaveBeenCalledTimes(3)

        monitor.stop()
    })

})
