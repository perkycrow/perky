import {registerLogRenderer, renderLogItem} from './log_renderer_registry.js'
import {createElement} from '../../application/dom_utils.js'


const MAX_PREVIEW_ITEMS = 5


function formatString (str) {
    const truncated = str.length > 20 ? str.slice(0, 20) + '...' : str
    return `"${truncated}"`
}


function formatObject (obj) {
    if (Array.isArray(obj)) {
        return `Array(${obj.length})`
    }
    return obj.constructor?.name || 'Object'
}


function getItemLabel (item) {
    if (item === null) {
        return 'null'
    }

    if (item === undefined) {
        return 'undefined'
    }

    if (typeof item === 'string') {
        return formatString(item)
    }

    if (typeof item === 'number' || typeof item === 'boolean') {
        return String(item)
    }

    if (typeof item === 'object') {
        return formatObject(item)
    }

    return String(item)
}


function createPreview (arr) {
    const previewItems = arr.slice(0, MAX_PREVIEW_ITEMS)
    const parts = previewItems.map(getItemLabel)

    if (arr.length > MAX_PREVIEW_ITEMS) {
        parts.push(`... +${arr.length - MAX_PREVIEW_ITEMS} more`)
    }

    return `(${arr.length}) [${parts.join(', ')}]`
}


function renderExpandedContent (arr, container) {
    for (let i = 0; i < arr.length; i++) {
        const row = createElement('div', {class: 'log-array-row'})
        const indexEl = createElement('span', {class: 'log-array-index', text: i})
        const separator = createElement('span', {class: 'log-array-separator', text: ': '})
        const valueEl = createElement('span', {class: 'log-array-value'})

        const customRender = renderLogItem(arr[i])
        if (customRender) {
            valueEl.appendChild(customRender)
        } else {
            valueEl.textContent = getItemLabel(arr[i])
        }

        row.appendChild(indexEl)
        row.appendChild(separator)
        row.appendChild(valueEl)
        container.appendChild(row)
    }

    const lengthRow = createElement('div', {class: 'log-array-row log-array-length', text: `length: ${arr.length}`})
    container.appendChild(lengthRow)
}


const arrayLogRenderer = {
    match (item) {
        return Array.isArray(item)
    },

    render (arr) {
        const container = document.createElement('span')
        container.className = 'log-array'

        const toggle = document.createElement('span')
        toggle.className = 'log-array-toggle'
        toggle.textContent = '▶'

        const preview = document.createElement('span')
        preview.className = 'log-array-preview'
        preview.textContent = createPreview(arr)

        const expanded = document.createElement('div')
        expanded.className = 'log-array-expanded'
        expanded.style.display = 'none'

        let isExpanded = false
        let hasRenderedContent = false

        const header = document.createElement('span')
        header.className = 'log-array-header'
        header.style.cursor = 'pointer'
        header.appendChild(toggle)
        header.appendChild(preview)

        header.addEventListener('click', () => {
            isExpanded = !isExpanded

            if (isExpanded && !hasRenderedContent) {
                renderExpandedContent(arr, expanded)
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


registerLogRenderer(arrayLogRenderer)

export default arrayLogRenderer
