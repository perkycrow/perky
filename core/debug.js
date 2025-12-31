import logger from './logger.js'


const instances = new Map()
let enabled = false
let cleanupIntervalId = null


export function enableDebug () {
    if (enabled) {
        return
    }

    enabled = true
    logger.info('Debug mode enabled')

    if (!cleanupIntervalId) {
        cleanupIntervalId = setInterval(cleanupDeadReferences, 5000)
    }
}


export function disableDebug () {
    if (!enabled) {
        return
    }

    enabled = false
    logger.info('Debug mode disabled')

    if (cleanupIntervalId) {
        clearInterval(cleanupIntervalId)
        cleanupIntervalId = null
    }
}


export function isDebugEnabled () {
    return enabled
}


export function trackInstance (className, instance) {
    if (!enabled) {
        return
    }

    if (!instances.has(className)) {
        instances.set(className, new Set())
    }

    instances.get(className).add(new WeakRef(instance))
}


export function untrackInstance (className, instance) {
    if (!enabled) {
        return
    }

    const classInstances = instances.get(className)
    if (!classInstances) {
        return
    }

    for (const ref of classInstances) {
        if (ref.deref() === instance) {
            classInstances.delete(ref)
            break
        }
    }
}


function cleanupDeadReferences () {
    if (!enabled) {
        return
    }

    for (const [, refs] of instances.entries()) {
        for (const ref of refs) {
            if (ref.deref() === undefined) {
                refs.delete(ref)
            }
        }
    }
}


export function getInstanceCount (className) {
    if (!enabled) {
        return 0
    }

    cleanupDeadReferences()
    const classInstances = instances.get(className)
    return classInstances ? classInstances.size : 0
}


export function printDiagnostics () {
    if (!enabled) {
        logger.warn('Debug mode is disabled. Call enableDebug() first.')
        return
    }

    cleanupDeadReferences()

    console.group('🔍 Memory Diagnostics')
    for (const [className, refs] of instances.entries()) {
        console.log(`${className}: ${refs.size} instances`)
    }
    console.groupEnd()
}


export function clearInstances () {
    instances.clear()
}


export default {
    enableDebug,
    disableDebug,
    isDebugEnabled,
    trackInstance,
    untrackInstance,
    getInstanceCount,
    printDiagnostics,
    clearInstances
}
