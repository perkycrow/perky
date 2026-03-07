import World from '../game/world.js'
import Swarm from './swarm.js'
import Battle from './battle.js'
import Shade from './entities/shade.js'
import Skeleton from './entities/skeleton.js'
import Rat from './entities/rat.js'
import Inquisitor from './entities/inquisitor.js'
import Cage from './entities/cage.js'
import Turret from './entities/turret.js'
import Jar from './entities/jar.js'
import Projectile from './entities/projectile.js'
import BUFF_DEFINITIONS from './buff_definitions.js'
import {applySporeReactions, applySwarmReaction} from './spore_reactions.js'
import {getSporeModifier} from './spore_effects.js'
import updateDecisions from './decision_loop.js'


export default class GhastWorld extends World {

    constructor (options = {}) {
        super(options)

        this.paused = true
        this.swarms = []
        this.battles = []

        this.on('hit', ({target, source, damage}) => {
            this.#applyHit(target, source, damage)
        })

        this.on('kill', ({killer}) => {
            this.#trackStat(killer, 'kills', 1, 'kill')

            if (killer?.swarm) {
                killer.swarm.recentKills++
                killer.swarm.adjustMorale(5)
            }
        })

        this.on('battle_resolved', ({battle, winner}) => {
            this.#trackBattleSurvived(battle, winner)

            for (const swarm of battle.swarms) {
                swarm.adjustMorale(swarm.faction === winner ? 15 : -15)
            }
        })

        this.on('ally_died', ({swarm}) => {
            swarm.recentLosses++
            swarm.adjustMorale(-8)

            for (const member of swarm.members) {
                if (!member.dying) {
                    applySporeReactions(member, 'ally_died')
                }
            }
        })

        this.on('kill', ({killer}) => {
            applySporeReactions(killer, 'kill')
        })

        this.on('low_hp', ({entity}) => {
            applySporeReactions(entity, 'low_hp')
        })

        this.on('surrounded', ({entity}) => {
            applySporeReactions(entity, 'surrounded')
        })

        this.on('isolated', ({entity}) => {
            applySporeReactions(entity, 'isolated')
        })

        this.on('first_blood', ({source}) => {
            applySporeReactions(source, 'first_blood')
        })

        this.on('leader_died', ({swarm}) => {
            swarm.adjustMorale(-12)
            applySwarmReaction(swarm, 'disarray')
            swarm._leaderDied = true
        })
    }


    togglePause () {
        this.paused = !this.paused
        return this.paused
    }


    update (deltaTime, context) {
        if (!this.started || this.paused) {
            return
        }

        this.preUpdate(deltaTime, context)

        for (const entity of this.entities) {
            if (entity.started && !entity.dying) {
                entity.update(deltaTime)
            }
        }

        this.postUpdate(deltaTime, context)
    }


    preUpdate (deltaTime) {
        updateDecisions(this, deltaTime)

        for (const entity of this.entities) {
            if (!entity.faction || entity.dying) {
                continue
            }

            this.#checkSurrounded(entity)
            this.#checkIsolated(entity)
        }

        this.#checkOutnumbered()
    }


    postUpdate (deltaTime) {
        this.#checkProjectileHits()
        this.#updateDying(deltaTime)
        this.#cleanupSwarms()
        this.#applyLeaderPromotions()
        this.#updateBuffs(deltaTime)
        this.#updateBattles(deltaTime)
        this.#cleanupBattles()
        this.#cleanup()
    }


