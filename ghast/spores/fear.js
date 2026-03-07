export default {
    key: 'fear',
    color: '#4fc3f7',
    label: 'Peur',
    asset: 'spore_scared',
    inclination: 'defensive',
    morale: -0.5,

    effects: {
        speed: 0.85,
        damage: 0.7,
        cooldown: 1.4,
        detectRange: 0.8,
        approachWeight: 0.5
    },

    reactions: {
        ally_died: 'panic',
        low_hp: 'terror',
        surrounded: 'panic',
        isolated: 'panic'
    },

    onEveryFrame (entity) {
        const count = entity.spores.fear
        if (count <= 0) {
            return
        }

        entity.wander(count * 0.6)

        if (entity.target) {
            entity.flee(entity.target.position, count * 0.3)
        }
    }
}
