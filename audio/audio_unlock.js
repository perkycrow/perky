const unlockEvents = ['click', 'touchstart', 'keydown']

let unlocked = false
let pendingCallbacks = []


function handleUnlock () {
    if (unlocked) {
        return
    }

    unlocked = true

    for (const callback of pendingCallbacks) {
        callback()
    }

    pendingCallbacks = []
    cleanup()
}


function cleanup () {
    for (const event of unlockEvents) {
        document.removeEventListener(event, handleUnlock, true)
    }
    window.removeEventListener('gamepadconnected', handleUnlock)
}


for (const event of unlockEvents) {
    document.addEventListener(event, handleUnlock, true)
}

window.addEventListener('gamepadconnected', handleUnlock)


export function onAudioUnlock (callback) {
    if (unlocked) {
        callback()
    } else {
        pendingCallbacks.push(callback)
    }
}


export function isAudioUnlocked () {
    return unlocked
}
