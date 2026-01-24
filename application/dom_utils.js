import {toKebabCase} from '../core/utils.js'


export function createElement (tag, options = {}) {
    const el = document.createElement(tag)

    if (options.class || options.className) {
        el.className = options.class || options.className
    }
    if (options.id) {
        el.id = options.id
    }
    if (options.text) {
        el.textContent = options.text
    }
    if (options.html) {
        el.innerHTML = options.html
    }
    if (options.attrs) {
        setAttributes(el, options.attrs)
    }

    return el
}


export function setAttributes (element, attrs) {
    for (const [key, value] of Object.entries(attrs)) {
        const attrName = key.includes('-') ? key : toKebabCase(key)
        element.setAttribute(attrName, value)
    }
}


export function setStyles (element, styles) {
    for (const [key, value] of Object.entries(styles)) {
        element.style[key] = value
    }
}


export function createSheet (css) {
    const sheet = new CSSStyleSheet()
    if (sheet.replaceSync) {
        sheet.replaceSync(css)
    }
    return sheet
}


export function adoptStyleSheets (shadowRoot, ...sheets) {
    shadowRoot.adoptedStyleSheets = sheets.filter(Boolean)
}
