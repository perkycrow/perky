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

    p1Jump () {
        this.world.fencer1?.jump()
    }


    p1Lunge () {
        this.world.fencer1?.lunge()
    }


    p1SwordUp () {
        this.world.fencer1?.cycleSwordUp()
    }


    p1SwordDown () {
        this.world.fencer1?.cycleSwordDown()
    }


    p2Jump () {
        this.world.fencer2?.jump()
    }


    p2Lunge () {
        this.world.fencer2?.lunge()
    }


    p2SwordUp () {
        this.world.fencer2?.cycleSwordUp()
    }


    p2SwordDown () {
        this.world.fencer2?.cycleSwordDown()
    }


    spawnFencer1 (options = {}) {
        return this.world.spawnFencer1(options)
    }


    spawnFencer2 (options = {}) {
        return this.world.spawnFencer2(options)
    }

}
