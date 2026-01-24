import PerkyElement from '../application/perky_element.js'
import {themeCSS} from './styles/theme.styles.js'
import {resetCSS} from './styles/reset.styles.js'


export default class EditorComponent extends PerkyElement {

    static styles = [...themeCSS, resetCSS]

}