    #checkProjectileHits () {
        for (const entity of this.entities) {
            if (!(entity instanceof Projectile) || !entity.alive) {
                continue
            }

            const hit = this.checkHit(entity, e => {
                if (e instanceof Projectile) {
                    return false
                }
                if (!e.faction || e.faction === entity.faction) {
                    return false
                }
                if (e === entity.source) {
                    return false
                }
                return e.hitRadius > 0
            })

            if (hit) {
                entity.alive = false
                this.emit('hit', {source: entity.source, target: hit, projectile: entity, damage: entity.damage})
            }
        }
    }


    #applyHit (target, source, baseDamage = 1) {
        if (!target.damage) {
            return
        }

        const effectiveDamage = computeEffectiveDamage(source, baseDamage)
        const dealt = target.damage(effectiveDamage, {invincibility: 0.3})

        if (!dealt) {
            return
        }

        this.#trackDamage(source, target)
        this.#emitFirstBlood(source, target)
        applyKnockback(target, source)

        if (target.isAlive() && target.hp <= target.maxHp * 0.3 && !target._lowHp) {
            target._lowHp = true
            this.emit('low_hp', {entity: target, source})
        }

        if (!target.isAlive()) {
            target.dying = 0.3
            target.hitRadius = 0
            this.#clearTargetsOn(target)
            this.#emitDeathEvents(target, source)
        }
    }


    #emitFirstBlood (source, target) {
        const battle = this.#ensureBattle(source, target)

        if (battle && !battle.firstBlood) {
            battle.firstBlood = true
            this.emit('first_blood', {source, target, battle})
        }
    }


    #emitDeathEvents (victim, killer) {
        if (killer) {
            this.emit('kill', {killer, victim})
        }

        if (victim.swarm) {
            const wasLeader = victim.swarm.leader === victim

            for (const member of victim.swarm.members) {
                if (member !== victim && !member.dying) {
                    member.emit('ally_died', {ally: victim, killer})
                }
            }

            this.emit('ally_died', {entity: victim, swarm: victim.swarm, killer})

            if (wasLeader) {
                this.emit('leader_died', {entity: victim, swarm: victim.swarm, killer})
            }
        }
    }


    #clearTargetsOn (deadEntity) {
        for (const entity of this.entities) {
            if (entity.target === deadEntity) {
                entity.target = null
            }
        }
    }


    #trackDamage (source, target) {
        if (source?.addStat) {
            const isFriendly = source.faction && source.faction === target.faction
            this.#trackStat(source, isFriendly ? 'friendlyFire' : 'damageDealt', 1, 'damage')
        }

        if (target?.addStat) {
            target.addStat('damageTaken', 1)
        }
    }


    #trackStat (entity, key, amount, source) {
        if (!entity?.addStat) {
            return
        }

        const oldXp = entity.getXp()
        entity.addStat(key, amount)
        const gained = entity.getXp() - oldXp

        if (gained > 0) {
            this.emit('xp_gained', {entity, amount: gained, source})

            if (entity.swarm) {
                entity.swarm.addXp(gained)
            }
        }
    }


    #trackBattleSurvived (battle, winner) {
        if (!winner) {
            return
        }

        for (const swarm of battle.swarms) {
            if (swarm.faction !== winner) {
                continue
            }

            for (const member of swarm.members) {
                if (!member.dying) {
                    this.#trackStat(member, 'battlesSurvived', 1, 'battle')
                }
            }
        }
    }


    #checkSurrounded (entity) {
        const enemies = this.entitiesInRange(entity, 2, e => e.faction && e.faction !== entity.faction && !e.dying)
        const wasSurrounded = entity._surrounded || false
        entity._surrounded = enemies.length >= 3

        if (entity._surrounded && !wasSurrounded) {
            this.emit('surrounded', {entity, enemies})
        }
    }


    #checkIsolated (entity) {
        if (!entity.swarm || entity.swarm.members.length <= 1) {
            entity._isolated = false
            return
        }

        const center = entity.swarm.getCenter()

        if (!center) {
            entity._isolated = false
            return
        }

        const dist = entity.position.distanceTo(center)
        const wasIsolated = entity._isolated || false
        entity._isolated = dist > entity.swarm.leashRadius * 1.5

        if (entity._isolated && !wasIsolated) {
            this.emit('isolated', {entity, swarm: entity.swarm})
        }
    }


    #checkOutnumbered () {
        for (const battle of this.battles) {
            for (const swarm of battle.swarms) {
                this.#checkSwarmOutnumbered(swarm, battle)
            }
        }
    }


    #checkSwarmOutnumbered (swarm, battle) {
        const alive = swarm.members.filter(m => !m.dying)

        if (alive.length === 0) {
            swarm._outnumbered = false
            return
        }

        let enemyCount = 0

        for (const other of battle.swarms) {
            if (other.faction !== swarm.faction) {
                enemyCount += other.members.filter(m => !m.dying).length
            }
        }

        const wasOutnumbered = swarm._outnumbered || false
        swarm._outnumbered = enemyCount > alive.length * 1.5

        if (swarm._outnumbered && !wasOutnumbered) {
            this.emit('outnumbered', {swarm, allyCount: alive.length, enemyCount, battle})
        }
    }


    #ensureBattle (source, target) {
        const swarmA = source?.swarm
        const swarmB = target?.swarm

        if (!swarmA || !swarmB || swarmA.faction === swarmB.faction) {
            return null
        }

        const battleA = this.battles.find(b => b.hasSwarm(swarmA))
        const battleB = this.battles.find(b => b.hasSwarm(swarmB))

        if (battleA && battleA === battleB) {
            return battleA
        }

        if (battleA && battleB) {
            this.#mergeBattles(battleA, battleB)
            return battleA
        }

        return this.#joinOrCreateBattle(swarmA, swarmB, battleA, battleB)
    }


    #joinOrCreateBattle (swarmA, swarmB, battleA, battleB) {
        if (battleA) {
            battleA.addSwarm(swarmB)
            this.emit('battle_joined', {battle: battleA, swarm: swarmB})
            return battleA
        }

        if (battleB) {
            battleB.addSwarm(swarmA)
            this.emit('battle_joined', {battle: battleB, swarm: swarmA})
            return battleB
        }

        const battle = new Battle()
        battle.addSwarm(swarmA)
        battle.addSwarm(swarmB)
        this.battles.push(battle)
        this.emit('battle_started', {battle})
        return battle
    }


    #mergeBattles (battleA, battleB) {
        for (const swarm of [...battleB.swarms]) {
            battleB.removeSwarm(swarm)
            battleA.addSwarm(swarm)
        }

        const index = this.battles.indexOf(battleB)

        if (index !== -1) {
            this.battles.splice(index, 1)
        }
    }


    #updateBattles (deltaTime) {
        for (const battle of this.battles) {
            battle.update(deltaTime, this)
        }

        this.#checkBattleJoin()
    }


    #checkBattleJoin () {
        for (const battle of this.battles) {
            const center = battle.getCenter()

            if (!center) {
                continue
            }

            for (const swarm of this.swarms) {
                this.#tryJoinBattle(battle, swarm, center)
            }
        }
    }


    #tryJoinBattle (battle, swarm, center) {
        if (battle.hasSwarm(swarm)) {
            return
        }

        const leader = swarm.leader

        if (!leader || leader.dying) {
            return
        }

        const hasEnemy = battle.swarms.some(s => s.faction !== swarm.faction)

        if (!hasEnemy) {
            return
        }

        const dx = leader.x - center.x
        const dy = leader.y - center.y

        if (Math.sqrt(dx * dx + dy * dy) < 6) {
            battle.addSwarm(swarm)
            this.emit('battle_joined', {battle, swarm})
        }
    }


    #cleanupBattles () {
        for (let i = this.battles.length - 1; i >= 0; i--) {
            const battle = this.battles[i]

            if (battle.isOver()) {
                const factions = battle.aliveFactions()
                const winner = factions.size === 1 ? [...factions][0] : null
                this.emit('battle_resolved', {battle, winner})
                battle.resolved = true
                this.battles.splice(i, 1)
            }
        }
    }


    #updateDying (deltaTime) {
        for (const entity of this.entities) {
            if (entity.dying > 0) {
                entity.dying -= deltaTime

                if (entity.dying <= 0) {
                    entity.alive = false
                }
            }
        }
    }


    #cleanup () {
        for (const entity of this.entities) {
            if (entity.alive === false) {
                this.removeChild(entity.$id)
            }
        }
    }


    createSwarm (faction) {
        const swarm = new Swarm(faction)
        this.swarms.push(swarm)
        return swarm
    }


    #cleanupSwarms () {
        for (const swarm of this.swarms) {
            swarm.cleanup()
        }
    }


    #applyLeaderPromotions () {
        for (const swarm of this.swarms) {
            if (!swarm._leaderDied) {
                continue
            }

            swarm._leaderDied = false

            if (swarm.leader && swarm.leader.applyBuff) {
                const def = BUFF_DEFINITIONS.promotion
                swarm.leader.applyBuff(def.key, def.duration, {...def.modifiers})
            }
        }
    }


    #updateBuffs (deltaTime) {
        for (const entity of this.entities) {
            if (entity.updateBuffs && !entity.dying) {
                entity.updateBuffs(deltaTime)
            }
        }

        for (const swarm of this.swarms) {
            swarm.updateBuffs(deltaTime)
        }
    }


    spawnShade (options = {}) {
        const entity = this.create(Shade, {
            x: options.x || 0,
            y: options.y || 0
        })
        entity.faction = options.faction || null
        assignSwarm(entity, options.swarm)
        return entity
    }


    spawnSkeleton (options = {}) {
        const entity = this.create(Skeleton, {
            x: options.x || 0,
            y: options.y || 0
        })
        entity.faction = options.faction || null
        assignSwarm(entity, options.swarm)
        return entity
    }


    spawnRat (options = {}) {
        const entity = this.create(Rat, {
            x: options.x || 0,
            y: options.y || 0
        })
        entity.faction = options.faction || null
        assignSwarm(entity, options.swarm)
        return entity
    }


    spawnInquisitor (options = {}) {
        const entity = this.create(Inquisitor, {
            x: options.x || 0,
            y: options.y || 0
        })
        entity.faction = options.faction || null
        assignSwarm(entity, options.swarm)
        return entity
    }


    spawnCage (options = {}) {
        return this.create(Cage, {
            x: options.x || 0,
            y: options.y || 0
        })
    }


    spawnTurret (options = {}) {
        return this.create(Turret, {
            x: options.x || 0,
            y: options.y || 0
        })
    }


    spawnJar (options = {}) {
        return this.create(Jar, {
            x: options.x || 0,
            y: options.y || 0
        })
    }


    spawnProjectile (options = {}) {
        return this.create(Projectile, options)
    }

}


function assignSwarm (entity, swarm) {
    if (swarm) {
        entity.swarm = swarm
        swarm.add(entity)
    }
}


function computeEffectiveDamage (source, baseDamage) {
    if (!source) {
        return Math.max(1, baseDamage)
    }

    const spore = getSporeModifier(source, 'damage')
    const buff = source.getBuffModifier?.('damage') ?? 1
    const swarm = source.swarm?.getBuffModifier?.('damage') ?? 1

    return Math.max(1, Math.round(baseDamage * spore * buff * swarm))
}


function applyKnockback (target, source) {
    if (!source || !target.velocity) {
        return
    }

    const knockDir = target.position.clone().sub(source.position)
    const len = knockDir.length()

    if (len > 0.01) {
        knockDir.multiplyScalar(5 / len)
        target.velocity.add(knockDir)
    }
}
