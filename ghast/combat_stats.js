import Component from '../game/component.js'
import {XP_WEIGHTS, RANK_THRESHOLDS} from './xp_config.js'


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
        this.delegateTo(host, ['addStat', 'getStat', 'getXp', 'computeXp', 'checkRankUp'])
    }


    addStat (key, amount = 1) {
        if (!(key in this.stats)) {
            return
        }

        this.stats[key] += amount
        this.computeXp()
        this.checkRankUp()
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

        const baseRank = this.host?.baseRank || 1
        total += RANK_THRESHOLDS[baseRank - 1] || 0

        this.xp = Math.max(0, total)
        return this.xp
    }


    checkRankUp () {
        const entity = this.host

        if (!entity) {
            return false
        }

        let newRank = 1

        for (let i = RANK_THRESHOLDS.length - 1; i >= 0; i--) {
            if (this.xp >= RANK_THRESHOLDS[i]) {
                newRank = i + 1
                break
            }
        }

        if (newRank > entity.rank) {
            const oldRank = entity.rank
            entity.rank = newRank
            entity.host?.emit('rank_up', {entity, oldRank, newRank})
            return true
        }

        return false
    }

}
