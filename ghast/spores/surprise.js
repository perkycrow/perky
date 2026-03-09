export default {
    key: 'surprise',
    color: '#66bb6a',
    label: 'Surprise',
    asset: 'spore_surprised',
    inclination: 'neutral',
    morale: 0,

    effects: {
        speed: 0.8,
        detectRange: 1.8,
        damage: 1.0
    },

    reactions: {
        ally_died: 'shock',
        surrounded: 'startle'
    },

    onEveryFrame (entity) {
        const count = entity.spores.surprise
        if (count <= 0) {
            return
        }

        if (entity.target && !entity._hadTarget) {
            entity.target._surpriseStun = 0.2 + count * 0.1
        }

        entity._hadTarget = Boolean(entity.target)

        if (entity._surpriseStun > 0) {
            entity._surpriseStun -= 1 / 60
            entity.velocity?.set(0, 0)
        }
    }
}
