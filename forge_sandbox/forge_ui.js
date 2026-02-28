const OPERATIONS = [
    {id: 'union', label: '∪'},
    {id: 'subtract', label: '−'},
    {id: 'intersect', label: '∩'}
]

const BUTTON_STYLE = {
    width: '44px',
    height: '44px',
    borderRadius: '8px',
    border: '2px solid transparent',
    color: 'white',
    fontSize: '20px',
    cursor: 'pointer',
    touchAction: 'manipulation'
}


export default class ForgeUI {

    #container
    #forge
    #operationBar = null
    #operationButtons = {}
    #toast = null


    constructor (container, forge) {
        this.#container = container
        this.#forge = forge
        this.#createAddButton()
        this.#createOperationBar()
    }


    showOperationToolbar (activeOperation) {
        this.#operationBar.style.display = 'flex'
        this.#highlightOperation(activeOperation)
    }


    hideOperationToolbar () {
        this.#operationBar.style.display = 'none'
    }


    updateOperationToolbar (activeOperation) {
        this.#highlightOperation(activeOperation)
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


    #createOperationBar () {
        const bar = document.createElement('div')
        Object.assign(bar.style, {
            position: 'absolute',
            bottom: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'none',
            gap: '8px',
            background: 'rgba(30, 30, 50, 0.85)',
            padding: '8px',
            borderRadius: '12px',
            zIndex: '10'
        })

        for (const op of OPERATIONS) {
            const btn = document.createElement('button')
            btn.textContent = op.label
            Object.assign(btn.style, BUTTON_STYLE)
            btn.style.background = 'rgba(255, 255, 255, 0.1)'
            btn.addEventListener('click', () => this.#forge.setOperation(op.id))
            bar.appendChild(btn)
            this.#operationButtons[op.id] = btn
        }

        this.#container.appendChild(bar)
        this.#operationBar = bar
    }


    showToast (message) {
        if (this.#toast) {
            this.#toast.remove()
        }

        const div = document.createElement('div')
        div.textContent = message
        Object.assign(div.style, {
            position: 'absolute',
            top: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(30, 30, 50, 0.85)',
            color: 'white',
            padding: '8px 16px',
            borderRadius: '8px',
            fontSize: '14px',
            zIndex: '10',
            pointerEvents: 'none'
        })

        this.#container.appendChild(div)
        this.#toast = div

        setTimeout(() => {
            if (this.#toast === div) {
                div.remove()
                this.#toast = null
            }
        }, 600)
    }


    #highlightOperation (activeOperation) {
        for (const op of OPERATIONS) {
            const btn = this.#operationButtons[op.id]
            if (op.id === activeOperation) {
                btn.style.background = '#4a90d9'
                btn.style.borderColor = '#6ab0ff'
            } else {
                btn.style.background = 'rgba(255, 255, 255, 0.1)'
                btn.style.borderColor = 'transparent'
            }
        }
    }

}
