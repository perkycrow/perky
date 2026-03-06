import Component from './component.js'


export default class Health extends Component {

    constructor (options = {}) {
        super(options)

        const {hp = 3, maxHp} = options

        this.hp = hp
        this.maxHp = maxHp ?? hp
        this.invincibleTimer = 0
    }


    onInstall (host) {
        this.delegateTo(host, ['damage', 'heal', 'isAlive', 'isInvincible', 'updateHealth'])
    }


    isAlive () {
        return this.hp > 0
    }


    isInvincible () {
        return this.invincibleTimer > 0
    }


    damage (amount = 1, options = {}) {
        if (this.hp <= 0 || this.invincibleTimer > 0) {
            return false
        }

        this.hp = Math.max(0, this.hp - amount)

        const {invincibility = 0} = options

        if (invincibility > 0) {
            this.invincibleTimer = invincibility
        }

        this.host.emit('damaged', {amount, hp: this.hp})

        if (this.hp <= 0) {
            this.host.emit('death')
        }

        return true
    }


    heal (amount = 1) {
        if (this.hp <= 0) {
            return false
        }

        this.hp = Math.min(this.maxHp, this.hp + amount)
        this.host.emit('healed', {amount, hp: this.hp})

        return true
    }


    updateHealth (deltaTime) {
        if (this.invincibleTimer > 0) {
            this.invincibleTimer = Math.max(0, this.invincibleTimer - deltaTime)
        }
    }

}
