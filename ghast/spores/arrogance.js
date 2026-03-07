export default {
    key: 'arrogance',
    color: '#d7ccc8',
    label: 'Arrogant',
    asset: 'spore_arrogant',
    inclination: 'offensive',
    morale: 0,

    effects: {
        damage: 1.4,
        cooldown: 0.8,
        approachWeight: 1.5,
        socialWeight: 0.3,
        fleeWeight: 0.3
    },

    reactions: {
        low_hp: 'indignation',
        kill: 'triumph',
        first_blood: 'triumph'
    }
}
