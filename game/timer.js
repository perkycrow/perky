export default class Timer {

    constructor (duration = 0) {
        this.duration = duration
        this.value = 0
    }


    get active () {
        return this.value > 0
    }


    get progress () {
        if (this.duration <= 0) {
            return 0
        }
        return 1 - Math.max(0, this.value) / this.duration
    }


    get remaining () {
        if (this.duration <= 0) {
            return 0
        }
        return Math.max(0, this.value) / this.duration
    }


    reset (duration) {
        if (duration !== undefined) {
            this.duration = duration
        }
        this.value = this.duration
        return this
    }


    clear () {
        this.value = 0
        return this
    }


    update (deltaTime) {
        if (this.value <= 0) {
            return false
        }

        this.value -= deltaTime

        if (this.value <= 0) {
            this.value = 0
            return true
        }

        return false
    }

}
