import GameController from '../../game/game_controller.js'


export default class DuelController extends GameController {

    static bindings = {
        p1MoveLeft: ['KeyA'],
        p1MoveRight: ['KeyD'],
        p1Jump: ['KeyW'],
        p1Lunge: ['Space'],
        p1SwordUp: ['KeyE'],
        p1SwordDown: ['KeyQ'],

        p2MoveLeft: ['ArrowLeft'],
        p2MoveRight: ['ArrowRight'],
        p2Jump: ['ArrowUp'],
        p2Lunge: ['Enter'],
        p2SwordUp: ['Period'],
        p2SwordDown: ['Comma']
    }

    static resources = ['world']

    get session () {
        return this.engine?.stage?.session
    }


    get networkMode () {
        return this.session?.connected === true
    }


    p1Jump () {
        if (this.networkMode) {
            this.session.sendInput('jump')
            return
        }
        this.world.fencer1?.jump()
    }


    p1Lunge () {
        if (this.networkMode) {
            this.session.sendInput('lunge')
            return
        }
        this.world.fencer1?.lunge()
    }


    p1SwordUp () {
        if (this.networkMode) {
            this.session.sendInput('swordUp')
            return
        }
        this.world.fencer1?.cycleSwordUp()
    }


    p1SwordDown () {
        if (this.networkMode) {
            this.session.sendInput('swordDown')
            return
        }
        this.world.fencer1?.cycleSwordDown()
    }


    p2Jump () {
        if (this.networkMode) {
            return
        }
        this.world.fencer2?.jump()
    }


    p2Lunge () {
        if (this.networkMode) {
            return
        }
        this.world.fencer2?.lunge()
    }


    p2SwordUp () {
        if (this.networkMode) {
            return
        }
        this.world.fencer2?.cycleSwordUp()
    }


    p2SwordDown () {
        if (this.networkMode) {
            return
        }
        this.world.fencer2?.cycleSwordDown()
    }


    spawnFencer1 (options = {}) {
        return this.world.spawnFencer1(options)
    }


    spawnFencer2 (options = {}) {
        return this.world.spawnFencer2(options)
    }

}
