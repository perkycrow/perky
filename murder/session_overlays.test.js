import {test, expect, afterEach} from 'vitest'
import {
    createStatsOverlay,
    updateStatsOverlay,
    createWaitingOverlay,
    showWaitingOverlay,
    hideWaitingOverlay,
    updateWaitingText
} from './session_overlays.js'


let overlay


afterEach(() => {
    if (overlay && overlay.parentNode) {
        overlay.parentNode.removeChild(overlay)
    }
    overlay = null
})


test('createStatsOverlay', () => {
    overlay = createStatsOverlay()

    expect(overlay).toBeInstanceOf(HTMLElement)
    expect(overlay.tagName).toBe('DIV')
    expect(document.body.contains(overlay)).toBe(true)
})


test('updateStatsOverlay with stats object', () => {
    overlay = createStatsOverlay()
    const stats = {smoothedRtt: 50, jitter: 5, connectionScore: 90}

    updateStatsOverlay(overlay, {stats, isHost: true})

    expect(overlay.textContent).toContain('HOST')
    expect(overlay.textContent).toContain('RTT: 50ms')
    expect(overlay.textContent).toContain('Jitter: 5ms')
    expect(overlay.textContent).toContain('Conn: 90')
})


test('updateStatsOverlay as client', () => {
    overlay = createStatsOverlay()
    const stats = {smoothedRtt: 100}

    updateStatsOverlay(overlay, {stats, isHost: false})

    expect(overlay.textContent).toContain('CLIENT')
})


test('updateStatsOverlay with missing stats uses dashes', () => {
    overlay = createStatsOverlay()

    updateStatsOverlay(overlay, {stats: {}, isHost: true})

    expect(overlay.textContent).toContain('RTT: -ms')
    expect(overlay.textContent).toContain('Jitter: -ms')
})


test('updateStatsOverlay with debug error', () => {
    overlay = createStatsOverlay()
    const stats = {smoothedRtt: 50}

    updateStatsOverlay(overlay, {stats, isHost: false, debugError: 0.123})

    expect(overlay.textContent).toContain('Err: 0.123')
})


test('updateStatsOverlay with interp delay', () => {
    overlay = createStatsOverlay()
    const stats = {smoothedRtt: 50}

    updateStatsOverlay(overlay, {stats, isHost: true, interpDelay: 75})

    expect(overlay.textContent).toContain('Delay: 75ms')
})


test('updateStatsOverlay with FPS and performance', () => {
    overlay = createStatsOverlay()
    const stats = {smoothedRtt: 50, averageFps: 60, performanceScore: 95}

    updateStatsOverlay(overlay, {stats, isHost: true})

    expect(overlay.textContent).toContain('FPS: 60')
    expect(overlay.textContent).toContain('Perf: 95')
})


test('updateStatsOverlay handles null element', () => {
    expect(() => updateStatsOverlay(null, {stats: {}})).not.toThrow()
})


test('createWaitingOverlay', () => {
    overlay = createWaitingOverlay()

    expect(overlay).toBeInstanceOf(HTMLElement)
    expect(overlay.tagName).toBe('DIV')
    expect(overlay.textContent).toBe('Waiting for host...')
    expect(overlay.style.display).toBe('none')
})


test('showWaitingOverlay', () => {
    overlay = createWaitingOverlay()

    showWaitingOverlay(overlay)

    expect(overlay.style.display).toBe('flex')
    expect(overlay.textContent).toBe('Waiting for host...')
})


test('hideWaitingOverlay', () => {
    overlay = createWaitingOverlay()
    showWaitingOverlay(overlay)

    hideWaitingOverlay(overlay)

    expect(overlay.style.display).toBe('none')
})


test('updateWaitingText', () => {
    overlay = createWaitingOverlay()

    updateWaitingText(overlay, 'Host disconnected')

    expect(overlay.textContent).toBe('Host disconnected')
})


test('showWaitingOverlay handles null', () => {
    expect(() => showWaitingOverlay(null)).not.toThrow()
})


test('hideWaitingOverlay handles null', () => {
    expect(() => hideWaitingOverlay(null)).not.toThrow()
})


test('updateWaitingText handles null', () => {
    expect(() => updateWaitingText(null, 'text')).not.toThrow()
})
