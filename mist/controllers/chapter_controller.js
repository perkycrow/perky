import GameController from '../../game/game_controller.js'


export default class ChapterController extends GameController {

    static bindings = {
        moveLeft:       ['ArrowLeft', 'KeyA'],
        moveRight:      ['ArrowRight', 'KeyD'],
        rotateCluster:  ['ArrowUp', 'KeyW', 'Space'],
        dropCluster:    ['ArrowDown', 'KeyS'],
        activateSkill0: ['Digit1'],
        activateSkill1: ['Digit2'],
        activateSkill2: ['Digit3']
    }

    moveLeft () {
        this.world.gameAction('moveCluster', 'left')
    }


    moveRight () {
        this.world.gameAction('moveCluster', 'right')
    }


    rotateCluster () {
        this.world.gameAction('rotateCluster')
    }


    dropCluster () {
        this.world.gameAction('dropCluster')
    }


    activateSkill0 () {
        this.#activateSkill(0)
    }


    activateSkill1 () {
        this.#activateSkill(1)
    }


    activateSkill2 () {
        this.#activateSkill(2)
    }


    #activateSkill (index) {
        const skills = this.world.skills

        if (index < skills.length) {
            this.world.gameAction('activateSkill', skills[index].id)
        }
    }

}
