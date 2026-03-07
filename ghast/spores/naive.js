export default {
    key: 'naive',
    color: '#ab47bc',
    label: 'Ingénu',
    asset: 'spore_naive',
    inclination: 'offensive',
    morale: 0.5,

    effects: {
        speed: 1.2,
        damage: 0.7,
        wanderWeight: 2,
        approachWeight: 1.3,
        fleeWeight: 0.2
    },

    reactions: {
        kill: 'excitement',
        surrounded: 'party',
        isolated: 'excitement',
        first_blood: 'excitement'
    }
}
