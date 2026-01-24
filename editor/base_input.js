import {adoptStyles, createStyleSheet, controlsSheet} from './styles/index.js'


export function setupInputStyles (shadowRoot, componentCSS = '') {
    const componentSheet = componentCSS ? createStyleSheet(componentCSS) : null
    if (componentSheet) {
        adoptStyles(shadowRoot, controlsSheet, componentSheet)
    } else {
        adoptStyles(shadowRoot, controlsSheet)
    }
    return componentSheet
}


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
