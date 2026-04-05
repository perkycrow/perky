import Entity from '../../game/entity.js'
import {SPORE_DEFINITIONS} from '../spores/index.js'


const DEFAULT_STOCK = 2
const SPAWN_INTERVAL = 3


export default class Shroom extends Entity {

    constructor (params = {}) {
        super(params)

        this.sporeType = params.sporeType || 'fear'
        this.stock = params.stock ?? DEFAULT_STOCK
        this.spawnInterval = params.spawnInterval ?? SPAWN_INTERVAL
        this.spawnTimer = this.spawnInterval * 0.5
    }


    get sporeColor () {
        return SPORE_DEFINITIONS[this.sporeType]?.color || '#ffffff'
    }


    get depleted () {
        return this.stock <= 0
    }


    update (deltaTime) {
        if (this.depleted) {
            return
        }

        this.spawnTimer -= deltaTime

        if (this.spawnTimer <= 0) {
            this.spawnTimer += this.spawnInterval
            this.stock--
            this.emit('spawn_spore', {sporeType: this.sporeType, x: this.x, y: this.y})

            if (this.depleted) {
                this.emit('depleted')
            }
        }
    }

}
