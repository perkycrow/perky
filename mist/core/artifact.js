export default class Artifact {

    static type = 'passive'
    static skill = null
    static stack = 1

    static title = {
        fr: 'Artefact',
        en: 'Artifact'
    }

    static description = {
        fr: 'Description',
        en: 'Description'
    }


    constructor (params) {
        this.restore(params)
    }


    add (amount) {
        this.stack += (amount || 1)
    }


    trigger () {
        return this.stack > 0
    }


    restore (params) {
        reset(this, params)
    }


    export () {
        return {
            id: this.id,
            skill: this.skill,
            type: this.type,
            stack: this.stack
        }
    }


    static getId () {
        return getId(this)
    }

}


function reset (artifact, {
    id = getId(artifact.constructor),
    skill = artifact.constructor.skill,
    type = artifact.constructor.type,
    stack = artifact.constructor.stack
} = {}) {
    Object.assign(artifact, {
        id,
        skill,
        type,
        stack
    })
}


function getId (constructor) {
    return constructor.id || lowerFirst(constructor.name.replace('Artifact', '')) || constructor.name
}


function lowerFirst (string) {
    return string.charAt(0).toLowerCase() + string.slice(1)
}
