import {describe, test, expect} from 'vitest'
import PerformanceMonitor from './performance_monitor.js'


function simulateFrames (monitor, count, frameTime, startTime = 0) {
    for (let i = 0; i <= count; i++) {
        monitor.tick(startTime + i * frameTime)
    }
}


describe('PerformanceMonitor', () => {

    test('constructor defaults', () => {
        const monitor = new PerformanceMonitor()
        expect(monitor.historySize).toBe(60)
        expect(monitor.targetFrameTime).toBeCloseTo(1000 / 60)
        expect(monitor.history).toEqual([])
    })


    test('constructor with options', () => {
        const monitor = new PerformanceMonitor({
            historySize: 30,
            targetFrameTime: 33.33
        })
        expect(monitor.historySize).toBe(30)
        expect(monitor.targetFrameTime).toBe(33.33)
    })


    test('tick records frame times', () => {
        const monitor = new PerformanceMonitor()

        monitor.tick(100)
        monitor.tick(116.67)
        monitor.tick(133.34)

        expect(monitor.history.length).toBe(2)
    })


    test('first tick records no frame time', () => {
        const monitor = new PerformanceMonitor()
        monitor.tick(0)
        expect(monitor.history.length).toBe(0)
    })


    test('tick ignores huge gaps', () => {
        const monitor = new PerformanceMonitor()
        monitor.tick(0)
        monitor.tick(2000)
        expect(monitor.history.length).toBe(0)
    })


    test('averageFrameTime at 60fps', () => {
        const monitor = new PerformanceMonitor()
        simulateFrames(monitor, 10, 16.67)

        expect(monitor.averageFrameTime).toBeCloseTo(16.67, 0)
    })


    test('averageFps at 60fps', () => {
        const monitor = new PerformanceMonitor()
        simulateFrames(monitor, 10, 16.67)

        expect(monitor.averageFps).toBeGreaterThanOrEqual(58)
        expect(monitor.averageFps).toBeLessThanOrEqual(62)
    })


    test('history is capped at historySize', () => {
        const monitor = new PerformanceMonitor({historySize: 5})
        simulateFrames(monitor, 20, 16.67)

        expect(monitor.history.length).toBe(5)
    })


    test('performanceScore is 100 with no data', () => {
        const monitor = new PerformanceMonitor()
        expect(monitor.performanceScore).toBe(100)
    })


    test('performanceScore is high at 60fps', () => {
        const monitor = new PerformanceMonitor()
        simulateFrames(monitor, 30, 16.67)

        expect(monitor.performanceScore).toBeGreaterThan(90)
    })


    test('performanceScore is low at 15fps', () => {
        const monitor = new PerformanceMonitor()
        simulateFrames(monitor, 30, 66.67)

        expect(monitor.performanceScore).toBeLessThan(40)
    })


    test('performanceScore penalizes frame drops', () => {
        const monitor = new PerformanceMonitor()

        simulateFrames(monitor, 10, 16.67)
        const stableScore = monitor.performanceScore

        monitor.tick(10 * 16.67 + 50)
        monitor.tick(10 * 16.67 + 100)
        monitor.tick(10 * 16.67 + 150)

        expect(monitor.performanceScore).toBeLessThan(stableScore)
    })


    test('stats getter', () => {
        const monitor = new PerformanceMonitor()
        simulateFrames(monitor, 10, 16.67)

        const stats = monitor.stats
        expect(stats).toHaveProperty('averageFrameTime')
        expect(stats).toHaveProperty('averageFps')
        expect(stats).toHaveProperty('performanceScore')
    })


    test('reset clears all data', () => {
        const monitor = new PerformanceMonitor()
        simulateFrames(monitor, 10, 16.67)

        monitor.reset()

        expect(monitor.history).toEqual([])
        expect(monitor.lastTimestamp).toBe(0)
        expect(monitor.averageFrameTime).toBe(0)
        expect(monitor.averageFps).toBe(0)
    })

})
