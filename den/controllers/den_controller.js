import GameController from '../../game/game_controller.js'


export default class DenController extends GameController {

    static bindings = {
        moveUp: ['KeyW', 'ArrowUp', 'swipeUp'],
        moveDown: ['KeyS', 'ArrowDown', 'swipeDown'],
        shoot: ['Space', 'tap']
    }

    static resources = ['world', 'denAudio']

    shoot () {
        const player = this.world.player

        if (!player.canShoot()) {
            return
        }

        player.shootCooldown = player.shootCooldownDuration
        player.shootRecoilTimer = player.shootRecoilDuration

        this.world.spawnProjectile({
            x: player.x + 0.3,
            y: player.y + 0.4
        })

        this.denAudio?.playShoot()
    }


    spawnPlayer (options = {}) {
        return this.world.spawnPlayer(options)
    }


    spawnPig (options = {}) {
        return this.world.spawnPig(options)
    }


    spawnRed (options = {}) {
        return this.world.spawnRed(options)
    }


    spawnGranny (options = {}) {
        return this.world.spawnGranny(options)
    }


    spawnAmalgam (options = {}) {
        return this.world.spawnAmalgam(options)
    }


    setFps (fps = 60) {
        this.game.setFpsLimited(true)
        this.game.setFps(fps)
    }


    toggleHitboxDebug () {
        return this.engine.stage?.toggleHitboxDebug()
    }

}
