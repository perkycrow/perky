import {describe, test, expect, beforeEach} from 'vitest'
import CommandHistory from './command_history.js'


function createCommand (log = []) {
    return {
        execute () {
            log.push('exec')
        },
        undo () {
            log.push('undo')
        }
    }
}


describe('CommandHistory', () => {

    let history

    beforeEach(() => {
        history = new CommandHistory()
    })


    test('starts empty', () => {
        expect(history.canUndo).toBe(false)
        expect(history.canRedo).toBe(false)
        expect(history.undoCount).toBe(0)
        expect(history.redoCount).toBe(0)
    })


    test('execute runs command and pushes to undo stack', () => {
        const log = []
        history.execute(createCommand(log))

        expect(log).toEqual(['exec'])
        expect(history.canUndo).toBe(true)
        expect(history.undoCount).toBe(1)
    })


    test('undo reverses last command', () => {
        const log = []
        history.execute(createCommand(log))
        history.undo()

        expect(log).toEqual(['exec', 'undo'])
        expect(history.canUndo).toBe(false)
        expect(history.canRedo).toBe(true)
    })


    test('redo re-executes undone command', () => {
        const log = []
        history.execute(createCommand(log))
        history.undo()
        history.redo()

        expect(log).toEqual(['exec', 'undo', 'exec'])
        expect(history.canUndo).toBe(true)
        expect(history.canRedo).toBe(false)
    })


    test('execute clears redo stack', () => {
        history.execute(createCommand())
        history.undo()

        expect(history.canRedo).toBe(true)

        history.execute(createCommand())

        expect(history.canRedo).toBe(false)
    })


    test('undo returns the command', () => {
        const cmd = createCommand()
        history.execute(cmd)

        expect(history.undo()).toBe(cmd)
    })


    test('redo returns the command', () => {
        const cmd = createCommand()
        history.execute(cmd)
        history.undo()

        expect(history.redo()).toBe(cmd)
    })


    test('undo returns null when empty', () => {
        expect(history.undo()).toBeNull()
    })


    test('redo returns null when empty', () => {
        expect(history.redo()).toBeNull()
    })


    test('multiple undo redo', () => {
        const log1 = []
        const log2 = []
        history.execute(createCommand(log1))
        history.execute(createCommand(log2))

        history.undo()
        expect(log2).toEqual(['exec', 'undo'])

        history.undo()
        expect(log1).toEqual(['exec', 'undo'])

        history.redo()
        expect(log1).toEqual(['exec', 'undo', 'exec'])
    })


    test('push adds command without executing', () => {
        const log = []
        history.push(createCommand(log))

        expect(log).toEqual([])
        expect(history.canUndo).toBe(true)
    })


    test('respects maxSize', () => {
        const small = new CommandHistory({maxSize: 3})

        small.execute(createCommand())
        small.execute(createCommand())
        small.execute(createCommand())
        small.execute(createCommand())

        expect(small.undoCount).toBe(3)
    })


    test('clear empties both stacks', () => {
        history.execute(createCommand())
        history.execute(createCommand())
        history.undo()

        history.clear()

        expect(history.canUndo).toBe(false)
        expect(history.canRedo).toBe(false)
    })

})
