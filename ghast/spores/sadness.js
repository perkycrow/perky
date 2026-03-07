export default {
    key: 'sadness',
    color: '#8d6e63',
    label: 'Triste',
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
    }
}
