import PerkyView from '../application/perky_view'


const baseHtml = `
    <div class="perky-toolbar perky-toolbar-light"></div>
`


export default class Toolbar extends PerkyView {

    constructor (params = {}) {
        super({
            className: 'perky-toolbar-container',
            ...params
        })
        
        this.options = {
            position: 'top-right',
            ...params
        }

        this.html = baseHtml
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
