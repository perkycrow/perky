import World from '../../game/world.js'
import Fencer from '../entities/fencer.js'


const RESPAWN_DELAY = 1.5
const SCORE_TO_WIN = 5


export default class DuelWorld extends World {

    constructor (options = {}) {
        super(options)

        this.addTagsIndex(['fencer'])

        this.respawnTimer = 0
        this.respawning = false
        this.roundActive = true
        this.gameOver = false
        this.networkMode = false
        this.networkInputs = new Map()
    }


    applyNetworkInputs (inputs) {
        for (const [fencerId, input] of inputs) {
            const fencer = this[fencerId]
            if (!fencer) {
                continue
            }

            fencer.move(input.moveX)

            for (const action of input.actions) {
                if (action === 'jump') fencer.jump()
                else if (action === 'lunge') fencer.lunge()
                else if (action === 'swordUp') fencer.cycleSwordUp()
                else if (action === 'swordDown') fencer.cycleSwordDown()
            }
        }
    }


    preUpdate (deltaTime, context) {
        if (this.networkMode) {
            return
        }

        if (this.fencer1) {
            const p1Dir = context.getDirection('p1Move')
            this.fencer1.move(p1Dir.x)
        }

        if (this.fencer2) {
            const p2Dir = context.getDirection('p2Move')
            this.fencer2.move(p2Dir.x)
        }
    }


    exportState () {
        return {
            roundActive: this.roundActive,
            respawning: this.respawning,
            respawnTimer: this.respawnTimer,
            gameOver: this.gameOver,
            fencer1: exportFencer(this.fencer1),
            fencer2: exportFencer(this.fencer2)
        }
    }


    importState (state) {
        this.roundActive = state.roundActive
        this.respawning = state.respawning
        this.respawnTimer = state.respawnTimer
        this.gameOver = state.gameOver

        if (state.fencer1 && this.fencer1) {
            importFencer(this.fencer1, state.fencer1)
        }
        if (state.fencer2 && this.fencer2) {
            importFencer(this.fencer2, state.fencer2)
        }
    }


    spawnFencer1 (options = {}) {
        return this.create(Fencer, {
            $id: 'fencer1',
            $bind: 'fencer1',
            x: options.x ?? -3,
            y: 0,
            facing: 1
        })
    }


    spawnFencer2 (options = {}) {
        return this.create(Fencer, {
            $id: 'fencer2',
            $bind: 'fencer2',
            x: options.x ?? 3,
            y: 0,
            facing: -1
        })
    }


    postUpdate (deltaTime) {
        if (this.gameOver) {
            return
        }

        updateFacing(this)

        if (this.respawning) {
            updateRespawn(this, deltaTime)
            return
        }

        if (this.roundActive) {
            checkSwordCollisions(this)
        }
    }

}


function updateFacing (world) {
    const f1 = world.fencer1
    const f2 = world.fencer2

    if (!f1 || !f2) {
        return
    }

    f1.faceOpponent(f2.x)
    f2.faceOpponent(f1.x)
}


function checkSwordCollisions (world) {
    const f1 = world.fencer1
    const f2 = world.fencer2

    if (!f1 || !f2 || f1.stunned || f2.stunned) {
        return
    }

    const hit1on2 = checkHit(f1, f2)
    const hit2on1 = checkHit(f2, f1)

    if (hit1on2 && hit2on1) {
        f1.stun()
        f2.stun()
        return
    }

    if (hit1on2) {
        scorePoint(world, f1, f2)
        return
    }

    if (hit2on1) {
        scorePoint(world, f2, f1)
    }
}


function checkHit (attacker, defender) {
    if (!attacker.lunging) {
        return false
    }

    const tipX = attacker.swordTipX
    const tipY = attacker.swordTipY
    const defenderCenterY = defender.y + 0.3

    const dx = tipX - defender.x
    const dy = tipY - defenderCenterY
    const distance = Math.sqrt(dx * dx + dy * dy)

    if (distance < defender.bodyRadius + 0.05) {
        if (defender.swordPosition === attacker.swordPosition && !defender.stunned) {
            return false
        }
        return true
    }

    return false
}


function scorePoint (world, scorer, loser) {
    loser.stun()
    scorer.score += 1

    world.emit('point:scored', {
        scorer: scorer.$id,
        loser: loser.$id,
        score1: world.fencer1.score,
        score2: world.fencer2.score
    })

    if (scorer.score >= SCORE_TO_WIN) {
        world.gameOver = true
        world.emit('game:over', {winner: scorer.$id})
        return
    }

    world.respawning = true
    world.respawnTimer = RESPAWN_DELAY
    world.roundActive = false
}


function updateRespawn (world, deltaTime) {
    world.respawnTimer -= deltaTime
    if (world.respawnTimer <= 0) {
        world.fencer1.respawn(-3)
        world.fencer2.respawn(3)
        world.respawning = false
        world.roundActive = true
        world.emit('round:start')
    }
}


function exportFencer (fencer) {
    if (!fencer) {
        return null
    }
    return {
        x: fencer.x,
        y: fencer.y,
        vx: fencer.velocity.x,
        vy: fencer.velocity.y,
        facing: fencer.facing,
        swordPosition: fencer.swordPosition,
        lunging: fencer.lunging,
        lungeTimer: fencer.lungeTimer,
        stunned: fencer.stunned,
        stunTimer: fencer.stunTimer,
        grounded: fencer.grounded,
        score: fencer.score,
        alive: fencer.alive
    }
}


function importFencer (fencer, state) {
    fencer.x = state.x
    fencer.y = state.y
    fencer.velocity.x = state.vx
    fencer.velocity.y = state.vy
    fencer.facing = state.facing
    fencer.swordPosition = state.swordPosition
    fencer.lunging = state.lunging
    fencer.lungeTimer = state.lungeTimer
    fencer.stunned = state.stunned
    fencer.stunTimer = state.stunTimer
    fencer.grounded = state.grounded
    fencer.score = state.score
    fencer.alive = state.alive
}
