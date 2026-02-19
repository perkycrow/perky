import CutSceneActionSet from '../action_sets/cut_scene_action_set.js'


export default class CutScene {

    static visual = null

    constructor (params) {
        this.type = 'cutScene'
        this.restore(params)

        this.actionSet = new CutSceneActionSet(this)
    }


    async triggerAction (name, ...args) {
        return this.actionSet.trigger(name, ...args)
    }


    export () {
        return {
            visual: this.visual
        }
    }


    restore (params) {
        reset(this, params)
    }

}


function reset (cutScene, {
    visual = cutScene.constructor.visual
} = {}) {
    cutScene.visual = visual
}
