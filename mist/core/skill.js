export default class Skill {

    static cost = 0
    static charges = 0
    static additionalCost = 0
    static overload = 0

    static title = {
        fr: 'Competence',
        en: 'Skill'
    }

    static description = {
        fr: 'Description',
        en: 'Description'
    }

    static chargeDescription = {
        fr: 'Description de la jauge de chargement',
        en: 'Charge gauge description'
    }

    constructor (params) {
        this.restore(params)
    }


    translate (key, lang) {
        return this.constructor[key][lang]
    }


    get ready () {
        return this.charges >= this.totalCost
    }


    get remainingCharges () {
        return this.totalCost - this.charges
    }


    get progress () {
        return this.charges / this.totalCharges
    }


    get totalCost () {
        return this.cost + this.additionalCost
    }


    get totalCharges () {
        return this.totalCost + this.overload
    }


    trigger () {
        return true
    }


    charge () {
        const {charges, totalCharges} = this
        if (charges < totalCharges) {
            this.charges += 1
            if (this.charges > totalCharges) {
                this.charges = totalCharges
                return false
            }
            return true
        }
        return false
    }


    activate () {
        return this.ready && this.drain()
    }


    drain () {
        this.charges -= this.totalCost
        this.charges = Math.max(this.charges, 0)
        return true
    }


    restore (params) {
        reset(this, params)
    }


    export () {
        return {
            id: this.id,
            cost: this.cost,
            charges: this.charges,
            overload: this.overload,
            additionalCost: this.additionalCost
        }
    }

}


function reset (skill, {
    id = getId(skill.constructor),
    cost = skill.constructor.cost,
    charges = skill.constructor.charges,
    additionalCost = skill.constructor.additionalCost,
    overload = skill.constructor.overload
} = {}) {
    Object.assign(skill, {
        id,
        cost,
        charges,
        additionalCost,
        overload
    })
}


function getId (constructor) {
    return constructor.id || lowerFirst(constructor.name.replace('Skill', '')) || constructor.name
}


function lowerFirst (string) {
    return string.charAt(0).toLowerCase() + string.slice(1)
}
