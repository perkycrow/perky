import Brush from './brush.js'


export default class BrushHistory {

    #brushSet = null
    #states = []
    #index = -1
    #maxStates = 50

    constructor (brushSet, options = {}) {
        this.#brushSet = brushSet
        this.#maxStates = options.maxStates ?? 50
    }


    get canUndo () {
        return this.#index > 0
    }


    get canRedo () {
        return this.#index < this.#states.length - 1
    }


    get stateCount () {
        return this.#states.length
    }


    save () {
        this.#index++
        this.#states.length = this.#index
        this.#states.push(this.#brushSet.toJSON())

        if (this.#states.length > this.#maxStates) {
            this.#states.shift()
            this.#index--
        }
    }


    undo () {
        if (!this.canUndo) {
            return false
        }
        this.#index--
        this.#restore()
        return true
    }


    redo () {
        if (!this.canRedo) {
            return false
        }
        this.#index++
        this.#restore()
        return true
    }


    clear () {
        this.#states.length = 0
        this.#index = -1
    }


    #restore () {
        const data = this.#states[this.#index]
        while (this.#brushSet.count > 0) {
            this.#brushSet.remove(0)
        }
        for (const entry of data) {
            this.#brushSet.add(Brush.fromJSON(entry))
        }
    }

}
