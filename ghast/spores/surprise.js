export default {
    key: 'surprise',
    color: '#66bb6a',
    label: 'Étonné',
    asset: 'spore_surprised',
    inclination: 'neutral',
    morale: 0,

    effects: {
        speed: 0.8,
        detectRange: 1.8,
        damage: 1.3
    },

    reactions: {
        ally_died: 'shock',
        surrounded: 'startle'
    }
}
