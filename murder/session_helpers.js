export function computeAdaptiveDelay (stats, snapshotInterval) {
    const halfRtt = (stats.smoothedRtt ?? 0) / 2
    const jitter = stats.jitter ?? 0
    const ideal = snapshotInterval * 1000 + halfRtt + jitter * 2

    return Math.max(30, Math.min(200, ideal))
}


export function resolveServerHost () {
    const hostname = window.location.hostname
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'localhost:3000'
    }
    return 'murder.perkycrow.com'
}
