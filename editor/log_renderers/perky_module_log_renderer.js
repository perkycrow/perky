import {registerLogRenderer, renderLogItem} from './log_renderer_registry.js'


const IGNORED_KEYS = new Set([
    'options', 'host', 'children', 'childrenRegistry', 'tags',
    'started', 'disposed', 'installed', 'running'
])


function createCompactLabel (module, container) {
    const name = module.$name || module.constructor?.name || 'Module'
    const category = module.$category || ''
    const id = module.$id || ''

    const nameSpan = document.createElement('span')
    nameSpan.className = 'log-module-name'

    if (name === id) {
        nameSpan.textContent = name
    } else {
        nameSpan.textContent = `${name} #${id}`
    }

    container.appendChild(nameSpan)

    if (category && category !== name && category !== id) {
        const categorySpan = document.createElement('span')
        categorySpan.className = 'log-module-category'
        categorySpan.textContent = ` (${category})`
        container.appendChild(categorySpan)
    }
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


const MAX_STRING_LENGTH = 30


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
    return obj.constructor?.name || '{...}'
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


function createRow (className, keyText, valueContent) {
    const row = document.createElement('div')
    row.className = className

    const keyEl = document.createElement('span')
    keyEl.className = 'log-module-key'
    keyEl.textContent = keyText

    const separator = document.createElement('span')
    separator.className = 'log-module-separator'
    separator.textContent = ': '

    const valueEl = document.createElement('span')
    valueEl.className = 'log-module-value'

    if (typeof valueContent === 'string') {
        valueEl.textContent = valueContent
    } else if (valueContent instanceof Node) {
        valueEl.appendChild(valueContent)
    }

    row.appendChild(keyEl)
    row.appendChild(separator)
    row.appendChild(valueEl)

    return {row, valueEl}
}


function renderMetaSection (module) {
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
        const {row, valueEl} = createRow('log-module-row log-module-meta-row', label, String(value))
        valueEl.className = 'log-module-value log-module-meta-value'
        metaSection.appendChild(row)
    }

    return metaSection
}


function renderPropsSection (module, properties) {
    const propsSection = document.createElement('div')
    propsSection.className = 'log-module-props'

    for (const key of properties) {
        const customRender = renderLogItem(module[key])
        const content = customRender || formatValue(module[key])
        const {row, valueEl} = createRow('log-module-row', key, content)

        if (!customRender) {
            valueEl.textContent = content
        }

        propsSection.appendChild(row)
    }

    return propsSection
}


function renderMethodsSection (methods) {
    const methodsSection = document.createElement('div')
    methodsSection.className = 'log-module-methods'

    const {row, valueEl} = createRow('log-module-row log-module-methods-row', 'methods', '')

    for (let i = 0; i < methods.length; i++) {
        const methodSpan = document.createElement('span')
        methodSpan.className = 'log-module-method-name'
        methodSpan.textContent = methods[i]
        valueEl.appendChild(methodSpan)

        if (i < methods.length - 1) {
            valueEl.appendChild(document.createTextNode(', '))
        }
    }

    methodsSection.appendChild(row)
    return methodsSection
}


function separatePropertiesAndMethods (module) {
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

    return {methods, properties}
}


function renderExpandedContent (module, container) {
    container.appendChild(renderMetaSection(module))

    const {methods, properties} = separatePropertiesAndMethods(module)

    if (properties.length > 0) {
        container.appendChild(renderPropsSection(module, properties))
    }

    if (methods.length > 0) {
        container.appendChild(renderMethodsSection(methods))
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
        createCompactLabel(module, label)

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
