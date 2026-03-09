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

    scoreTarget (entity, target) {
        const count = entity.spores.arrogance
        const rank = target.rank || 1

        return 1 + rank * count * 0.15
    },

    onEveryFrame (entity) {
        const count = entity.spores.arrogance
        if (count <= 0) {
            return
        }

        const threat = entity._threat || 0
        const myRank = entity.rank || 1

        if (threat < myRank * 0.3 && entity.target) {
            entity.seek(entity.target.position, count * 0.3)
        }
    }
}
