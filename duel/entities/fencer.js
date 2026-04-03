import Entity from '../../game/entity.js'
import Velocity from '../../game/velocity.js'


const SWORD_HIGH = 'high'
const SWORD_MID = 'mid'
const SWORD_LOW = 'low'
const SWORD_POSITIONS = [SWORD_HIGH, SWORD_MID, SWORD_LOW]

const GROUND_Y = 0
const GRAVITY = -18
const JUMP_FORCE = 8
const MOVE_SPEED = 4
const SWORD_LENGTH = 0.8
const BODY_RADIUS = 0.3
const BODY_CENTER_Y = 0.3
const LUNGE_SPEED = 6
const LUNGE_DURATION = 0.15
const HIT_STUN_DURATION = 0.6
const ARENA_MIN_X = -6.5
const ARENA_MAX_X = 6.5


export default class Fencer extends Entity {

    static $tags = ['fencer']

    constructor (params = {}) {
        super(params)

        this.create(Velocity)

        this.facing = params.facing || 1
        this.swordPosition = SWORD_MID
        this.bodyRadius = BODY_RADIUS
        this.swordLength = SWORD_LENGTH

        this.grounded = true
        this.lunging = false
        this.lungeTimer = 0
        this.stunned = false
        this.stunTimer = 0
        this.alive = true
        this.score = 0

        this.moveDirection = 0
    }


    get swordTipX () {
        return this.x + this.facing * (this.bodyRadius + this.swordLength)
    }


    get swordTipY () {
        return this.y + BODY_CENTER_Y + swordOffsetY(this.swordPosition)
    }


    get swordBaseX () {
        return this.x + this.facing * this.bodyRadius
    }


    get swordBaseY () {
        return this.swordTipY
    }


    move (direction) {
        if (this.stunned || !this.alive) {
            return
        }

        this.moveDirection = direction

        if (direction !== 0) {
            this.facing = direction > 0 ? 1 : -1
        }
    }


    jump () {
        if (!this.grounded || this.stunned) {
            return
        }
        this.velocity.y = JUMP_FORCE
        this.grounded = false
    }


    setSwordPosition (position) {
        if (SWORD_POSITIONS.includes(position) && !this.stunned) {
            this.swordPosition = position
        }
    }


    cycleSwordUp () {
        if (this.stunned) {
            return
        }
        const index = SWORD_POSITIONS.indexOf(this.swordPosition)
        if (index > 0) {
            this.swordPosition = SWORD_POSITIONS[index - 1]
        }
    }


    cycleSwordDown () {
        if (this.stunned) {
            return
        }
        const index = SWORD_POSITIONS.indexOf(this.swordPosition)
        if (index < SWORD_POSITIONS.length - 1) {
            this.swordPosition = SWORD_POSITIONS[index + 1]
        }
    }


    lunge () {
        if (this.lunging || this.stunned) {
            return
        }
        this.lunging = true
        this.lungeTimer = LUNGE_DURATION
        this.velocity.x = this.facing * LUNGE_SPEED
    }


    stun (knockbackDirection) {
        this.stunned = true
        this.stunTimer = HIT_STUN_DURATION
        this.lunging = false
        this.velocity.x = (knockbackDirection || -this.facing) * 3
        this.velocity.y = 2
        this.grounded = false
    }


    faceOpponent (opponentX) {
        if (opponentX > this.x) {
            this.facing = 1
        } else if (opponentX < this.x) {
            this.facing = -1
        }
    }


    respawn (x) {
        this.x = x
        this.y = GROUND_Y
        this.velocity.x = 0
        this.velocity.y = 0
        this.stunned = false
        this.stunTimer = 0
        this.lunging = false
        this.lungeTimer = 0
        this.grounded = true
        this.swordPosition = SWORD_MID
        this.alive = true
    }


    update (deltaTime) {
        updateStun(this, deltaTime)
        updateLunge(this, deltaTime)
        applyMovement(this)
        applyGravity(this, deltaTime)
        this.applyVelocity(deltaTime)
        clampToArena(this)
        checkGround(this)
    }

}


function swordOffsetY (position) {
    if (position === SWORD_HIGH) {
        return 0.2
    }
    if (position === SWORD_MID) {
        return 0
    }
    return -0.2
}


function updateStun (fencer, deltaTime) {
    if (!fencer.stunned) {
        return
    }
    fencer.stunTimer -= deltaTime
    if (fencer.stunTimer <= 0) {
        fencer.stunned = false
    }
}


function updateLunge (fencer, deltaTime) {
    if (!fencer.lunging) {
        return
    }
    fencer.lungeTimer -= deltaTime
    if (fencer.lungeTimer <= 0) {
        fencer.lunging = false
    }
}


function applyMovement (fencer) {
    if (fencer.stunned || fencer.lunging) {
        return
    }
    fencer.velocity.x = fencer.moveDirection * MOVE_SPEED
}


function applyGravity (fencer, deltaTime) {
    if (!fencer.grounded) {
        fencer.velocity.y += GRAVITY * deltaTime
    }
}


function clampToArena (fencer) {
    if (fencer.x < ARENA_MIN_X) {
        fencer.x = ARENA_MIN_X
        fencer.velocity.x = 0
    } else if (fencer.x > ARENA_MAX_X) {
        fencer.x = ARENA_MAX_X
        fencer.velocity.x = 0
    }
}


function checkGround (fencer) {
    if (fencer.y <= GROUND_Y) {
        fencer.y = GROUND_Y
        fencer.velocity.y = 0
        fencer.grounded = true
    }
}
