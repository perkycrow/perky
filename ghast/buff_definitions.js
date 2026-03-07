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
    },

    rout: {
        key: 'rout',
        duration: -1,
        modifiers: {speed: 0.5, damage: 0.6, fleeWeight: 3, approachWeight: 0.2}
    },

    exaltation: {
        key: 'exaltation',
        duration: -1,
        modifiers: {speed: 1.2, damage: 1.3}
    },


    cornered: {
        key: 'cornered',
        duration: 2,
        modifiers: {speed: 1.8, damage: 2}
    },

    vendetta: {
        key: 'vendetta',
        duration: 4,
        modifiers: {damage: 2, speed: 1.5}
    },

    duelFury: {
        key: 'duelFury',
        duration: 3,
        modifiers: {damage: 1.8, approachWeight: 3}
    },

    berserk: {
        key: 'berserk',
        duration: 3,
        modifiers: {damage: 1.8, speed: 1.5, fleeWeight: 0}
    },

    detonation: {
        key: 'detonation',
        duration: 1.5,
        modifiers: {damage: 2.5, speed: 0.2}
    },

    possessive: {
        key: 'possessive',
        duration: 3,
        modifiers: {socialWeight: 3, damage: 1.5}
    },

    cowardTyrant: {
        key: 'cowardTyrant',
        duration: 3,
        modifiers: {fleeWeight: 3, damage: 1.5}
    },

    megalomania: {
        key: 'megalomania',
        duration: 3,
        modifiers: {approachWeight: 3, speed: 1.3}
    },

    nobleMelancholy: {
        key: 'nobleMelancholy',
        duration: 4,
        modifiers: {socialWeight: 0, damage: 1.2, speed: 0.8}
    },

    snobShock: {
        key: 'snobShock',
        duration: 2,
        modifiers: {damage: 2, speed: 1.5}
    },

    seduction: {
        key: 'seduction',
        duration: 3,
        modifiers: {socialWeight: 2, approachWeight: 2}
    },

    obsession: {
        key: 'obsession',
        duration: 3,
        modifiers: {approachWeight: 1.5, fleeWeight: 1.5, speed: 0.7}
    },

    unstable: {
        key: 'unstable',
        duration: 2,
        modifiers: {speed: 1.8, wanderWeight: 3}
    },

    despair: {
        key: 'despair',
        duration: 5,
        modifiers: {speed: 0.3, approachWeight: 0, fleeWeight: 0.5}
    },

    terrorFreeze: {
        key: 'terrorFreeze',
        duration: 1,
        modifiers: {speed: 0, fleeWeight: 0, approachWeight: 0}
    },

    groupie: {
        key: 'groupie',
        duration: 3,
        modifiers: {socialWeight: 3, approachWeight: 2, speed: 1.2}
    },

    dependence: {
        key: 'dependence',
        duration: 4,
        modifiers: {socialWeight: 3, speed: 0.8}
    },

    loveStrike: {
        key: 'loveStrike',
        duration: 1.5,
        modifiers: {speed: 0, socialWeight: 5}
    },

    bipolar: {
        key: 'bipolar',
        duration: 3,
        modifiers: {wanderWeight: 2, speed: 1}
    },

    wonder: {
        key: 'wonder',
        duration: 2,
        modifiers: {speed: 1.3, wanderWeight: 2, detectRange: 2}
    },

    apathy: {
        key: 'apathy',
        duration: 4,
        modifiers: {speed: 0.5, approachWeight: 0.3, fleeWeight: 0.3}
    }

}


export default BUFF_DEFINITIONS
