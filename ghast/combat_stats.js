import Component from '../game/component.js'
import {XP_WEIGHTS} from './xp_config.js'


export default class CombatStats extends Component {

    constructor (options = {}) {
        super(options)

        this.stats = {
            damageDealt: 0,
            damageTaken: 0,
            kills: 0,
            damageAbsorbed: 0,
            battlesSurvived: 0,
            friendlyFire: 0,
            entitiesConverted: 0
        }

        this.xp = 0
    }


    onInstall (host) {
        this.delegateTo(host, ['addStat', 'getStat', 'getXp', 'computeXp'])
    }


    addStat (key, amount = 1) {
        if (!(key in this.stats)) {
            return
        }

        this.stats[key] += amount
        this.computeXp()
    }


    getStat (key) {
        return this.stats[key] || 0
    }


    getXp () {
        return this.xp
    }


    computeXp () {
        let total = 0

        for (const [key, weight] of Object.entries(XP_WEIGHTS)) {
            total += (this.stats[key] || 0) * weight
        }

        this.xp = Math.max(0, total)
        return this.xp
    }

}
