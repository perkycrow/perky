import {html} from 'lit'
import PerkyComponent from './perky_component.js'


export default class TitleMenu extends PerkyComponent {

    static tagName = 'title-menu'
    
    static properties = {
        gameTitle: {type: String},
        menuItems: {type: Array}
    }

    static css = `
        title-menu {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
        }

        title-menu .menu-container {
            text-align: center;
            color: #000000;
            font-family: sans-serif;
        }

        title-menu .game-title {
            font-size: 3rem;
            margin-bottom: 2rem;
            font-weight: 700;
        }

        title-menu .menu-nav {
            display: flex;
            flex-direction: column;
            gap: 1rem;
        }

        title-menu .menu-button {
            color: inherit;
            font-family: inherit;
            font-size: 1.2rem;
            padding: 0.8rem 1.5rem;
            cursor: pointer;
        }

        @media (max-width: 768px) {
            title-menu .game-title {
                font-size: 2rem;
            }
            
            title-menu .menu-button {
                font-size: 1rem;
                padding: 0.6rem 1.2rem;
            }
        }
    `


    constructor () {
        super()
        this.gameTitle = 'Game'
        this.menuItems = []
    }


    render () {
        return html`
            <div class="menu-container">
                <h1 class="game-title">${this.gameTitle}</h1>
                <nav class="menu-nav">
                    ${this.menuItems.map(item => html`
                        <button class="menu-button ${item.cssClass || ''}" @click="${() => this.handleAction(item.action)}">
                            ${item.label}
                        </button>
                    `)}
                </nav>
            </div>
        `
    }


    addButton ({label, cssClass, action}) {
        this.menuItems = [...this.menuItems, {label, cssClass, action}]
        this.requestUpdate()
        return this
    }


    clearButtons () {
        this.menuItems = []
        this.requestUpdate()
        return this
    }


    handleAction (action) {
        this.dispatchEvent(new CustomEvent('menu:action', {
            detail: {action},
            bubbles: true
        }))
    }

}


TitleMenu.define()
