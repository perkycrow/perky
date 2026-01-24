import {createStyleSheet, adoptStyleSheets} from '../../application/dom_utils.js'
import {themeCSS} from './theme.styles.js'
import {resetCSS} from './reset.styles.js'
import {controlsCSS} from './controls.styles.js'


export const themeSheet = createStyleSheet(themeCSS)
export const resetSheet = createStyleSheet(resetCSS)
export const controlsSheet = createStyleSheet(controlsCSS)


export function adoptStyles (shadowRoot, ...extraSheets) {
    adoptStyleSheets(shadowRoot, themeSheet, resetSheet, ...extraSheets)
}


export {createStyleSheet, themeCSS, resetCSS, controlsCSS}
