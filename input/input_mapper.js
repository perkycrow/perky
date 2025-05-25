import PerkyModule from '../core/perky_module'


export default class InputMapper extends PerkyModule {

    constructor ({inputObserver} = {}) {
        super()

        this.inputObserver = inputObserver
        this.mappings = {}
        this.inputToAction = {}
        this.pressedActions = {}

        this.#initEvents(this)
    }


    setInputFor (action, input, slot = 0) {
        if (!this.mappings[action]) {
            this.mappings[action] = {}
        }

        this.mappings[action][slot] = input
        this.inputToAction[input] = action
    }


    setInputsFor (action, inputs) {
        inputs.forEach((input, index) => {
            this.setInputFor(action, input, index)
        })
    }


    getInputFor (action, slot = 0) {
        return this.mappings[action] && this.mappings[action][slot]
    }


    getInputsFor (action) {
        const inputs = []
        const actionMappings = this.mappings[action]

        if (actionMappings) {
            Object.values(actionMappings).forEach(input => {
                inputs.push(input)
            })
        }

        return inputs
    }


    removeInputFor (action, input, slot = 0) {
        if (this.mappings[action] && this.mappings[action][slot] === input) {
            delete this.mappings[action][slot]
            delete this.inputToAction[input]
        }
    }


    getActionFor (input) {
        return this.inputToAction[input]
    }


    isActionPressed (action) {
        if (this.pressedActions[action]) {
            return true
        }

        const inputs = this.getInputsFor(action)
        return inputs.some(input => this.inputObserver.isPressed(input))
    }


    isInputPressed (input) {
        return this.inputObserver.isPressed(input)
    }


    #initEvents () {
        const {inputObserver} = this

        inputObserver.on('keydown', (data) => {
            const action = this.getActionFor(data.code)

            if (action) {
                this.pressedActions[action] = true
                this.emit('action', action)
            }
        })

        inputObserver.on('keyup', (data) => {
            const action = this.getActionFor(data.code)

            if (action) {
                delete this.pressedActions[action]
            }
        })

        inputObserver.on('mousedown', (data) => {
            const input = `Mouse${data.button}`
            const action = this.getActionFor(input)

            if (action) {
                this.pressedActions[action] = true
                this.emit('action', action)
            }
        })

        inputObserver.on('mouseup', (data) => {
            const input = `Mouse${data.button}`
            const action = this.getActionFor(input)

            if (action) {
                delete this.pressedActions[action]
            }
        })
    }

}
