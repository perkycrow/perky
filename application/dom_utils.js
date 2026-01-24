import {toKebabCase} from '../core/utils.js'


const directAttrs = [
    'id',
    'href',
    'src',
    'alt',
    'title',
    'value',
    'type',
    'name',
    'placeholder',
    'min',
    'max',
    'step',
    'checked',
    'disabled',
    'readonly',
    'selected'
]

export function createElement (tag, options = {}) {
    const el = document.createElement(tag)
    applyElementOptions(el, options)
    return el
}


function applyElementOptions (el, options) {
    applyDirectAttributes(el, options)
    applyContent(el, options)

    if (options.style) {
        setStyle(el, options.style)
    }

    if (options.attrs) {
        setAttributes(el, options.attrs)
    }
}


function applyDirectAttributes (el, options) {
    for (const attr of directAttrs) {
        if (attr in options) {
            el[attr] = options[attr]
        }
    }

    if (options.class || options.className) {
        el.className = options.class || options.className
    }
}


function applyContent (el, options) {
    if (options.text) {
        el.textContent = options.text
    }

    if (options.html) {
        el.innerHTML = options.html
    }
}


export function setAttributes (element, attrs) {
    for (const [key, value] of Object.entries(attrs)) {
        const attrName = key.includes('-') ? key : toKebabCase(key)
        element.setAttribute(attrName, value)
    }
}


export function setStyle (element, styles) {
    if (typeof styles === 'string') {
        element.style.cssText = styles
    } else {
        for (const [key, value] of Object.entries(styles)) {
            element.style[key] = value
        }
    }
}


export function createStyleSheet (css) {
    const sheet = new CSSStyleSheet()
    if (sheet.replaceSync) {
        sheet.replaceSync(css)
    }
    return sheet
}


export function adoptStyleSheets (shadowRoot, ...sheets) {
    shadowRoot.adoptedStyleSheets = sheets.filter(Boolean)
}
