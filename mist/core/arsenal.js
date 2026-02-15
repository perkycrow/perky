import Factory from '../libs/factory.js'


export default class Arsenal {

    constructor (params, skillFactory) {
        this.skillFactory = skillFactory || new Factory('Skill')
        this.restore(params)
    }


    provideSkill (Skill) {
        this.skillFactory.set(Skill)
    }


    createSkill (params) {
        return this.skillFactory.create(params.id, params)
    }


    getSkill (id) {
        return this.skills.find(skill => id === skill.id)
    }


    addSkill (params) {
        if (typeof params === 'string') {
            params = {id: params}
        }

        if (!this.getSkill(params.id)) {
            const skill = this.createSkill(params)

            if (skill) {
                this.skills.push(skill)
                return skill
            }
        }

        return null
    }


    chargeSkill (name, amount = 1) {
        const skill = this.getSkill(name)

        let charged = 0

        if (skill) {
            while (charged < amount && skill.charge()) {
                charged += 1
            }
        }

        return charged
    }


    activateSkill (name) {
        const skill = this.getSkill(name)

        if (skill) {
            return skill.activate()
        }

        return false
    }


    export () {
        return {
            skills: this.skills.map(skill => skill.export())
        }
    }


    restore (params) {
        reset(this, params)
    }

}


function reset (arsenal, {
    skills = []
} = {}) {
    arsenal.skills = []
    skills.forEach(skill => arsenal.addSkill(skill))
}
