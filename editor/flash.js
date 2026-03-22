import EditorComponent from './editor_component.js'
import {createElement} from '../application/dom_utils.js'


const DURATION = 3000
const ANIMATION_MS = 300


export default class Flash extends EditorComponent {

    static styles = `
        :host {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            z-index: 10000;
            display: flex;
            flex-direction: column;
            align-items: center;
            pointer-events: none;
            padding: var(--spacing-md);
            gap: var(--spacing-sm);
        }

        .flash-item {
            padding: var(--spacing-sm) var(--spacing-lg);
            border-radius: var(--radius-md);
            font-family: var(--font-mono);
            font-size: var(--font-size-md);
            font-weight: 500;
            box-shadow: var(--shadow-md);
            pointer-events: auto;
            cursor: default;
            opacity: 0;
            transform: translateY(-8px);
            animation: flash-in ${ANIMATION_MS}ms ease forwards;
        }

        .flash-item.out {
            animation: flash-out ${ANIMATION_MS}ms ease forwards;
        }

        .flash-item.success {
            background: var(--status-success);
            color: var(--bg-primary);
        }

        .flash-item.error {
            background: var(--status-error);
            color: var(--bg-primary);
        }

        .flash-item.warning {
            background: var(--status-warning);
            color: var(--bg-primary);
        }

        .flash-item.info {
            background: var(--accent);
            color: var(--bg-primary);
        }

        @keyframes flash-in {
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        @keyframes flash-out {
            from {
                opacity: 1;
                transform: translateY(0);
            }
            to {
                opacity: 0;
                transform: translateY(-8px);
            }
        }
    `

    show (message, type = 'info') {
        const item = createElement('div', {class: `flash-item ${type}`, text: message})
        this.shadowRoot.appendChild(item)

        setTimeout(() => dismiss(item), DURATION)
    }

}


customElements.define('editor-flash', Flash)


function dismiss (item) {
    item.classList.add('out')
    item.addEventListener('animationend', () => item.remove())
}


let singleton = null


export function flash (message, type = 'info') {
    if (!singleton) {
        singleton = document.createElement('editor-flash')
        document.body.appendChild(singleton)
    }
    singleton.show(message, type)
}
