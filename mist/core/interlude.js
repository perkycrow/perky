import InterludeActionSet from '../action_sets/interlude_action_set.js'


export default class Interlude {

    static visual   = null
    static dialog   = null
    static choices  = []
    static content = {}


    constructor (params, {skillFactory, artifactFactory} = {}) {
        this.type = 'interlude'
        this.artifactFactory = artifactFactory || this.constructor.artifactFactory
        this.skillFactory    = skillFactory    || this.constructor.skillFactory

        this.restore(params)

        this.actionSet = new InterludeActionSet(this)
    }


    contentFor (lang) {
        return this.content[lang]
    }


    async triggerAction (name, ...args) {
        return this.actionSet.trigger(name, ...args)
    }


    export () {
        return {
            visual:  this.visual,
            content: this.content,
            choices: Array.from(this.choices),
            currentChoice: this.currentChoice
        }
    }

    restore (params) {
        reset(this, params)
    }

}


function reset (interlude, {
    visual  = interlude.constructor.visual,
    content = interlude.constructor.content,
    choices = Array.from(interlude.constructor.choices),
    currentChoice = null
} = {}) {
    interlude.visual  = visual
    interlude.content = content
    interlude.choices = Array.from(choices)
    interlude.currentChoice = currentChoice
}
