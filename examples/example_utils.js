import {Pane} from 'tweakpane'
import * as EssentialsPlugin from '@tweakpane/plugin-essentials'

/**
 * Creates a positioned control panel with common settings
 * @param {Object} options - Configuration options
 * @param {string} options.title - Panel title
 * @param {HTMLElement} options.container - Container element
 * @param {string} options.position - Position: 'top-left', 'top-right', 'bottom-left', 'bottom-right'
 * @param {string} options.width - Panel width (default: '250px')
 * @param {boolean} options.expanded - Whether panel is expanded (default: true)
 * @returns {Pane} The created Tweakpane instance
 */
export function createControlPanel ({title, container, position = 'top-right', width = '250px', expanded = true}) {
    const pane = new Pane({
        title,
        container,
        expanded
    })

    pane.registerPlugin(EssentialsPlugin)

    // Position the panel
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

/**
 * Adds FPS monitoring to a control panel
 * @param {Pane} pane - The Tweakpane instance
 * @param {Object} gameOrLoop - Game instance or GameLoop with 'on' method for 'render' events
 * @param {Object} options - Configuration options
 * @param {string} options.title - Folder title (default: 'Performance')
 * @param {boolean} options.expanded - Whether folder is expanded (default: true)
 * @param {number} options.resetInterval - Stats reset interval in ms (default: 5000)
 * @returns {Object} FPS monitoring object with graph and stats
 */
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

    // FPS tracking variables
    let frameCount = 0
    let fpsSum = 0
    let lastReset = performance.now()

    // Monitor FPS
    gameOrLoop.on('render', (frameProgress, fps) => {
        fpsGraph.begin()
        
        const currentFps = fps || 60
        fpsStats.current = currentFps
        
        // Update stats
        frameCount++
        fpsSum += currentFps
        fpsStats.average = fpsSum / frameCount
        fpsStats.min = Math.min(fpsStats.min, currentFps)
        fpsStats.max = Math.max(fpsStats.max, currentFps)
        
        // Reset stats at interval
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

/**
 * Adds a folder with buttons to a control panel
 * @param {Pane} pane - The Tweakpane instance
 * @param {string} title - Folder title
 * @param {Array} buttons - Array of button objects {title, action}
 * @param {Object} options - Configuration options
 * @param {boolean} options.expanded - Whether folder is expanded (default: true)
 * @returns {Object} The created folder
 */
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

/**
 * Quick helper to add a single button to a folder
 * @param {Object} folder - The folder to add the button to
 * @param {string} title - Button title
 * @param {Function} action - Button action
 * @returns {Object} The created button
 */
export function addButton (folder, title, action) {
    return folder.addButton({
        title
    }).on('click', action)
}

/**
 * Creates a simple control panel with common game controls
 * @param {Object} options - Configuration options
 * @param {string} options.title - Panel title
 * @param {HTMLElement} options.container - Container element
 * @param {Object} options.game - Game instance with start/pause/resume methods
 * @param {Object} options.logger - Logger instance for feedback
 * @param {string} options.position - Panel position (default: 'top-right')
 * @param {boolean} options.includeFps - Whether to include FPS monitoring (default: true)
 * @returns {Pane} The created control panel
 */
export function createGameControlPanel ({title, container, game, logger, position = 'top-right', includeFps = true}) {
    const pane = createControlPanel({
        title,
        container,
        position
    })

    // Add FPS monitoring if requested
    if (includeFps && game) {
        addFpsMonitoring(pane, game)
    }

    // Add basic game controls
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

/**
 * Adds a binding with common readonly display formatting
 * @param {Object} options - Configuration options
 * @param {Object} options.folder - The folder to add the binding to
 * @param {Object} options.object - The object to bind to
 * @param {string} options.property - The property to bind
 * @param {string} options.label - The label to display
 * @param {Function} options.formatter - Optional formatter function
 * @returns {Object} The created binding
 */
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

/**
 * Capitalizes the first letter and replaces camelCase with spaces
 * @param {string} str - The string to format
 * @returns {string} Formatted label
 */
function formatLabel (str) {
    return str
        .replace(/([a-z])([A-Z])/g, '$1 $2') // camelCase to spaces
        .replace(/^./, (char) => char.toUpperCase()) // capitalize first letter
}

/**
 * Adds a slider binding with common settings
 * @param {Object} options - Configuration options
 * @param {Object} options.folder - The folder to add the binding to
 * @param {Object} options.object - The object to bind to
 * @param {string} options.property - The property to bind
 * @param {string} options.label - The label to display (defaults to formatted property name)
 * @param {number} options.min - Minimum value
 * @param {number} options.max - Maximum value
 * @param {number} options.step - Step size (default: 0.01)
 * @param {Function} options.onChange - Optional change handler
 * @returns {Object} The created binding
 */
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

/**
 * Adds multiple slider bindings at once
 * @param {Object} folder - The folder to add bindings to
 * @param {Object} object - The object to bind to
 * @param {Array} sliders - Array of slider configs {property, min, max, step?, label?, onChange?}
 * @returns {Array} Array of created bindings
 */
export function addSliders (folder, object, sliders) {
    return sliders.map(config => addSliderBinding({
        folder,
        object,
        ...config
    }))
}

/**
 * Adds a toggle binding for enable/disable
 * @param {Object} folder - The folder to add the binding to
 * @param {Object} object - The object to bind to
 * @param {string} property - The property to bind (default: 'enabled')
 * @param {string} label - The label to display (default: formatted property)
 * @returns {Object} The created binding
 */
export function addToggle (folder, object, property = 'enabled', label) {
    return folder.addBinding(object, property, {
        label: label || formatLabel(property)
    })
}

/**
 * Common slider presets
 */
export const RANGES = {
    UNIT: {min: 0, max: 1, step: 0.01},           // 0-1
    PERCENT: {min: 0, max: 100, step: 1},         // 0-100
    ANGLE: {min: 0, max: Math.PI * 2, step: 0.1}, // 0-2π
    RGB: {min: 0, max: 2, step: 0.01},            // 0-2 for color channels
    BRIGHTNESS: {min: -0.5, max: 0.5, step: 0.01}, // brightness range
    CONTRAST: {min: 0.5, max: 2, step: 0.01}      // contrast range
}

/**
 * Adds a slider with a preset range
 * @param {Object} options - Configuration options
 * @param {Object} options.folder - The folder to add the binding to
 * @param {Object} options.object - The object to bind to
 * @param {string} options.property - The property to bind
 * @param {string} options.range - Preset range key from RANGES
 * @param {string} options.label - Optional custom label
 * @param {Function} options.onChange - Optional change handler
 * @returns {Object} The created binding
 */
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

/**
 * Creates a quick debug panel for development
 * @param {HTMLElement} container - Container element
 * @param {Object} debugObject - Object with debug properties
 * @param {string} position - Panel position (default: 'bottom-right')
 * @returns {Pane} The created debug panel
 */
export function createDebugPanel (container, debugObject, position = 'bottom-right') {
    const pane = createControlPanel({
        title: 'Debug',
        container,
        position,
        width: '200px',
        expanded: false
    })

    // Auto-add bindings for common debug properties
    const debugFolder = pane.addFolder({
        title: 'Debug Info',
        expanded: true
    })

    // Common debug properties
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