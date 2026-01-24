import PerkyComponent from '../application/perky_component.js'
import {themeCSS} from './styles/theme.styles.js'
import {resetCSS} from './styles/reset.styles.js'


export default class EditorComponent extends PerkyComponent {

    static styles = [...themeCSS, resetCSS]

}
