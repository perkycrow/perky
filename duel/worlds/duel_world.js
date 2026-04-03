import World from '../../game/world.js'
import Fencer from '../entities/fencer.js'


const RESPAWN_DELAY = 1.5
const DEFAULT_CORRECTION_FACTOR = 0.3
const DEFAULT_CORRECTION_THRESHOLD = 0.5
const DEFAULT_SNAP_THRESHOLD = 3.0


export default class DuelWorld extends World {

    constructor (options = {}) {
        super(options)

        this.addTagsIndex(['fencer'])

        this.respawnTimer = 0
        this.respawning = false
        this.roundActive = true
        this.localFencerId = null
        this.authoritative = true
        this.correctionFactor = options.correctionFactor ?? DEFAULT_CORRECTION_FACTOR
        this.correctionThreshold = options.correctionThreshold ?? DEFAULT_CORRECTION_THRESHOLD
        this.snapThreshold = options.snapThreshold ?? DEFAULT_SNAP_THRESHOLD
    }


    applyNetworkInputs (inputs) {
        for (const [fencerId, input] of inputs) {
            const fencer = this[fencerId]
            if (!fencer) {
                continue
            }

            fencer.move(input.moveX)

            for (const action of input.actions) {
                applyAction(fencer, action)
            }
        }
    }


    preUpdate (deltaTime, context) {
        if (this.localFencerId) {
            readLocalInputs(this, context, this.localFencerId, 'p1Move')
        } else {
            readLocalInputs(this, context, 'fencer1', 'p1Move')
            readLocalInputs(this, context, 'fencer2', 'p2Move')
        }
    }


    importRemoteFencer (state) {
        const remoteId = this.localFencerId === 'fencer1' ? 'fencer2' : 'fencer1'

        if (state[remoteId] && this[remoteId]) {
            importFencer(this[remoteId], state[remoteId])
        }
    }


    correctLocalFencer (state) {
        const wasRespawning = this.respawning

        this.roundActive = state.roundActive
        this.respawning = state.respawning
        this.respawnTimer = state.respawnTimer

        if (wasRespawning && !this.respawning) {
            this.importState(state)
            return
        }

        const localId = this.localFencerId
        const fencer = this[localId]
        const authState = state[localId]

        if (fencer && authState) {
            fencer.stunned = authState.stunned
            fencer.stunTimer = authState.stunTimer
            fencer.score = authState.score
            fencer.alive = authState.alive
        }
    }


    exportState () {
        return {
            roundActive: this.roundActive,
            respawning: this.respawning,
            respawnTimer: this.respawnTimer,
            fencer1: exportFencer(this.fencer1),
            fencer2: exportFencer(this.fencer2)
        }
    }


    importState (state) {
        this.roundActive = state.roundActive
        this.respawning = state.respawning
        this.respawnTimer = state.respawnTimer

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
        if (!this.authoritative) {
            return
        }

        if (this.respawning) {
            updateRespawn(this, deltaTime)
            return
        }

        if (!this.roundActive) {
            return
        }

        checkSwordCollisions(this)
    }

}


function readLocalInputs (world, context, fencerId, directionAction) {
    const fencer = world[fencerId]
    if (fencer) {
        const dir = context.getDirection(directionAction)
        fencer.move(dir.x)
    }
}


function applyAction (fencer, action) {
    if (action === 'jump') {
        fencer.jump()
    } else if (action === 'lunge') {
        fencer.lunge()
    } else if (action === 'swordUp') {
        fencer.cycleSwordUp()
    } else if (action === 'swordDown') {
        fencer.cycleSwordDown()
    }
}


function checkSwordCollisions (world) {
    const f1 = world.fencer1
    const f2 = world.fencer2

    if (!canCheckCollisions(f1, f2)) {
        return
    }

    resolveHits(world, f1, f2)
}


function canCheckCollisions (f1, f2) {
    if (!f1 || !f2) {
        return false
    }

    return f1.alive && f2.alive && !f1.stunned && !f2.stunned
}


function resolveHits (world, f1, f2) {
    const hit1on2 = checkHit(f1, f2)
    const hit2on1 = checkHit(f2, f1)

    if (hit1on2 && hit2on1) {
        resolveMutualHit(world, f1, f2)
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


function resolveMutualHit (world, f1, f2) {
    if (f1.lunging && !f2.lunging) {
        scorePoint(world, f1, f2)
        return
    }

    if (f2.lunging && !f1.lunging) {
        scorePoint(world, f2, f1)
        return
    }

    f1.stun()
    f2.stun()
}


function checkHit (attacker, defender) {
    if (defender.lunging) {
        return false
    }

    const tipX = attacker.swordTipX
    const tipY = attacker.swordTipY
    const defenderCenterY = defender.y + 0.3

    const dx = tipX - defender.x
    const dy = tipY - defenderCenterY
    const distance = Math.sqrt(dx * dx + dy * dy)

    if (distance < defender.bodyRadius + 0.05) {
        const defenderFacingAttacker = defender.facing !== attacker.facing
        if (defenderFacingAttacker && defender.swordPosition === attacker.swordPosition && !defender.stunned) {
            return false
        }
        return true
    }

    return false
}


function scorePoint (world, scorer, loser) {
    const knockback = scorer.x < loser.x ? 1 : -1
    loser.stun(knockback)
    loser.alive = false
    scorer.score += 1

    world.emit('point:scored', {
        scorer: scorer.$id,
        loser: loser.$id,
        score1: world.fencer1.score,
        score2: world.fencer2.score
    })

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
