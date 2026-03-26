import ActionController from '../../core/action_controller.js'


export default class SceneController extends ActionController {

    static bindings = {
        undo: 'ctrl+z',
        redo: 'ctrl+shift+z',
        copy: 'ctrl+c',
        paste: 'ctrl+v',
        duplicate: 'ctrl+d',
        delete: ['Delete', 'Backspace']
    }

    undo () {
        this.engine.undoAction()
    }


    redo () {
        this.engine.redoAction()
    }


    copy () {
        this.engine.copySelectedEntity()
    }


    paste () {
        this.engine.pasteEntity()
    }


    duplicate () {
        this.engine.duplicateSelectedEntity()
    }


    delete () {
        this.engine.deleteSelectedEntity()
    }

}
