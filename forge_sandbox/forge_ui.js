export default class ForgeUI {

    #container
    #forge

    constructor (container, forge) {
        this.#container = container
        this.#forge = forge
        this.#createAddButton()
    }


    #createAddButton () {
        const button = document.createElement('button')
        button.textContent = '+'
        Object.assign(button.style, {
            position: 'absolute',
            bottom: '24px',
            right: '24px',
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            border: 'none',
            background: '#4a90d9',
            color: 'white',
            fontSize: '28px',
            cursor: 'pointer',
            zIndex: '10',
            touchAction: 'manipulation'
        })
        button.addEventListener('click', () => this.#forge.addBrush())
        this.#container.appendChild(button)
    }

}
