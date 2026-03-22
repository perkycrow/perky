export default class CommandHistory {

    #undoStack = []
    #redoStack = []
    #maxSize

    constructor (options = {}) {
        this.#maxSize = options.maxSize ?? 100
    }


    get canUndo () {
        return this.#undoStack.length > 0
    }


    get canRedo () {
        return this.#redoStack.length > 0
    }


    get undoCount () {
        return this.#undoStack.length
    }


    get redoCount () {
        return this.#redoStack.length
    }


    execute (command) {
        command.execute()
        this.push(command)
    }


    push (command) {
        this.#undoStack.push(command)
        this.#redoStack.length = 0

        if (this.#undoStack.length > this.#maxSize) {
            this.#undoStack.shift()
        }
    }


    undo () {
        if (!this.canUndo) {
            return null
        }

        const command = this.#undoStack.pop()
        command.undo()
        this.#redoStack.push(command)
        return command
    }


    redo () {
        if (!this.canRedo) {
            return null
        }

        const command = this.#redoStack.pop()
        command.execute()
        this.#undoStack.push(command)
        return command
    }


    clear () {
        this.#undoStack.length = 0
        this.#redoStack.length = 0
    }

}
