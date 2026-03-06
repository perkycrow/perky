import GameController from '../../game/game_controller.js'


export default class GhastController extends GameController {

    static bindings = {
        moveUp: ['KeyW', 'ArrowUp', 'swipeUp'],
        moveDown: ['KeyS', 'ArrowDown', 'swipeDown'],
        moveLeft: ['KeyA', 'ArrowLeft', 'swipeLeft'],
        moveRight: ['KeyD', 'ArrowRight', 'swipeRight']
    }

    spawnShade (options = {}) {
        return this.world.spawnShade(options)
    }

    spawnSkeleton (options = {}) {
        return this.world.spawnSkeleton(options)
    }

    spawnRat (options = {}) {
        return this.world.spawnRat(options)
    }

    spawnInquisitor (options = {}) {
        return this.world.spawnInquisitor(options)
    }

    spawnSoul (options = {}) {
        return this.world.spawnSoul(options)
    }

    spawnCage (options = {}) {
        return this.world.spawnCage(options)
    }

    spawnTurret (options = {}) {
        return this.world.spawnTurret(options)
    }

    spawnJar (options = {}) {
        return this.world.spawnJar(options)
    }

}
