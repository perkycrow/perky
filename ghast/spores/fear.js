export default {
    key: 'fear',
    color: '#4fc3f7',
    label: 'Fear',
    asset: 'spore_scared',
    inclination: 'defensive',
    morale: -0.5,

    effects: {
        speed: 0.9,
        damage: 0.85,
        cooldown: 1.2,
        approachWeight: 0.5
    },

    reactions: {
        ally_died: 'panic',
        low_hp: 'terror',
        surrounded: 'panic',
        isolated: 'panic'
    },

    scoreTarget (entity, target) {
        const count = entity.spores.fear
        const rank = target.rank || 1

        return 1 / (1 + rank * count * 0.15)
    },

    onEveryFrame (entity) {
        const count = entity.spores.fear
        if (count <= 0) {
            return
        }

        const awareness = Math.min(entity.baseDetectRange || 1, 3) / 3
        const threat = entity._threat || 0
        const myRank = entity.rank || 1
        const pressure = 1 + Math.max(0, threat - myRank * 0.5) * 0.6

        entity.wander(count * awareness * 0.4 * pressure)

        if (entity.target) {
            entity.flee(entity.target.position, count * awareness * 0.3 * pressure)
        }
    }
}
