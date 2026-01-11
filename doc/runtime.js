import logger from '../core/logger.js'
import {dedent} from './utils/dedent.js'


let currentBlocks = null
let currentSetup = null


export function doc (title, options, fn) {
    const opts = typeof options === 'function' ? {} : options
    const callback = typeof options === 'function' ? options : fn

    const docData = {
        title,
        options: opts,
        blocks: []
    }

    currentBlocks = docData.blocks
    currentSetup = null
    callback()
    currentBlocks = null
    currentSetup = null

    return docData
}


export function section (title, fn) {
    if (!currentBlocks) {
        throw new Error('section() must be called inside doc()')
    }

    const sectionData = {
        type: 'section',
        title,
        blocks: [],
        setup: null
    }

    const parentBlocks = currentBlocks
    const parentSetup = currentSetup

    currentBlocks = sectionData.blocks
    currentSetup = null
    fn()
    sectionData.setup = currentSetup

    currentBlocks = parentBlocks
    currentSetup = parentSetup

    currentBlocks.push(sectionData)
}


export function setup (fn) {
    if (!currentBlocks) {
        throw new Error('setup() must be called inside doc() or section()')
    }

    currentSetup = {
        source: extractFunctionBody(fn),
        fn
    }
}


export function text (content) {
    if (!currentBlocks) {
        throw new Error('text() must be called inside doc()')
    }

    currentBlocks.push({
        type: 'text',
        content: dedent(content)
    })
}


export function code (title, fn) {
    if (!currentBlocks) {
        throw new Error('code() must be called inside doc()')
    }

    currentBlocks.push({
        type: 'code',
        title,
        source: extractFunctionBody(fn)
    })
}


export function action (title, fn) {
    if (!currentBlocks) {
        throw new Error('action() must be called inside doc()')
    }

    currentBlocks.push({
        type: 'action',
        title,
        source: extractFunctionBody(fn),
        fn
    })
}


export function see (name, options = {}) {
    if (!currentBlocks) {
        throw new Error('see() must be called inside doc()')
    }

    currentBlocks.push({
        type: 'see',
        name,
        pageType: options.type || 'doc',
        section: options.section || null,
        category: options.category || null
    })
}


export function disclaimer (content) {
    if (!currentBlocks) {
        throw new Error('disclaimer() must be called inside doc()')
    }

    currentBlocks.push({
        type: 'disclaimer',
        content: dedent(content)
    })
}


const CONTAINER_PRESETS = {
    interactive: {
        tabIndex: 0,
        style: {
            outline: 'none',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#1a1a2e',
            color: '#fff',
            fontFamily: 'monospace',
            userSelect: 'none'
        }
    },
    'interactive-alt': {
        tabIndex: 0,
        style: {
            outline: 'none',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#16213e',
            color: '#fff',
            fontFamily: 'monospace',
            userSelect: 'none'
        }
    },
    inspector: {
        style: {
            padding: '12px',
            background: '#1a1a1e',
            overflow: 'auto'
        }
    },
    centered: {
        style: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#1a1a1e'
        }
    }
}


export function container (options, fn) {
    if (!currentBlocks) {
        throw new Error('container() must be called inside doc()')
    }

    const opts = typeof options === 'function' ? {} : options
    const callback = typeof options === 'function' ? options : fn

    currentBlocks.push({
        type: 'container',
        width: opts.width || null,
        height: opts.height || 300,
        title: opts.title || null,
        preset: opts.preset || null,
        scrollable: opts.scrollable || false,
        source: extractFunctionBody(callback),
        fn: callback
    })
}


export function applyContainerPreset (element, presetName) {
    const preset = CONTAINER_PRESETS[presetName]
    if (!preset) {
        return
    }

    if (preset.tabIndex !== undefined) {
        element.tabIndex = preset.tabIndex
    }

    if (preset.style) {
        Object.assign(element.style, preset.style)
    }
}


function extractFunctionBody (fn) {
    const source = fn.toString()

    let body = null

    const arrowMatch = source.match(/^\s*\(?[^)]*\)?\s*=>\s*\{([\s\S]*)\}\s*$/)
    if (arrowMatch) {
        body = arrowMatch[1]
    }

    if (!body) {
        const functionMatch = source.match(/^function\s*\w*\s*\([^)]*\)\s*\{([\s\S]*)\}\s*$/)
        if (functionMatch) {
            body = functionMatch[1]
        }
    }

    if (!body) {
        const arrowExpressionMatch = source.match(/^\s*\(?[^)]*\)?\s*=>\s*(.+)$/)
        if (arrowExpressionMatch) {
            return arrowExpressionMatch[1].trim()
        }
    }

    if (!body) {
        return source
    }

    body = body.split('\n')
        .filter(line => !line.trim().startsWith('ctx.setApp('))
        .join('\n')

    return dedent(body)
}


