

import {themeCSS} from './theme.styles.js'
import {resetCSS} from './reset.styles.js'
import {controlsCSS} from './controls.styles.js'


const supportsConstructableStylesheets = (() => {
    try {
        const sheet = new CSSStyleSheet()
        return typeof sheet.replaceSync === 'function'
    } catch {
        return false
    }
})()


export let themeSheet = null
export let resetSheet = null
export let controlsSheet = null

if (supportsConstructableStylesheets) {
    themeSheet = new CSSStyleSheet()
    resetSheet = new CSSStyleSheet()
    controlsSheet = new CSSStyleSheet()

    themeSheet.replaceSync(themeCSS)
    resetSheet.replaceSync(resetCSS)
    controlsSheet.replaceSync(controlsCSS)
}


export function adoptStyles (shadowRoot, ...extraSheets) {
    if (supportsConstructableStylesheets) {
        const sheets = [themeSheet, resetSheet, ...extraSheets].filter(Boolean)
        shadowRoot.adoptedStyleSheets = sheets
    } else {
        // Fallback for environments without Constructable Stylesheets (jsdom)
        const allCSS = [themeCSS, resetCSS]
        extraSheets.forEach(sheet => {
            if (sheet && sheet._css) {
                allCSS.push(sheet._css)
            }
        })
        const style = document.createElement('style')
        style.textContent = allCSS.join('\n')
        shadowRoot.appendChild(style)
    }
}


export function createSheet (css) {
    if (supportsConstructableStylesheets) {
        const sheet = new CSSStyleSheet()
        sheet.replaceSync(css)
        return sheet
    }

    // Fallback: return object with CSS for later use
    return {_css: css}
}


// Re-export raw CSS for components that need string-based styles
export {themeCSS, resetCSS, controlsCSS}
