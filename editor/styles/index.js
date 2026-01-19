/**
 * Shared styles system using Constructable Stylesheets
 *
 * Usage in components:
 *
 *   import {adoptStyles, controlsSheet} from '../styles/index.js'
 *
 *   class MyComponent extends HTMLElement {
 *       constructor() {
 *           super()
 *           this.attachShadow({mode: 'open'})
 *           adoptStyles(this.shadowRoot, controlsSheet)
 *       }
 *   }
 */

import {themeCSS} from './theme.styles.js'
import {resetCSS} from './reset.styles.js'
import {controlsCSS} from './controls.styles.js'


// Create stylesheet instances (shared in memory)
export const themeSheet = new CSSStyleSheet()
export const resetSheet = new CSSStyleSheet()
export const controlsSheet = new CSSStyleSheet()

// Initialize stylesheets
themeSheet.replaceSync(themeCSS)
resetSheet.replaceSync(resetCSS)
controlsSheet.replaceSync(controlsCSS)


/**
 * Adopt shared styles into a shadow root
 * Always includes theme and reset, plus any extra sheets
 *
 * @param {ShadowRoot} shadowRoot - The shadow root to style
 * @param {...CSSStyleSheet} extraSheets - Additional stylesheets to adopt
 */
export function adoptStyles (shadowRoot, ...extraSheets) {
    shadowRoot.adoptedStyleSheets = [themeSheet, resetSheet, ...extraSheets]
}


/**
 * Create a component-specific stylesheet from CSS string
 * Useful for component-specific styles that aren't shared
 *
 * @param {string} css - CSS string
 * @returns {CSSStyleSheet}
 */
export function createSheet (css) {
    const sheet = new CSSStyleSheet()
    sheet.replaceSync(css)
    return sheet
}


// Re-export raw CSS for components that need string-based styles
export {themeCSS, resetCSS, controlsCSS}