export function addSpacerIfNeeded () {
    const hasVisibleLogs = logger.history.some(e => e.event === 'log')
    const lastEntry = logger.history[logger.history.length - 1]
    const lastIsSpacer = lastEntry?.event === 'spacer'

    if (hasVisibleLogs && !lastIsSpacer) {
        logger.spacer()
    }
}


export async function executeAction (block, sectionSetup = null) {
    try {
        addSpacerIfNeeded()
        const ctx = {}

        if (sectionSetup?.fn) {
            await sectionSetup.fn(ctx)
        }
        await block.fn(ctx)
    } catch (error) {
        logger.error('Action error:', error.message)
    }
}


export async function executeContainer (block, containerEl, sectionSetup = null) {
    addSpacerIfNeeded()

    const prevApp = containerEl._currentApp
    if (prevApp?.dispose) {
        prevApp.dispose()
    }
    containerEl.innerHTML = ''

    if (block.preset) {
        applyContainerPreset(containerEl, block.preset)
    }

    if (block.scrollable) {
        containerEl.style.overflow = 'auto'
    }

    try {
        let actionsBar = null
        let slidersBar = null
        let infoBar = null

        const ctx = {
            container: containerEl,
            setApp: (app, ...args) => {
                containerEl._currentApp = app
                const [scene] = args
                if (scene && app.autoFitEnabled && app.render) {
                    app.on('resize', () => app.render(scene))
                }
            },
            action: (label, callback) => {
                if (!actionsBar) {
                    actionsBar = document.createElement('div')
                    actionsBar.className = 'doc-actions-bar'
                    containerEl.appendChild(actionsBar)
                }

                const isFirst = actionsBar.children.length === 0
                const btn = document.createElement('button')
                btn.className = 'doc-actions-btn'
                if (isFirst) {
                    btn.classList.add('doc-actions-btn--active')
                }
                btn.textContent = label
                btn.addEventListener('click', () => {
                    actionsBar.querySelectorAll('.doc-actions-btn').forEach(b => b.classList.remove('doc-actions-btn--active'))
                    btn.classList.add('doc-actions-btn--active')
                    callback()
                })
                actionsBar.appendChild(btn)

                if (isFirst) {
                    callback()
                }
            },
            slider: (label, opts, onChange) => {
                if (!slidersBar) {
                    slidersBar = document.createElement('div')
                    slidersBar.className = 'doc-sliders-bar'
                    containerEl.appendChild(slidersBar)
                }

                const wrapper = document.createElement('div')
                wrapper.className = 'doc-slider-wrapper'

                const labelEl = document.createElement('span')
                labelEl.className = 'doc-slider-label'
                labelEl.textContent = label

                const valueEl = document.createElement('span')
                valueEl.className = 'doc-slider-value'
                valueEl.textContent = opts.default ?? opts.min

                const input = document.createElement('input')
                input.type = 'range'
                input.className = 'doc-slider'
                input.min = opts.min
                input.max = opts.max
                input.step = opts.step ?? (opts.max - opts.min) / 100
                input.value = opts.default ?? opts.min

                input.addEventListener('input', () => {
                    const value = parseFloat(input.value)
                    valueEl.textContent = Number.isInteger(value) ? value : value.toFixed(2)
                    onChange(value)
                })

                wrapper.appendChild(labelEl)
                wrapper.appendChild(input)
                wrapper.appendChild(valueEl)
                slidersBar.appendChild(wrapper)

                onChange(parseFloat(input.value))
            },
            info: (formatter) => {
                if (!infoBar) {
                    infoBar = document.createElement('div')
                    infoBar.className = 'doc-info-bar'
                    containerEl.appendChild(infoBar)
                }

                const el = document.createElement('div')
                el.className = 'doc-info'
                infoBar.appendChild(el)
                const update = (...args) => {
                    el.textContent = formatter(...args)
                }
                update()
                return update
            },
            hint: (message) => {
                const el = document.createElement('div')
                el.className = 'doc-hint'
                el.textContent = message
                containerEl.appendChild(el)
            },
            display: (formatter) => {
                const el = document.createElement('div')
                el.className = 'doc-display'
                containerEl.appendChild(el)
                const update = (...args) => {
                    const result = formatter(...args)
                    if (result instanceof HTMLElement) {
                        el.innerHTML = ''
                        el.appendChild(result)
                    } else if (Array.isArray(result)) {
                        el.innerHTML = result.map(item => `<span class="doc-display-tag">${item}</span>`).join('')
                    } else {
                        el.innerHTML = result
                    }
                }
                update()
                return update
            },
            box: (opts = {}) => {
                const size = opts.size || 40
                const color = opts.color || '#4a9eff'
                const el = document.createElement('div')
                el.style.cssText = `width:${size}px;height:${size}px;background:${color};position:absolute;border-radius:4px;left:50%;top:50%;transform:translate(-50%,-50%)`
                containerEl.appendChild(el)
                return el
            },
            marker: (x = 0, y = 0, opts = {}) => {
                const size = opts.size || 20
                const color = opts.color || '#4a9eff'
                const el = document.createElement('div')
                el.style.cssText = `width:${size}px;height:${size}px;background:${color};position:absolute;border-radius:50%;transform:translate(-50%,-50%);left:${x}px;top:${y}px`
                containerEl.appendChild(el)
                return el
            },
            column: (opts = {}) => {
                const gap = opts.gap || 4
                const el = document.createElement('div')
                el.style.cssText = `display:flex;flex-direction:column;align-items:center;gap:${gap}px;`
                if (opts.parent) {
                    opts.parent.appendChild(el)
                } else {
                    containerEl.appendChild(el)
                }
                return el
            },
            row: (opts = {}) => {
                const gap = opts.gap || 8
                const el = document.createElement('div')
                el.style.cssText = `display:flex;flex-direction:row;align-items:center;gap:${gap}px;flex-wrap:wrap;justify-content:center;`
                if (opts.parent) {
                    opts.parent.appendChild(el)
                } else {
                    containerEl.appendChild(el)
                }
                return el
            },
            label: (content, opts = {}) => {
                const el = document.createElement('div')
                el.style.cssText = 'color:#666;font-family:monospace;font-size:11px;'
                el.textContent = content
                if (opts.parent) {
                    opts.parent.appendChild(el)
                } else {
                    containerEl.appendChild(el)
                }
                return el
            },
            checkerBoard: (opts = {}) => {
                const size = opts.size || 8
                const color1 = opts.color1 || '#222'
                const color2 = opts.color2 || '#1a1a1a'
                const el = document.createElement('div')
                el.style.cssText = `background:repeating-conic-gradient(${color1} 0% 25%, ${color2} 0% 50%) 50% / ${size * 2}px ${size * 2}px;border:1px solid #333;overflow:hidden;`
                if (opts.width) {
                    el.style.width = opts.width + 'px'
                }
                if (opts.height) {
                    el.style.height = opts.height + 'px'
                }
                if (opts.parent) {
                    opts.parent.appendChild(el)
                } else {
                    containerEl.appendChild(el)
                }
                return el
            },
            canvas: (source, opts = {}) => {
                const wrapper = document.createElement('div')
                const size = opts.checkerSize || 8
                wrapper.style.cssText = `background:repeating-conic-gradient(#222 0% 25%, #1a1a1a 0% 50%) 50% / ${size * 2}px ${size * 2}px;border:1px solid #333;display:inline-block;`
                if (opts.parent) {
                    opts.parent.appendChild(wrapper)
                } else {
                    containerEl.appendChild(wrapper)
                }

                const displayCanvas = document.createElement('canvas')
                displayCanvas.style.cssText = 'display:block;'
                if (opts.maxWidth) {
                    displayCanvas.style.maxWidth = opts.maxWidth + 'px'
                    displayCanvas.style.height = 'auto'
                }
                wrapper.appendChild(displayCanvas)

                const update = (src) => {
                    const canvas = src || source
                    displayCanvas.width = canvas.width
                    displayCanvas.height = canvas.height
                    const dctx = displayCanvas.getContext('2d')
                    dctx.clearRect(0, 0, canvas.width, canvas.height)
                    dctx.drawImage(canvas, 0, 0)
                }

                if (source) {
                    update(source)
                }

                return {element: wrapper, canvas: displayCanvas, update}
            }
        }

        if (sectionSetup?.fn) {
            await sectionSetup.fn(ctx)
        }
        await block.fn(ctx)

        if (containerEl.tabIndex >= 0) {
            containerEl.focus()
        }
    } catch (error) {
        logger.error('Container error:', error.message)
    }
}


export function renderAction (block, sectionSetup = null, extractedSource = null) {
    const wrapper = document.createElement('div')
    wrapper.className = 'doc-action-block'

    const codeEl = document.createElement('perky-code')
    codeEl.setAttribute('title', block.title)
    codeEl.code = extractedSource || block.source
    wrapper.appendChild(codeEl)

    const button = document.createElement('button')
    button.className = 'doc-action-btn'
    button.innerHTML = `
        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z"/>
        </svg>
        Run
    `
    button.addEventListener('click', () => executeAction(block, sectionSetup))
    wrapper.appendChild(button)

    return wrapper
}


export {logger}
