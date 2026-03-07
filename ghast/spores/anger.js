export default {
    key: 'anger',
    color: '#ef5350',
    label: 'Colère',
    asset: 'spore_angry',
    inclination: 'offensive',
    morale: 0,

    effects: {
        speed: 1.3,
        damage: 1.5,
        cooldown: 0.7,
        approachWeight: 2,
        fleeWeight: 0.2
    },

    reactions: {
        ally_died: 'rage',
        low_hp: 'lastBreath',
        first_blood: 'rage'
    }
}
