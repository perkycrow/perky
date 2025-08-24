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
            background: rgba(0, 0, 0, 0.7);
            z-index: 1000;
        }

        title-menu .menu-container {
            text-align: center;
            color: #D9AB7A;
            font-family: 'Cinzel Decorative', serif;
        }

        title-menu .game-title {
            font-size: 4rem;
            margin-bottom: 2rem;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
            font-weight: 700;
        }

        title-menu .menu-nav {
            display: flex;
            flex-direction: column;
            gap: 1rem;
        }

        title-menu .menu-button {
            background: rgba(217, 171, 122, 0.2);
            border: 2px solid #D9AB7A;
            color: #D9AB7A;
            font-family: 'Cinzel Decorative', serif;
            font-size: 1.5rem;
            padding: 1rem 2rem;
            cursor: pointer;
            transition: all 0.3s ease;
            border-radius: 8px;
        }

        title-menu .menu-button:hover {
            background: #D9AB7A;
            color: #0a0a0a;
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(217, 171, 122, 0.3);
        }

        title-menu .menu-button:active {
            transform: translateY(0);
        }

        @media (max-width: 768px) {
            title-menu .game-title {
                font-size: 2.5rem;
            }
            
            title-menu .menu-button {
                font-size: 1.2rem;
                padding: 0.8rem 1.5rem;
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
