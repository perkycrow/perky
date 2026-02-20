import World from '../../game/world.js'
import skillFactory from '../factories/main_skill_factory.js'
import artifactFactory from '../factories/main_artifact_factory.js'
import Chapter1 from '../chapters/story_1_chapter.js'
import Board from '../entities/board.js'
import Reagent from '../entities/reagent.js'
import LabPanel from '../entities/lab_panel.js'
import ArsenalPanel from '../entities/arsenal_panel.js'
import Notebook from '../entities/notebook.js'


const GRAVITY_DELAY = 200
const DEPOP_DELAY = 380
const POP_DELAY = 330

const ARSENAL_OFFSET_X = -3
const ARSENAL_OFFSET_Y = -3

const SKILL_HITBOX_WIDTH = 1.5
const SKILL_HITBOX_HEIGHT = 1.5
const SKILL_OFFSET_X = -1.4
const SKILL_OFFSET_Y = 1.25
const SKILL_SPACING = 1.5


export default class ChapterWorld extends World {

    #board = null
    #boardEntities = null
    #clusterReagent0 = null
    #clusterReagent1 = null
    #labPanel = null
    #arsenalPanel = null
    #notebook = null
    #hoveredSkillIndex = -1

    init () {
        this.#boardEntities = new Map()

        this.#board = this.create(Board, {x: -3, y: -3.5})
        this.#board.initGame({
            lab: {
                reagentsCount: Chapter1.reagentsCount,
                unlockedCount: Chapter1.unlockedCount,
                startsAt: Chapter1.startsAt
            },
            arsenal: {
                skills: [
                    {id: 'madness'},
                    {id: 'ruin'},
                    {id: 'contagion'}
                ]
            }
        }, {skillFactory, artifactFactory})

        this.#clusterReagent0 = this.#board.workshop.create(Reagent, {active: false})
        this.#clusterReagent1 = this.#board.workshop.create(Reagent, {active: false})

        const lab = this.#board.lab
        this.#labPanel = this.create(LabPanel, {
            x: 7.5,
            y: 5,
            reagentNames: lab.reagents,
            unlockedCount: lab.unlockedCount
        })

        const skills = this.#board.arsenal?.skills || []

        if (skills.length > 0) {
            this.#arsenalPanel = this.create(ArsenalPanel, {
                x: ARSENAL_OFFSET_X,
                y: ARSENAL_OFFSET_Y,
                skills
            })

            this.#notebook = this.create(Notebook, {
                x: -9,
                y: -2
            })
        }

        this.#initAnimationHooks()
        this.#board.actionSet.trigger('start')
    }


    async gameAction (name, ...args) {
        return this.#board.triggerUserAction(name, ...args)
    }


    get skills () {
        return this.#board?.arsenal?.skills || []
    }


    syncBoard () {
        const board = this.#board

        if (!board || !board.playing) {
            return
        }

        this.syncBoardEntities()
        this.syncClusterEntities()
        this.syncLabPanel()
    }


    getSkillIndexAt (worldX, worldY) {
        const skills = this.skills

        if (skills.length === 0 || !this.#arsenalPanel) {
            return -1
        }

        const localX = worldX - ARSENAL_OFFSET_X
        const localY = worldY - ARSENAL_OFFSET_Y

        for (let i = 0; i < skills.length; i++) {
            const skillX = SKILL_OFFSET_X
            const skillY = -i * SKILL_SPACING + SKILL_OFFSET_Y
            const halfW = SKILL_HITBOX_WIDTH / 2
            const halfH = SKILL_HITBOX_HEIGHT / 2

            if (localX >= skillX - halfW && localX <= skillX + halfW &&
                localY >= skillY - halfH && localY <= skillY + halfH) {
                return i
            }
        }

        return -1
    }


    skillMouseIn (skillIndex) {
        if (this.#hoveredSkillIndex === skillIndex) {
            return
        }

        this.#hoveredSkillIndex = skillIndex
        const skills = this.skills

        if (this.#notebook && skillIndex >= 0 && skillIndex < skills.length) {
            this.#notebook.currentSkill = skills[skillIndex]
            this.#notebook.opened = true
        }
    }


    skillMouseOut () {
        if (this.#hoveredSkillIndex === -1) {
            return
        }

        this.#hoveredSkillIndex = -1

        if (this.#notebook) {
            this.#notebook.opened = false
            this.#notebook.currentSkill = null
        }
    }


    syncBoardEntities () {
        const board = this.#board
        const seen = new Set()
        const spawnY = board.height + 0.5

        for (const reagent of board.toArray()) {
            seen.add(reagent)

            let entity = this.#boardEntities.get(reagent)

            const localX = reagent.x + 0.5
            const localY = reagent.y + 0.5

            if (!entity) {
                entity = this.#board.create(Reagent, {
                    x: localX,
                    y: spawnY,
                    name: reagent.name
                })
                this.#boardEntities.set(reagent, entity)
            }

            if (!entity.merging) {
                entity.x = localX
                entity.y = localY
                entity.name = reagent.name
            }
        }

        for (const [reagent, entity] of this.#boardEntities) {
            if (!seen.has(reagent)) {
                this.#board.removeChild(entity.$id)
                this.#boardEntities.delete(reagent)
            }
        }
    }


    syncLabPanel () {
        if (this.#labPanel && this.#board.lab) {
            this.#labPanel.unlockedCount = this.#board.lab.unlockedCount
        }
    }


    syncClusterEntities () {
        const board = this.#board
        const workshop = board.workshop
        const cluster = workshop.currentCluster
        const clusterReagents = cluster?.reagents || []
        const entities = [this.#clusterReagent0, this.#clusterReagent1]
        const yOffset = cluster ? board.height - cluster.height : 0

        for (let i = 0; i < entities.length; i++) {
            const entity = entities[i]
            const reagent = clusterReagents[i]

            if (reagent) {
                entity.x = reagent.x + 0.5
                entity.y = (yOffset + reagent.y) + 0.5
                entity.name = reagent.name
                entity.active = true
            } else {
                entity.active = false
            }
        }
    }


    #initAnimationHooks () {
        const board = this.#board

        board.actionSet.hook('applyGravity', async () => {
            await delay(GRAVITY_DELAY)
        })

        board.actionSet.hook('mergeReagents', async (flow, merge) => {
            this.syncBoardEntities()

            const {reagents, first} = merge
            const targetX = first.x + 0.5
            const targetY = first.y + 0.5

            const firstEntity = this.#boardEntities.get(first)
            if (firstEntity) {
                firstEntity.absorbing = true
            }

            for (const reagent of reagents) {
                const entity = this.#boardEntities.get(reagent)
                if (entity) {
                    entity.merging = true
                    entity.x = targetX
                    entity.y = targetY
                }
            }

            await delay(DEPOP_DELAY)
        })

        board.actionSet.hook('evolveReagents', async () => {
            await delay(POP_DELAY)
        })
    }

}


function delay (ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}
