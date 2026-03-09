export default {
    key: 'lust',
    color: '#f48fb1',
    label: 'Lust',
    asset: 'spore_lust',
    inclination: 'neutral',
    morale: 0,

    effects: {
        speed: 1.1,
        socialWeight: 2,
        approachWeight: 1.3,
        damage: 1.0
    },

    reactions: {
        kill: 'trophy'
    },

    onEveryFrame (entity) {
        const count = entity.spores.lust
        if (count <= 0 || !entity.target) {
            return
        }

        const dist = entity.position.distanceTo(entity.target.position)

        if (dist < 0.6) {
            entity.flee(entity.target.position, count * 0.6)
        } else if (dist > 1.2) {
            entity.seek(entity.target.position, count * 0.3)
        }
    }
}
