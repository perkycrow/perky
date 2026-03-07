const BUFF_DEFINITIONS = {

    rage: {
        key: 'rage',
        duration: 3,
        modifiers: {damage: 1.5, speed: 1.3}
    },

    grief: {
        key: 'grief',
        duration: 5,
        modifiers: {speed: 0.6, damage: 0.8}
    },

    panic: {
        key: 'panic',
        duration: 2,
        modifiers: {speed: 2, fleeWeight: 5, approachWeight: 0}
    },

    shock: {
        key: 'shock',
        duration: 1,
        modifiers: {speed: 0, approachWeight: 0, fleeWeight: 0}
    },

    terror: {
        key: 'terror',
        duration: -1,
        modifiers: {fleeWeight: 5, approachWeight: 0, speed: 1.5}
    },

    lastBreath: {
        key: 'lastBreath',
        duration: -1,
        modifiers: {damage: 2}
    },

    indignation: {
        key: 'indignation',
        duration: 4,
        modifiers: {speed: 1.4, approachWeight: 2, damage: 1.2}
    },

    triumph: {
        key: 'triumph',
        duration: 3,
        modifiers: {approachWeight: 1.5, speed: 1.1}
    },

    excitement: {
        key: 'excitement',
        duration: 2,
        modifiers: {speed: 1.4, wanderWeight: 2}
    },

    trophy: {
        key: 'trophy',
        duration: 3,
        modifiers: {socialWeight: 1.5, approachWeight: 1.3}
    },

    party: {
        key: 'party',
        duration: 3,
        modifiers: {speed: 1.1, socialWeight: 1.5}
    },

    startle: {
        key: 'startle',
        duration: 1,
        modifiers: {speed: 2, damage: 1.5}
    },

    disarray: {
        key: 'disarray',
        duration: 3,
        modifiers: {speed: 0.7, damage: 0.8, approachWeight: 0.5}
    },

    promotion: {
        key: 'promotion',
        duration: 3,
        modifiers: {damage: 1.3, speed: 1.2}
    }

}


export default BUFF_DEFINITIONS
