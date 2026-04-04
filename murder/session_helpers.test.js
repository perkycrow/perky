import {test, expect} from 'vitest'
import {computeAdaptiveDelay, resolveServerHost} from './session_helpers.js'


test('computeAdaptiveDelay', () => {
    const stats = {smoothedRtt: 100, jitter: 10}
    const snapshotInterval = 0.1

    const delay = computeAdaptiveDelay(stats, snapshotInterval)

    expect(delay).toBeGreaterThanOrEqual(30)
    expect(delay).toBeLessThanOrEqual(200)
})


test('computeAdaptiveDelay with missing stats', () => {
    const stats = {}
    const snapshotInterval = 0.1

    const delay = computeAdaptiveDelay(stats, snapshotInterval)

    expect(delay).toBe(100)
})


test('computeAdaptiveDelay clamps minimum', () => {
    const stats = {smoothedRtt: 0, jitter: 0}
    const snapshotInterval = 0.01

    const delay = computeAdaptiveDelay(stats, snapshotInterval)

    expect(delay).toBe(30)
})


test('computeAdaptiveDelay clamps maximum', () => {
    const stats = {smoothedRtt: 1000, jitter: 100}
    const snapshotInterval = 1

    const delay = computeAdaptiveDelay(stats, snapshotInterval)

    expect(delay).toBe(200)
})


test('resolveServerHost returns localhost for localhost', () => {
    const originalLocation = window.location

    delete window.location
    window.location = {hostname: 'localhost'}

    expect(resolveServerHost()).toBe('localhost:3000')

    window.location = originalLocation
})


test('resolveServerHost returns localhost for 127.0.0.1', () => {
    const originalLocation = window.location

    delete window.location
    window.location = {hostname: '127.0.0.1'}

    expect(resolveServerHost()).toBe('localhost:3000')

    window.location = originalLocation
})


test('resolveServerHost returns production host for other hostnames', () => {
    const originalLocation = window.location

    delete window.location
    window.location = {hostname: 'example.com'}

    expect(resolveServerHost()).toBe('murder.perkycrow.com')

    window.location = originalLocation
})
