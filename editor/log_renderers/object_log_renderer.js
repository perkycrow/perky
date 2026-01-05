import {registerLogRenderer, renderLogItem} from './log_renderer_registry.js'


const MAX_PREVIEW_KEYS = 5
const MAX_STRING_LENGTH = 50


function formatString (str) {
    const truncated = str.length > MAX_STRING_LENGTH
        ? str.slice(0, MAX_STRING_LENGTH) + '...'
        : str
    return `"${truncated}"`
}


function formatObject (obj) {
    if (Array.isArray(obj)) {
        return `Array(${obj.length})`
    }
    const name = obj.constructor?.name
    return name && name !== 'Object' ? name : '{...}'
}


function formatValue (value) {
    if (value === null) {
        return 'null'
    }

    if (value === undefined) {
        return 'undefined'
    }

    if (typeof value === 'string') {
        return formatString(value)
    }

    if (typeof value === 'number' || typeof value === 'boolean') {
        return String(value)
    }

    if (typeof value === 'function') {
        return 'f()'
    }

    if (typeof value === 'object') {
        return formatObject(value)
    }

    return String(value)
}


function createPreview (obj) {
    const keys = Object.keys(obj)
    const previewKeys = keys.slice(0, MAX_PREVIEW_KEYS)

    const parts = previewKeys.map(key => `${key}: ${formatValue(obj[key])}`)

    if (keys.length > MAX_PREVIEW_KEYS) {
        parts.push('...')
    }

    return `{${parts.join(', ')}}`
}


function renderExpandedContent (obj, container) {
    const keys = Object.keys(obj)
    const methods = []
    const properties = []

    for (const key of keys) {
        if (typeof obj[key] === 'function') {
            methods.push(key)
        } else {
            properties.push(key)
        }
    }

    for (const key of properties) {
        const row = document.createElement('div')
        row.className = 'log-object-row'

        const keyEl = document.createElement('span')
        keyEl.className = 'log-object-key'
        keyEl.textContent = key

        const separator = document.createElement('span')
        separator.className = 'log-object-separator'
        separator.textContent = ': '

        const valueEl = document.createElement('span')
        valueEl.className = 'log-object-value'

        const customRender = renderLogItem(obj[key])
        if (customRender) {
            valueEl.appendChild(customRender)
        } else {
            valueEl.textContent = formatValue(obj[key])
        }

        row.appendChild(keyEl)
        row.appendChild(separator)
        row.appendChild(valueEl)
        container.appendChild(row)
    }

    if (methods.length > 0) {
        const row = document.createElement('div')
        row.className = 'log-object-row log-object-methods-row'

        const keyEl = document.createElement('span')
        keyEl.className = 'log-object-key'
        keyEl.textContent = 'methods'

        const separator = document.createElement('span')
        separator.className = 'log-object-separator'
        separator.textContent = ': '

        const valueEl = document.createElement('span')
        valueEl.className = 'log-object-value log-object-methods'

        for (let i = 0; i < methods.length; i++) {
            const methodSpan = document.createElement('span')
            methodSpan.className = 'log-object-method-name'
            methodSpan.textContent = methods[i]
            valueEl.appendChild(methodSpan)

            if (i < methods.length - 1) {
                valueEl.appendChild(document.createTextNode(', '))
            }
        }

        row.appendChild(keyEl)
        row.appendChild(separator)
        row.appendChild(valueEl)
        container.appendChild(row)
    }
}


const objectLogRenderer = {
    match (item) {
        return item !== null &&
            typeof item === 'object' &&
            !Array.isArray(item) &&
            item.constructor?.name === 'Object'
    },

    render (obj) {
        const container = document.createElement('span')
        container.className = 'log-object'

        const toggle = document.createElement('span')
        toggle.className = 'log-object-toggle'
        toggle.textContent = '▶'

        const preview = document.createElement('span')
        preview.className = 'log-object-preview'
        preview.textContent = createPreview(obj)

        const expanded = document.createElement('div')
        expanded.className = 'log-object-expanded'
        expanded.style.display = 'none'

        let isExpanded = false
        let hasRenderedContent = false

        const header = document.createElement('span')
        header.className = 'log-object-header'
        header.style.cursor = 'pointer'
        header.appendChild(toggle)
        header.appendChild(preview)

        header.addEventListener('click', () => {
            isExpanded = !isExpanded

            if (isExpanded && !hasRenderedContent) {
                renderExpandedContent(obj, expanded)
                hasRenderedContent = true
            }

            toggle.textContent = isExpanded ? '▼' : '▶'
            expanded.style.display = isExpanded ? 'block' : 'none'
            preview.style.display = isExpanded ? 'none' : 'inline'
        })

        container.appendChild(header)
        container.appendChild(expanded)

        return container
    }
}


registerLogRenderer(objectLogRenderer)

export default objectLogRenderer
