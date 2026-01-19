import {adoptStyles, createSheet, controlsSheet} from './styles/index.js'


/**
 * Setup styles for an input component using the shared styles system
 *
 * @param {ShadowRoot} shadowRoot - The shadow root to style
 * @param {string} componentCSS - Component-specific CSS
 * @returns {CSSStyleSheet} The component stylesheet (for reference if needed)
 */
export function setupInputStyles (shadowRoot, componentCSS = '') {
    const componentSheet = componentCSS ? createSheet(componentCSS) : null
    if (componentSheet) {
        adoptStyles(shadowRoot, controlsSheet, componentSheet)
    } else {
        adoptStyles(shadowRoot, controlsSheet)
    }
    return componentSheet
}


/**
 * @deprecated Use setupInputStyles() instead
 * Kept for backwards compatibility during migration
 */
export function createInputStyles (customStyles) {
    return customStyles
}


export function emitChange (element, detail) {
    element.dispatchEvent(new CustomEvent('change', {
        detail,
        bubbles: true
    }))
}


// === ATTRIBUTE HANDLERS ===

const attributeHandlers = {
    value: (component, newValue) => {
        component.setValue(parseFloat(newValue) || 0)
    },
    min: (component, newValue) => {
        component.setMin(parseFloat(newValue) || 0)
    },
    max: (component, newValue) => {
        component.setMax(parseFloat(newValue) || 100)
    },
    step: (component, newValue) => {
        component.setStep(parseFloat(newValue) || 1)
    },
    label: (component, newValue) => {
        component.setLabel(newValue || '')
    },
    precision: (component, newValue) => {
        component.setPrecision(parseInt(newValue, 10) || 2)
    },
    checked: (component, newValue) => {
        component.setChecked(newValue !== null)
    }
}


export function handleAttributeChange (component, name, oldValue, newValue) {
    if (oldValue === newValue) {
        return false
    }

    const handler = attributeHandlers[name]
    if (handler) {
        handler(component, newValue)
        return true
    }

    return false
}
