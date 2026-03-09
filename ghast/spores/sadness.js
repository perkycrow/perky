export default {
    key: 'sadness',
    color: '#8d6e63',
    label: 'Sadness',
    asset: 'spore_sad',
    inclination: 'defensive',
    morale: -0.5,

    effects: {
        speed: 0.7,
        damage: 0.8,
        wanderWeight: 0.4,
        socialWeight: 2
    },

    reactions: {
        ally_died: 'grief',
        isolated: 'grief'
    },

    onEveryFrame (entity) {
        const count = entity.spores.sadness
        if (count <= 0 || !entity.host) {
            return
        }

        const ally = entity.host.nearest(entity, 3, other =>
            other.faction === entity.faction && !other.dying)

        if (ally) {
            entity.seek(ally.position, count * 0.4)
        }
    }
}
