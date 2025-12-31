import {Pane} from 'tweakpane'
import * as EssentialsPlugin from '@tweakpane/plugin-essentials'


export function createControlPanel ({title, container, position = 'top-right', width = '250px', expanded = true}) {
    const pane = new Pane({
        title,
        container,
        expanded
    })

    pane.registerPlugin(EssentialsPlugin)


    const positions = {
        'top-left': {top: '10px', left: '10px'},
        'top-right': {top: '10px', right: '10px'},
        'bottom-left': {bottom: '10px', left: '10px'},
        'bottom-right': {bottom: '10px', right: '10px'}
    }

    const pos = positions[position] || positions['top-right']

    Object.assign(pane.element.style, {
        position: 'absolute',
        zIndex: '1000',
        width,
        ...pos
    })

    return pane
}


export function addFpsMonitoring (pane, gameOrLoop, {title = 'Performance', expanded = true, resetInterval = 5000} = {}) {
    const fpsFolder = pane.addFolder({
        title,
        expanded
    })

    const fpsGraph = fpsFolder.addBlade({
        view: 'fpsgraph',
        label: 'FPS',
        rows: 2
    })

    const fpsStats = {
        current: 0,
        average: 0,
        min: 999,
        max: 0
    }

    fpsFolder.addBinding(fpsStats, 'current', {
        label: 'Current',
        readonly: true,
        format: (v) => v.toFixed(0)
    })

    fpsFolder.addBinding(fpsStats, 'average', {
        label: 'Average',
        readonly: true,
        format: (v) => v.toFixed(1)
    })

    fpsFolder.addBinding(fpsStats, 'min', {
        label: 'Min',
        readonly: true,
        format: (v) => v.toFixed(0)
    })

    fpsFolder.addBinding(fpsStats, 'max', {
        label: 'Max',
        readonly: true,
        format: (v) => v.toFixed(0)
    })


    let frameCount = 0
    let fpsSum = 0
    let lastReset = performance.now()


    gameOrLoop.on('render', (frameProgress, fps) => {
        fpsGraph.begin()

        const currentFps = fps || 60
        fpsStats.current = currentFps


        frameCount++
        fpsSum += currentFps
        fpsStats.average = fpsSum / frameCount
        fpsStats.min = Math.min(fpsStats.min, currentFps)
        fpsStats.max = Math.max(fpsStats.max, currentFps)


        if (performance.now() - lastReset > resetInterval) {
            frameCount = 0
            fpsSum = 0
            fpsStats.min = 999
            fpsStats.max = 0
            lastReset = performance.now()
        }

        fpsGraph.end()
    })

    return {
        folder: fpsFolder,
        graph: fpsGraph,
        stats: fpsStats
    }
}


export function addButtonFolder (pane, title, buttons, {expanded = true} = {}) {
    const folder = pane.addFolder({
        title,
        expanded
    })

    buttons.forEach(({title: buttonTitle, action}) => {
        folder.addButton({
            title: buttonTitle
        }).on('click', action)
    })

    return folder
}


export function addButton (folder, title, action) {
    return folder.addButton({
        title
    }).on('click', action)
}


export function createGameControlPanel ({title, container, game, logger, position = 'top-right', includeFps = true, expanded}) {
    const pane = createControlPanel({
        title,
        container,
        position,
        expanded: expanded ?? false
    })


    if (includeFps && game) {
        addFpsMonitoring(pane, game)
    }


    if (game) {
        addButtonFolder(pane, 'Game Controls', [
            {
                title: 'Start Game',
                action: () => {
                    if (game.started) {
                        if (logger) {
                            logger.warn('Game already started')
                        }
                    } else {
                        game.start()
                        if (logger) {
                            logger.success('Game started')
                        }
                    }
                }
            },
            {
                title: 'Pause/Resume',
                action: () => {
                    if (game.paused) {
                        game.resume()
                        if (logger) {
                            logger.info('Game resumed')
                        }
                    } else {
                        game.pause()
                        if (logger) {
                            logger.info('Game paused')
                        }
                    }
                }
            }
        ])
    }

    return pane
}


export function addReadonlyBinding ({folder, object, property, label, formatter}) {
    const options = {
        label,
        readonly: true
    }

    if (formatter) {
        options.format = formatter
    }

    return folder.addBinding(object, property, options)
}


function formatLabel (str) {
    return str
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .replace(/^./, (char) => char.toUpperCase())
}


export function addSliderBinding ({folder, object, property, label, min, max, step = 0.01, onChange}) {
    const binding = folder.addBinding(object, property, {
        label: label || formatLabel(property),
        min,
        max,
        step
    })

    if (onChange) {
        binding.on('change', onChange)
    }

    return binding
}


export function addSliders (folder, object, sliders) {
    return sliders.map(config => addSliderBinding({
        folder,
        object,
        ...config
    }))
}


export function addToggle (folder, object, property = 'enabled', label) {
    return folder.addBinding(object, property, {
        label: label || formatLabel(property)
    })
}


export const RANGES = {
    UNIT: {min: 0, max: 1, step: 0.01},
    PERCENT: {min: 0, max: 100, step: 1},
    ANGLE: {min: 0, max: Math.PI * 2, step: 0.1},
    RGB: {min: 0, max: 2, step: 0.01},
    BRIGHTNESS: {min: -0.5, max: 0.5, step: 0.01},
    CONTRAST: {min: 0.5, max: 2, step: 0.01}
}


export function addSliderWithRange ({folder, object, property, range, label, onChange}) {
    const preset = RANGES[range]
    if (!preset) {
        throw new Error(`Unknown range preset: ${range}`)
    }

    return addSliderBinding({
        folder,
        object,
        property,
        label,
        onChange,
        ...preset
    })
}


export function createDebugPanel (container, debugObject, position = 'bottom-right') {
    const pane = createControlPanel({
        title: 'Debug',
        container,
        position,
        width: '200px',
        expanded: false
    })


    const debugFolder = pane.addFolder({
        title: 'Debug Info',
        expanded: true
    })


    const commonProps = ['x', 'y', 'z', 'rotation', 'scale', 'speed', 'health', 'score', 'level']

    commonProps.forEach(prop => {
        if (debugObject && typeof debugObject[prop] !== 'undefined') {
            debugFolder.addBinding(debugObject, prop, {
                readonly: true,
                format: (v) => {
                    return typeof v === 'number' ? v.toFixed(2) : v
                }
            })
        }
    })

    return pane
}


export function createExampleContainer () {
    const container = document.querySelector('.example-content')
    const canvas = document.createElement('canvas')

    canvas.style.border = '2px solid #333'
    canvas.style.backgroundColor = 'white'
    canvas.style.display = 'block'
    canvas.style.margin = '0 auto'
    canvas.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)'

    container.appendChild(canvas)

    return {container, canvas}
}
