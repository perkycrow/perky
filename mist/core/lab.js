import PerkyModule from '../../core/perky_module.js'
import allReagents from '../data/reagents.js'


export default class Lab extends PerkyModule {

    static $name = 'lab'
    static $bind = true

    constructor (options = {}) {
        super(options)
        this.restore(options)
    }


    has (name) {
        return this.reagents.includes(name)
    }


    get count () {
        return this.reagents.length
    }


    get neglectedCount () {
        return this.unlockedCount - (this.activeCount + this.clearedCount)
    }


    get playableCount () {
        return this.unlockedCount - this.clearedCount
    }


    get unlocked () {
        return this.reagents.slice(0, this.unlockedCount)
    }


    get playable () {
        return this.unlocked.slice(-this.playableCount)
    }


    get active () {
        return this.playable.slice(-this.activeCount)
    }


    get neglected () {
        return this.playable.slice(0, this.neglectedCount)
    }


    get cleared () {
        return this.unlocked.slice(0, this.clearedCount)
    }


    get last () {
        return this.reagents[this.unlockedCount - 1]
    }


    get next () {
        return this.reagents[this.unlockedCount]
    }


    get lastCleared () {
        return this.cleared[this.clearedCount - 1]
    }


    get lastNeglected () {
        return this.neglected[this.neglectedCount - 1]
    }


    isLast (name) {
        return name === this.last
    }


    isNext (name) {
        return name === this.next
    }


    isUnlocked (name) {
        return this.unlocked.includes(name)
    }


    isPlayable (name) {
        return this.playable.includes(name)
    }


    isActive (name) {
        return this.active.includes(name)
    }


    isNeglected (name) {
        return this.neglected.includes(name)
    }


    isCleared (name) {
        return this.cleared.includes(name)
    }


    unlockNext () {
        if (this.unlockedCount < this.count) {
            this.unlockedCount += 1

            return this.last
        }

        return null
    }


    clearNext () {
        if (this.neglectedCount > 0) {
            this.clearedCount += 1

            return this.lastCleared
        }

        return null
    }


    unlock (name) {
        if (this.has(name) && !this.isUnlocked(name)) {
            this.unlockedCount = this.reagents.indexOf(name) + 1

            return this.last
        }

        return null
    }


    clear (name) {
        if (this.isNeglected(name)) {
            this.clearedCount = this.reagents.indexOf(name) + 1

            return this.lastCleared
        }

        return null
    }


    evolutionFor (reagent) {
        const index = this.reagents.indexOf(reagent)
        return this.reagents[index + 1]
    }


    buildReagent ({x = 0, y = 0, name} = {}, game) {
        if (!name && game) {
            name = this.pickOne(game)
        }

        return {x, y, name}
    }


    buildCluster ({pairs = false, count = 2} = {}, game) {
        const reagents = []

        let reagent
        for (let i = 0; i < count; i++) {
            let name

            if (reagent && pairs) {
                name = reagent.name
            }

            reagent = this.buildReagent({name}, game)
            reagents.push(reagent)
        }

        return {reagents}
    }


    pickOne (game) {
        return game.weightedChoice(this.choices)
    }


    pickMany (game, {pairs = false, count = 2} = {}) {
        const reagents = []

        let reagent
        for (let i = 0; i < count; i++) {
            reagent = reagent && pairs ? reagent : this.pickOne(game)
            reagents.push(reagent)
        }

        return reagents
    }


    indexFor (name) {
        return this.reagents.indexOf(name)
    }


    get choices () {
        return getChoices(this)
    }


    restore (params) {
        reset(this, params)
    }


    export () {
        return {
            reagents: Array.from(this.reagents),
            startsAt: this.startsAt,
            unlockedCount: this.unlockedCount,
            activeCount: this.activeCount,
            clearedCount: this.clearedCount
        }
    }

}


function reset (lab, {
    reagentsCount = 10,
    startsAt = 0,
    reagents = Array.from(allReagents).slice(startsAt).slice(0, reagentsCount),
    unlockedCount = reagents.length,
    activeCount = reagents.length,
    clearedCount = 0
} = {}) {
    lab.reagents = Array.from(reagents)
    lab.unlockedCount = unlockedCount
    lab.activeCount = activeCount
    lab.clearedCount = clearedCount
    lab.startsAt = startsAt
}


function getChoices (lab) {
    const reagents = lab.playable

    let power = 0.33
    if (lab.neglectedCount > 0) {
        reagents.reverse()
        power = 0.66
    }

    let totalWeight = 0
    const choices = reagents.map((name, index) => {
        const weight = Math.pow(index + 1, power)
        totalWeight += weight
        return {value: name, weight}
    })

    return choices.map(choice => ({value: choice.value, weight: choice.weight / totalWeight * 100}))
}
