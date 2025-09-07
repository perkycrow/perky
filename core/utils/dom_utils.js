
export function documentReady (callback) {
    if (document && document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', callback)
    } else {
        callback()
    }
}
