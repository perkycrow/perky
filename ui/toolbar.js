import Application from '../application/application'


const baseHtml = `
    <div class="perky-toolbar perky-toolbar-light"></div>
`

const baseCss = `
    .perky-toolbar {
        display: flex;
        gap: 8px;
        padding: 10px;
        border-radius: 6px;
        z-index: 100;
    }

    .perky-toolbar-dark {
        background: rgba(40, 44, 52, 0.85);
        backdrop-filter: blur(5px);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    }

    .perky-toolbar-light {
        background: rgba(255, 255, 255, 0.85);
        backdrop-filter: blur(5px);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        border: 1px solid rgba(0, 0, 0, 0.1);
    }

    .perky-toolbar-top-right {
        position: absolute;
        top: 10px;
        right: 10px;
    }

    .perky-toolbar-top-left {
        position: absolute;
        top: 10px;
        left: 10px;
    }

    .perky-toolbar-bottom-right {
        position: absolute;
        bottom: 10px;
        right: 10px;
    }

    .perky-toolbar-bottom-left {
        position: absolute;
        bottom: 10px;
        left: 10px;
    }

    .perky-toolbar-button {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 6px 12px;
        border: none;
        border-radius: 4px;
        font-family: 'IBM Plex Mono', monospace;
        font-size: 13px;
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .perky-toolbar-dark .perky-toolbar-button {
        background: rgba(255, 255, 255, 0.15);
        color: #fff;
    }

    .perky-toolbar-light .perky-toolbar-button {
        background: rgba(0, 0, 0, 0.07);
        color: #333;
    }

    .perky-toolbar-dark .perky-toolbar-button:hover {
        background: rgba(255, 255, 255, 0.25);
    }

    .perky-toolbar-light .perky-toolbar-button:hover {
        background: rgba(0, 0, 0, 0.12);
    }

    .perky-toolbar-icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
    }
`


export default class Toolbar extends Application {

    constructor (params = {}) {
        super(params)
        this.options = {
            position: 'top-right',
            ...params
        }

        this.setHtml(baseHtml)
        this.setCss(baseCss)

        this.toolbarElement = this.element.querySelector('.perky-toolbar')
        this.setPosition(this.options.position)
    }


    add (label, callback, options = {}) {
        const button = document.createElement('button')
        button.className = 'perky-toolbar-button'
        button.textContent = label

        if (options.icon) {
            const icon = document.createElement('span')
            icon.className = 'perky-toolbar-icon'
            icon.innerHTML = options.icon
            button.prepend(icon)
        }

        if (options.className) {
            button.classList.add(options.className)
        }

        button.addEventListener('click', callback)
        this.toolbarElement.appendChild(button)

        return button
    }


    setPosition (position) {
        this.toolbarElement.classList.remove(`perky-toolbar-${this.options.position}`)
        this.options.position = position
        this.toolbarElement.classList.add(`perky-toolbar-${this.options.position}`)
    }

}
