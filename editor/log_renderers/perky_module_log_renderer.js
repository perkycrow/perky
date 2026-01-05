import {registerLogRenderer, renderLogItem} from './log_renderer_registry.js'


const IGNORED_KEYS = new Set([
    'options', 'host', 'children', 'childrenRegistry', 'tags',
    'started', 'disposed', 'installed', 'running'
])


function createCompactLabel (module) {
    const category = module.$category || ''
    const name = module.$name || module.constructor?.name || 'Module'
    const id = module.$id || ''

    if (category === name || category === id) {
        return `${category} #${id}`
    }

    return `${category} ${name} #${id}`
}


function getPropertyKeys (module) {
    const keys = []

    for (const key of Object.keys(module)) {
        if (!IGNORED_KEYS.has(key) && !key.startsWith('_')) {
            keys.push(key)
        }
    }

    return keys
}


function formatValue (value) {
    if (value === null) {
        return 'null'
    }

    if (value === undefined) {
        return 'undefined'
    }

    if (typeof value === 'string') {
        return `"${value.length > 30 ? value.slice(0, 30) + '...' : value}"`
    }

    if (typeof value === 'number' || typeof value === 'boolean') {
        return String(value)
    }

    if (typeof value === 'function') {
        return 'f()'
    }

    if (Array.isArray(value)) {
        return `Array(${value.length})`
    }

    if (typeof value === 'object') {
        const name = value.constructor?.name
        return name || '{...}'
    }

    return String(value)
}


function renderExpandedContent (module, container) {
    const metaSection = document.createElement('div')
    metaSection.className = 'log-module-meta'

    const metaItems = [
        {label: '$id', value: module.$id},
        {label: '$name', value: module.$name},
        {label: '$category', value: module.$category},
        {label: '$status', value: module.$status},
        {label: '$tags', value: module.$tags?.join(', ') || '(none)'},
        {label: 'children', value: module.children?.length || 0}
    ]

    for (const {label, value} of metaItems) {
        const row = document.createElement('div')
        row.className = 'log-module-row log-module-meta-row'

        const keyEl = document.createElement('span')
        keyEl.className = 'log-module-key'
        keyEl.textContent = label

        const separator = document.createElement('span')
        separator.className = 'log-module-separator'
        separator.textContent = ': '

        const valueEl = document.createElement('span')
        valueEl.className = 'log-module-value log-module-meta-value'
        valueEl.textContent = value

        row.appendChild(keyEl)
        row.appendChild(separator)
        row.appendChild(valueEl)
        metaSection.appendChild(row)
    }

    container.appendChild(metaSection)

    const propsKeys = getPropertyKeys(module)
    const methods = []
    const properties = []

    for (const key of propsKeys) {
        if (typeof module[key] === 'function') {
            methods.push(key)
        } else {
            properties.push(key)
        }
    }

    if (properties.length > 0) {
        const propsSection = document.createElement('div')
        propsSection.className = 'log-module-props'

        for (const key of properties) {
            const row = document.createElement('div')
            row.className = 'log-module-row'

            const keyEl = document.createElement('span')
            keyEl.className = 'log-module-key'
            keyEl.textContent = key

            const separator = document.createElement('span')
            separator.className = 'log-module-separator'
            separator.textContent = ': '

            const valueEl = document.createElement('span')
            valueEl.className = 'log-module-value'

            const customRender = renderLogItem(module[key])
            if (customRender) {
                valueEl.appendChild(customRender)
            } else {
                valueEl.textContent = formatValue(module[key])
            }

            row.appendChild(keyEl)
            row.appendChild(separator)
            row.appendChild(valueEl)
            propsSection.appendChild(row)
        }

        container.appendChild(propsSection)
    }

    if (methods.length > 0) {
        const methodsSection = document.createElement('div')
        methodsSection.className = 'log-module-methods'

        const row = document.createElement('div')
        row.className = 'log-module-row log-module-methods-row'

        const keyEl = document.createElement('span')
        keyEl.className = 'log-module-key'
        keyEl.textContent = 'methods'

        const separator = document.createElement('span')
        separator.className = 'log-module-separator'
        separator.textContent = ': '

        const valueEl = document.createElement('span')
        valueEl.className = 'log-module-value'

        for (let i = 0; i < methods.length; i++) {
            const methodSpan = document.createElement('span')
            methodSpan.className = 'log-module-method-name'
            methodSpan.textContent = methods[i]
            valueEl.appendChild(methodSpan)

            if (i < methods.length - 1) {
                valueEl.appendChild(document.createTextNode(', '))
            }
        }

        row.appendChild(keyEl)
        row.appendChild(separator)
        row.appendChild(valueEl)
        methodsSection.appendChild(row)

        container.appendChild(methodsSection)
    }
}


const perkyModuleLogRenderer = {
    match (item) {
        return item !== null &&
            typeof item === 'object' &&
            typeof item.$id !== 'undefined' &&
            typeof item.$name !== 'undefined' &&
            typeof item.$category !== 'undefined'
    },

    render (module) {
        const container = document.createElement('span')
        container.className = 'log-module'

        const toggle = document.createElement('span')
        toggle.className = 'log-module-toggle'
        toggle.textContent = '▶'

        const label = document.createElement('span')
        label.className = 'log-module-label'
        label.textContent = createCompactLabel(module)

        const expanded = document.createElement('div')
        expanded.className = 'log-module-expanded'
        expanded.style.display = 'none'

        let isExpanded = false
        let hasRenderedContent = false

        const header = document.createElement('span')
        header.className = 'log-module-header'
        header.style.cursor = 'pointer'
        header.appendChild(toggle)
        header.appendChild(label)

        header.addEventListener('click', () => {
            isExpanded = !isExpanded

            if (isExpanded && !hasRenderedContent) {
                renderExpandedContent(module, expanded)
                hasRenderedContent = true
            }

            toggle.textContent = isExpanded ? '▼' : '▶'
            expanded.style.display = isExpanded ? 'block' : 'none'
        })

        container.appendChild(header)
        container.appendChild(expanded)

        return container
    }
}


registerLogRenderer(perkyModuleLogRenderer)

export default perkyModuleLogRenderer
