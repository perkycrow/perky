import EntityView from '../../game/entity_view.js'
import OutlineEffect from '../../render/shaders/builtin/effects/outline_effect.js'
import Circle from '../../render/circle.js'
import Group2D from '../../render/group_2d.js'
import {SPORE_TYPES} from '../spores.js'


const factionColors = {
    shadow: [0.5, 0.2, 1.0],
    light: [1.0, 0.2, 0.2],
    chaos: [0.2, 0.8, 0.3]
}

const DEATH_DURATION = 0.3
const LUNGE_DISTANCE = 0.25
const DOT_RADIUS = 0.05
const DOT_SPACING = 0.13
const DOT_Y_OFFSET = 0.55

const RANK_DOT_RADIUS = 0.03
const RANK_DOT_SPACING = 0.09
const RANK_DOT_Y = -0.55
const RANK_DOT_COLOR = '#d4a017'

const LEADER_DOT_RADIUS = 0.06
const LEADER_DOT_Y = 0.72
const LEADER_DOT_COLOR = '#d4a017'


export default class GhastView extends EntityView {

    constructor (entity, context) {
        super(entity, context)

        this.outlineEffect = null
        this.flashTimer = 0
        this.sporeGroup = null
        this.sporeDots = []
        this.lastSporeHash = ''
        this.rankDots = []
        this.lastRank = 0
        this.leaderDot = null
        this.wasLeader = false

        entity.on('damaged', () => {
            this.flashTimer = 0.15
        })
    }


    initRoot (sprite) {
        this.root = sprite

        this.outlineEffect = new OutlineEffect({
            width: 0,
            enabled: true
        })

        this.root.effects.add(this.outlineEffect)

        this.sporeGroup = new Group2D()
        this.context.group.add(this.sporeGroup)
    }


    dispose () {
        if (this.sporeGroup && this.context.group) {
            this.context.group.remove(this.sporeGroup)
        }
        this.sporeGroup = null
        this.sporeDots = []
        this.rankDots = []
        this.leaderDot = null
        super.dispose()
    }


    sync () {
        if (!this.root) {
            return
        }

        this.root.x = this.entity.x
        this.root.y = this.entity.y
        this.root.setDepth(-this.entity.y)

        if (this.entity.dying > 0) {
            this.#syncDying()
            return
        }

        this.root.setScale(1)
        this.root.opacity = 1

        this.#syncAttackLunge()
        this.#syncSpores()
        this.#syncRank()
        this.#syncLeader()
        this.#syncFlash()
        this.#syncOutline()
    }


    #syncDying () {
        const t = Math.max(0, this.entity.dying / DEATH_DURATION)
        this.root.setScale(t)
        this.root.opacity = t

        if (this.outlineEffect) {
            this.outlineEffect.width = 0
        }

        if (this.sporeGroup) {
            this.sporeGroup.visible = false
        }
    }


    #syncFlash () {
        if (this.flashTimer > 0) {
            this.flashTimer -= 1 / 60
            this.root.tint = [1, 1, 1, 0.6]
        } else if (this.root.tint) {
            this.root.tint = null
        }
    }


    #syncOutline () {
        if (!this.outlineEffect) {
            return
        }

        const faction = this.entity.faction

        if (!faction) {
            this.outlineEffect.width = 0
            return
        }

        const isLeader = this.entity.swarm?.leader === this.entity

        if (this.flashTimer > 0) {
            this.outlineEffect.width = 0.08
            this.outlineEffect.color = [1, 1, 1]
        } else {
            this.outlineEffect.width = isLeader ? 0.06 : 0.04
            this.outlineEffect.color = factionColors[faction] || [1, 1, 1]
        }
    }


    #syncRank () {
        if (!this.sporeGroup || this.entity.rank === undefined) {
            return
        }

        const rank = this.entity.rank

        if (rank === this.lastRank) {
            return
        }

        this.lastRank = rank
        this.#rebuildRankDots()
    }


    #rebuildRankDots () {
        for (const dot of this.rankDots) {
            this.sporeGroup.remove(dot)
        }
        this.rankDots = []

        const rank = this.entity.rank || 0

        if (rank <= 0) {
            return
        }

        const totalWidth = (rank - 1) * RANK_DOT_SPACING
        const startX = -totalWidth / 2

        for (let i = 0; i < rank; i++) {
            const circle = new Circle({
                radius: RANK_DOT_RADIUS,
                color: RANK_DOT_COLOR,
                x: startX + i * RANK_DOT_SPACING,
                y: RANK_DOT_Y
            })
            this.rankDots.push(circle)
            this.sporeGroup.add(circle)
        }
    }


    #syncLeader () {
        if (!this.sporeGroup || !this.entity.swarm) {
            return
        }

        const isLeader = this.entity.swarm.leader === this.entity

        if (isLeader === this.wasLeader) {
            return
        }

        this.wasLeader = isLeader

        if (isLeader && !this.leaderDot) {
            this.leaderDot = new Circle({
                radius: LEADER_DOT_RADIUS,
                color: LEADER_DOT_COLOR,
                x: 0,
                y: LEADER_DOT_Y
            })
            this.sporeGroup.add(this.leaderDot)
        } else if (!isLeader && this.leaderDot) {
            this.sporeGroup.remove(this.leaderDot)
            this.leaderDot = null
        }
    }


    #syncSpores () {
        if (!this.sporeGroup || !this.entity.spores) {
            return
        }

        this.sporeGroup.x = this.entity.x
        this.sporeGroup.y = this.entity.y
        this.sporeGroup.setDepth(-this.entity.y + 0.01)
        this.sporeGroup.visible = true

        const hash = sporeHash(this.entity.spores)

        if (hash !== this.lastSporeHash) {
            this.#rebuildSporeDots()
            this.lastSporeHash = hash
        }
    }


    #rebuildSporeDots () {
        for (const dot of this.sporeDots) {
            this.sporeGroup.remove(dot)
        }
        this.sporeDots = []

        const dots = []

        for (const sporeType of SPORE_TYPES) {
            const count = this.entity.spores[sporeType.key] || 0
            for (let i = 0; i < count; i++) {
                dots.push(sporeType.color)
            }
        }

        if (dots.length === 0) {
            return
        }

        const totalWidth = (dots.length - 1) * DOT_SPACING
        const startX = -totalWidth / 2

        for (let i = 0; i < dots.length; i++) {
            const circle = new Circle({
                radius: DOT_RADIUS,
                color: dots[i],
                x: startX + i * DOT_SPACING,
                y: DOT_Y_OFFSET
            })
            this.sporeDots.push(circle)
            this.sporeGroup.add(circle)
        }
    }


    #syncAttackLunge () {
        const entity = this.entity

        if (!entity.isAttacking?.()) {
            return
        }

        const comp = entity.components?.find(c => c.phase)

        if (!comp) {
            return
        }

        const dir = comp.attackDirection
        let offset = 0

        if (comp.phase === 'winding') {
            offset = -comp.attackProgress * LUNGE_DISTANCE * 0.3
        } else if (comp.phase === 'striking') {
            offset = (1 - comp.attackProgress) * LUNGE_DISTANCE
        }

        this.root.x += dir.x * offset
        this.root.y += dir.y * offset
    }

}


function sporeHash (spores) {
    let hash = ''
    for (const {key} of SPORE_TYPES) {
        hash += spores[key] || 0
    }
    return hash
}
