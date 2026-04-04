import {createElement} from '../application/dom_utils.js'


export function createStatsOverlay () {
    const el = createElement('div', {
        style: 'position:fixed;top:8px;left:8px;color:#0f0;font:12px monospace;background:rgba(0,0,0,0.6);padding:6px 10px;border-radius:4px;z-index:9999;pointer-events:none'
    })
    document.body.appendChild(el)
    return el
}


export function updateStatsOverlay (el, options) {
    if (!el) {
        return
    }

    el.textContent = formatStats(options)
}


function formatStat (value) {
    return value ?? '-'
}


function formatStats (options) {
    const stats = options.stats ?? options
    const isHost = options.isHost ?? false
    const debugError = options.debugError
    const interpDelay = options.interpDelay

    const role = isHost ? 'HOST' : 'CLIENT'
    const parts = [
        role,
        `RTT: ${formatStat(stats.smoothedRtt)}ms`,
        `Jitter: ${formatStat(stats.jitter)}ms`,
        `Conn: ${formatStat(stats.connectionScore)}`
    ]

    if (stats.averageFps !== undefined) {
        parts.push(`FPS: ${formatStat(stats.averageFps)}`)
    }

    if (stats.performanceScore !== undefined) {
        parts.push(`Perf: ${formatStat(stats.performanceScore)}`)
    }

    if (!isHost && debugError > 0) {
        parts.push(`Err: ${debugError.toFixed(3)}`)
    }

    if (interpDelay !== undefined) {
        parts.push(`Delay: ${Math.round(interpDelay)}ms`)
    }

    return parts.join(' | ')
}


export function createWaitingOverlay () {
    const el = createElement('div', {
        style: 'position:fixed;inset:0;display:none;align-items:center;justify-content:center;background:rgba(0,0,0,0.7);z-index:10000;font:24px monospace;color:#fff',
        text: 'Waiting for host...'
    })
    document.body.appendChild(el)
    return el
}


export function showWaitingOverlay (el) {
    if (el) {
        el.style.display = 'flex'
        el.textContent = 'Waiting for host...'
    }
}


export function hideWaitingOverlay (el) {
    if (el) {
        el.style.display = 'none'
    }
}


export function updateWaitingText (el, text) {
    if (el) {
        el.textContent = text
    }
}
