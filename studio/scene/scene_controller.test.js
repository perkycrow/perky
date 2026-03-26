import {test, expect} from 'vitest'
import SceneController from './scene_controller.js'
import ActionController from '../../core/action_controller.js'


test('extends ActionController', () => {
    expect(SceneController.prototype).toBeInstanceOf(ActionController)
})


test('bindings', () => {
    const normalized = SceneController.normalizeBindings('scene')
    const actions = normalized.map(b => b.action)
    expect(actions).toContain('undo')
    expect(actions).toContain('redo')
    expect(actions).toContain('copy')
    expect(actions).toContain('paste')
    expect(actions).toContain('duplicate')
    expect(actions).toContain('delete')
})


test('undo binding is combo', () => {
    const normalized = SceneController.normalizeBindings('scene')
    const undo = normalized.find(b => b.action === 'undo')
    expect(undo.combo).toBe(true)
    expect(undo.controls).toContain('ControlLeft')
    expect(undo.controls).toContain('z')
})


test('delete binding is simple', () => {
    const normalized = SceneController.normalizeBindings('scene')
    const deletes = normalized.filter(b => b.action === 'delete')
    expect(deletes).toHaveLength(2)
    expect(deletes[0].combo).toBe(false)
})
