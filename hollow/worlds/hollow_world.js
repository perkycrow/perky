import World from '../../game/world.js'
import Survivor from '../entities/survivor.js'


export default class HollowWorld extends World {

    constructor (options = {}) {
        super(options)

        this.addTagsIndex(['survivor'])

        this.localSurvivorId = null
        this.authoritative = true
    }


    spawnSurvivor (options = {}) {
        return this.create(Survivor, {
            $id: options.$id || 'survivor',
            $bind: options.$bind,
            x: options.x ?? 0,
            y: options.y ?? 0,
            colorIndex: options.colorIndex ?? 0
        })
    }


    preUpdate (deltaTime, context) {
        if (!this.localSurvivorId || !context) {
            return
        }

        const survivor = this[this.localSurvivorId]

        if (survivor) {
            const dir = context.getDirection('move')
            survivor.move(dir.x, dir.y)
        }
    }


    exportState () {
        const state = {}

        for (const survivor of this.childrenByTags('survivor')) {
            state[survivor.$id] = exportSurvivor(survivor)
        }

        return state
    }


    importState (state) {
        for (const survivor of this.childrenByTags('survivor')) {
            if (state[survivor.$id]) {
                importSurvivor(survivor, state[survivor.$id])
            }
        }
    }


    importRemoteSurvivors (state) {
        for (const survivor of this.childrenByTags('survivor')) {
            if (survivor.$id === this.localSurvivorId) {
                continue
            }

            if (state[survivor.$id]) {
                importSurvivor(survivor, state[survivor.$id])
            }
        }
    }


    correctLocalSurvivor (state) {
        const survivor = this[this.localSurvivorId]
        const authState = state[this.localSurvivorId]

        if (survivor && authState) {
            survivor.alive = authState.alive
        }
    }

}


function exportSurvivor (survivor) {
    return {
        x: survivor.x,
        y: survivor.y,
        vx: survivor.velocity.x,
        vy: survivor.velocity.y,
        alive: survivor.alive,
        moveDirection: {...survivor.moveDirection}
    }
}


function importSurvivor (survivor, state) {
    survivor.x = state.x
    survivor.y = state.y
    survivor.velocity.x = state.vx
    survivor.velocity.y = state.vy
    survivor.alive = state.alive
    survivor.moveDirection.x = state.moveDirection.x
    survivor.moveDirection.y = state.moveDirection.y
}
