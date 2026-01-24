import {createSheet, adoptStyleSheets} from '../../application/dom_utils.js'
import {themeCSS} from './theme.styles.js'
import {resetCSS} from './reset.styles.js'
import {controlsCSS} from './controls.styles.js'


export const themeSheet = createSheet(themeCSS)
export const resetSheet = createSheet(resetCSS)
export const controlsSheet = createSheet(controlsCSS)


export function adoptStyles (shadowRoot, ...extraSheets) {
    adoptStyleSheets(shadowRoot, themeSheet, resetSheet, ...extraSheets)
}


export {createSheet, themeCSS, resetCSS, controlsCSS}
