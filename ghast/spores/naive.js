export default {
    key: 'naive',
    color: '#ab47bc',
    label: 'Naive',
    asset: 'spore_naive',
    inclination: 'offensive',
    morale: 0.5,

    effects: {
        speed: 1.2,
        damage: 0.85,
        wanderWeight: 2,
        approachWeight: 1.3,
        fleeWeight: 0.2
    },

    reactions: {
        kill: 'excitement',
        surrounded: 'party',
        isolated: 'excitement',
        first_blood: 'excitement'
    },

    onEveryFrame (entity) {
        const count = entity.spores.naive
        if (count <= 0 || entity.target || !entity.host) {
            return
        }

        const enemy = entity.host.space?.nearest(entity, 6, other =>
            other.faction && other.faction !== entity.faction && !other.dying)

        if (enemy) {
            entity.seek(enemy.position, count * 0.3)
        }
    }
}
