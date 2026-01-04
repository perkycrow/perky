import Group2D from '../render/group_2d.js'
import Circle from '../render/circle.js'


export default class HitboxDebug {

    constructor (world) {
        this.world = world
        this.enabled = false
        this.group = new Group2D({name: 'hitboxDebug'})
        this.visuals = new Map()
    }


    toggle () {
        this.enabled = !this.enabled

        if (!this.enabled) {
            this.clear()
        }

        return this.enabled
    }


    setEnabled (enabled) {
        this.enabled = enabled

        if (!this.enabled) {
            this.clear()
        }
    }


    clear () {
        for (const visual of this.visuals.values()) {
            for (const circle of visual) {
                this.group.remove(circle)
            }
        }
        this.visuals.clear()
    }


    update () {
        if (!this.enabled) {
            return
        }

        const entities = this.#getCollidableEntities()
        const currentIds = new Set()

        for (const entity of entities) {
            currentIds.add(entity.$id)
            this.#updateVisual(entity)
        }

        for (const [id, visual] of this.visuals) {
            if (!currentIds.has(id)) {
                for (const circle of visual) {
                    this.group.remove(circle)
                }
                this.visuals.delete(id)
            }
        }
    }


    #getCollidableEntities () {
        const entities = []

        const player = this.world.player
        if (player && player.alive !== false) {
            entities.push(player)
        }

        const enemies = this.world.childrenByTags('enemy')
        for (const enemy of enemies) {
            if (enemy.alive !== false) {
                entities.push(enemy)
            }
        }

        const projectiles = this.world.childrenByTags('projectile')
        for (const projectile of projectiles) {
            if (projectile.alive !== false) {
                entities.push(projectile)
            }
        }

        return entities
    }


    #updateVisual (entity) {
        let visual = this.visuals.get(entity.$id)

        if (!visual) {
            visual = this.#createVisual(entity)
            this.visuals.set(entity.$id, visual)
            for (const circle of visual) {
                this.group.addChild(circle)
            }
        }

        const hitbox = entity.hitbox
        const baseX = entity.x + hitbox.offsetX
        const baseY = entity.y + hitbox.offsetY

        if (hitbox.type === 'circle') {
            visual[0].x = baseX
            visual[0].y = baseY
        } else if (hitbox.type === 'capsule') {
            visual[0].x = baseX
            visual[0].y = entity.y + hitbox.topY
            visual[1].x = baseX
            visual[1].y = entity.y + hitbox.bottomY
        }
    }


    #createVisual (entity) {
        const hitbox = entity.hitbox
        const color = this.#getColorForEntity(entity)

        if (hitbox.type === 'circle') {
            return [this.#createCircle(hitbox.radius, color)]
        }

        if (hitbox.type === 'capsule') {
            return [
                this.#createCircle(hitbox.radius, color),
                this.#createCircle(hitbox.radius, color)
            ]
        }

        return []
    }


    #createCircle (radius, color) { // eslint-disable-line local/class-methods-use-this -- factory
        return new Circle({
            radius,
            color,
            strokeColor: color,
            strokeWidth: 0.02,
            anchorX: 0.5,
            anchorY: 0.5,
            opacity: 0.2
        })
    }


    #getColorForEntity (entity) {
        if (entity === this.world.player) {
            return '#00ff00'
        }

        if (entity.$tags?.includes('enemy')) {
            return '#ff0000'
        }

        if (entity.$tags?.includes('projectile')) {
            return entity.source === 'player' ? '#ffff00' : '#ff6600'
        }

        return '#ffffff'
    }

}
