export default {
    key: 'fear',
    color: '#4fc3f7',
    label: 'Peur',
    asset: 'spore_scared',
    inclination: 'defensive',
    morale: -0.5,

    effects: {
        speed: 1.3,
        damage: 0.8,
        detectRange: 1.5,
        approachWeight: 0.2
    },

    reactions: {
        ally_died: 'panic',
        low_hp: 'terror',
        surrounded: 'panic',
        isolated: 'panic'
    },

    onEveryFrame (entity) {
        const count = entity.spores.fear
        if (entity.target && count > 0) {
            entity.flee(entity.target.position, count * 1.5)
        }
    }
}
