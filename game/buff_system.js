import Component from './component.js'


export default class BuffSystem extends Component {

    constructor (options = {}) {
        super(options)
        this.buffs = new Map()
    }


    onInstall (host) {
        this.delegateTo(host, ['applyBuff', 'removeBuff', 'hasBuff', 'getBuffModifier', 'updateBuffs', 'clearBuffs'])
    }


    applyBuff (key, duration, modifiers = {}) {
        const existing = this.buffs.get(key)

        if (existing) {
            existing.remaining = existing.duration
            existing.modifiers = modifiers
            return existing
        }

        const buff = {key, duration, remaining: duration, modifiers}
        this.buffs.set(key, buff)
        this.host.emit('buff:applied', buff)
        return buff
    }


    removeBuff (key) {
        const buff = this.buffs.get(key)

        if (!buff) {
            return false
        }

        this.buffs.delete(key)
        this.host.emit('buff:expired', buff)
        return true
    }


    hasBuff (key) {
        return this.buffs.has(key)
    }


    getBuffModifier (stat) {
        let result = 1

        for (const buff of this.buffs.values()) {
            if (stat in buff.modifiers) {
                result *= buff.modifiers[stat]
            }
        }

        return result
    }


    updateBuffs (deltaTime) {
        for (const [key, buff] of this.buffs) {
            if (buff.duration < 0) {
                continue
            }

            buff.remaining -= deltaTime

            if (buff.remaining <= 0) {
                this.buffs.delete(key)
                this.host.emit('buff:expired', buff)
            }
        }
    }


    clearBuffs () {
        this.buffs.clear()
    }

}
