export default {
    key: 'arrogance',
    color: '#d7ccc8',
    label: 'Arrogance',
    asset: 'spore_arrogant',
    inclination: 'offensive',
    morale: 0,

    effects: {
        damage: 1.3,
        cooldown: 0.8,
        approachWeight: 1.5,
        socialWeight: 0.3,
        fleeWeight: 0.3
    },

    reactions: {
        low_hp: 'indignation',
        kill: 'triumph',
        first_blood: 'triumph'
    },

    onDecisionFrame (entity, world) {
        const count = entity.spores.arrogance
        if (count <= 0 || !entity.target) {
            return
        }

        const strongest = findStrongestTarget(entity, world)

        if (strongest) {
            entity.target = strongest
        }
    }
}


function findStrongestTarget (entity, world) {
    const range = entity.baseDetectRange || 1
    let strongest = null
    let bestRank = entity.target.rank || 1

    for (const other of world.entities) {
        if (other === entity || other.faction === entity.faction || other.dying) {
            continue
        }

        const rank = other.rank || 1

        if (rank <= bestRank) {
            continue
        }

        const distSq = entity.position.distanceToSquared(other.position)

        if (distSq < range * range) {
            bestRank = rank
            strongest = other
        }
    }

    return strongest
}
