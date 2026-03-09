function u (type, opts = {}) {
    return {type, ...opts}
}


function line ({type, count, y0, spacing, ...opts}) {
    const units = []

    for (let i = 0; i < count; i++) {
        units.push(u(type, {y: y0 + i * spacing, ...opts}))
    }

    return units
}


const SCENARIOS = [
    {
        label: 'Default (3 factions)',
        factions: [
            {name: 'shadow',
                x: -3,
                y: 0,
                units: [
                    u('Shade', {rank: 3, spores: ['anger', 'arrogance', 'fear']}),
                    u('Skeleton', {x: -3.8, y: -0.8, rank: 2, spores: ['sadness', 'anger']}),
                    u('Rat', {x: -2.5, y: -0.6, spores: ['naive']})
                ]},
            {name: 'light',
                x: 3,
                y: 0,
                units: [
                    u('Shade', {rank: 3, spores: ['anger', 'arrogance', 'fear']}),
                    u('Inquisitor', {x: 3.8, y: -0.8, rank: 2, spores: ['fear', 'surprise']}),
                    u('Rat', {x: 2.5, y: -0.6, spores: ['naive']})
                ]},
            {name: 'chaos',
                x: 0,
                y: 4,
                units: [
                    u('Shade', {rank: 3, spores: ['anger', 'arrogance', 'fear']}),
                    u('Skeleton', {x: -0.6, y: 3.3, rank: 2, spores: ['sadness', 'anger']}),
                    u('Inquisitor', {x: 0.6, y: 3.3, rank: 2, spores: ['fear', 'surprise']})
                ]}
        ]
    },

    {
        label: 'Berserkers vs Cowards (3v3 Rats)',
        factions: [
            {name: 'shadow', x: -2, y: 0, units: line({type: 'Rat', count: 3, y0: -0.5, spacing: 0.5, spores: ['anger', 'naive']})},
            {name: 'light', x: 2, y: 0, units: line({type: 'Rat', count: 3, y0: -0.5, spacing: 0.5, spores: ['fear', 'sadness']})}
        ]
    },

    {
        label: 'Angry Horde vs Disciplined Squad',
        factions: [
            {name: 'shadow',
                x: -3,
                y: 0,
                units: [
                    ...line({type: 'Rat', count: 5, y0: -1, spacing: 0.5, spores: ['anger']})
                ]},
            {name: 'light',
                x: 3,
                y: 0,
                units: [
                    u('Shade', {rank: 2, spores: ['arrogance']}),
                    u('Skeleton', {y: -0.6, spores: ['sadness']}),
                    u('Skeleton', {y: 0.6, spores: ['sadness']})
                ]}
        ]
    },

    {
        label: 'Surprise Ambush vs Angry Charge',
        factions: [
            {name: 'shadow',
                x: -2.5,
                y: 0,
                units: [
                    u('Shade', {spores: ['surprise', 'anger']}),
                    u('Rat', {y: -0.6, spores: ['surprise']}),
                    u('Rat', {y: 0.6, spores: ['surprise']})
                ]},
            {name: 'light',
                x: 2.5,
                y: 0,
                units: [
                    u('Shade', {spores: ['anger', 'anger']}),
                    u('Rat', {y: -0.6, spores: ['anger']}),
                    u('Rat', {y: 0.6, spores: ['anger']})
                ]}
        ]
    },

    {
        label: 'Lust Orbiter vs Brute',
        factions: [
            {name: 'shadow',
                x: -2,
                y: 0,
                units: [
                    u('Shade', {spores: ['lust']}),
                    u('Rat', {y: 0.5, spores: ['lust']}),
                    u('Rat', {y: -0.5, spores: ['lust']})
                ]},
            {name: 'light',
                x: 2,
                y: 0,
                units: [
                    u('Shade', {rank: 2, spores: ['anger']}),
                    u('Skeleton', {y: 0.6}),
                    u('Skeleton', {y: -0.6})
                ]}
        ]
    },

    {
        label: 'Sad Band vs Happy Fools',
        factions: [
            {name: 'shadow',
                x: -2.5,
                y: 0,
                units: [
                    u('Shade', {spores: ['sadness']}),
                    u('Skeleton', {y: -0.6, spores: ['sadness']}),
                    u('Skeleton', {y: 0.6, spores: ['sadness']})
                ]},
            {name: 'light',
                x: 2.5,
                y: 0,
                units: [
                    u('Shade', {spores: ['naive']}),
                    u('Rat', {y: -0.5, spores: ['naive']}),
                    u('Rat', {y: 0.5, spores: ['naive']})
                ]}
        ]
    },

    {
        label: 'Arrogant Elite vs Rat Swarm',
        factions: [
            {name: 'shadow',
                x: -2,
                y: 0,
                units: [
                    u('Shade', {rank: 3, spores: ['arrogance', 'arrogance']})
                ]},
            {name: 'light', x: 2, y: 0, units: line({type: 'Rat', count: 4, y0: -0.8, spacing: 0.5})}
        ]
    },

    {
        label: 'Fear Kiting vs Anger Charge (Shade 1v1)',
        factions: [
            {name: 'shadow', x: -2, y: 0, units: [u('Shade', {spores: ['fear']})]},
            {name: 'light', x: 2, y: 0, units: [u('Shade', {spores: ['anger']})]}
        ]
    },

    {
        label: 'Full Combo: Accule vs Berserker',
        factions: [
            {name: 'shadow',
                x: -2.5,
                y: 0,
                units: [
                    u('Shade', {rank: 2, spores: ['anger', 'fear']}),
                    u('Skeleton', {y: 0.6, spores: ['fear']})
                ]},
            {name: 'light',
                x: 2.5,
                y: 0,
                units: [
                    u('Shade', {rank: 2, spores: ['anger', 'naive']}),
                    u('Rat', {y: 0.5, spores: ['anger']})
                ]}
        ]
    },

    {
        label: 'Mixed Army vs Mixed Army',
        factions: [
            {name: 'shadow',
                x: -3,
                y: 0,
                units: [
                    u('Shade', {rank: 2, spores: ['anger', 'arrogance']}),
                    u('Skeleton', {x: -3.5, y: -0.7, spores: ['sadness']}),
                    u('Rat', {x: -2.5, y: -0.5, spores: ['naive']}),
                    u('Inquisitor', {x: -3.5, y: 0.7, spores: ['fear']})
                ]},
            {name: 'light',
                x: 3,
                y: 0,
                units: [
                    u('Shade', {rank: 2, spores: ['surprise', 'lust']}),
                    u('Skeleton', {x: 3.5, y: -0.7, spores: ['anger']}),
                    u('Rat', {x: 2.5, y: -0.5, spores: ['anger']}),
                    u('Inquisitor', {x: 3.5, y: 0.7, spores: ['surprise']})
                ]}
        ]
    },

    {
        label: 'Tyran Lache vs Strong Guard',
        factions: [
            {name: 'shadow',
                x: -2.5,
                y: 0,
                units: [
                    u('Shade', {rank: 2, spores: ['arrogance', 'fear']}),
                    u('Rat', {y: -0.5, spores: ['fear']}),
                    u('Rat', {y: 0.5, spores: ['fear']})
                ]},
            {name: 'light',
                x: 2.5,
                y: 0,
                units: [
                    u('Shade', {rank: 3}),
                    u('Skeleton', {y: 0.6}),
                    u('Rat', {y: -0.5})
                ]}
        ]
    },

    {
        label: 'Skeleton Wall vs Rat Rush',
        factions: [
            {name: 'shadow', x: -2.5, y: 0, units: line({type: 'Skeleton', count: 4, y0: -0.8, spacing: 0.5, spores: ['sadness']})},
            {name: 'light', x: 2.5, y: 0, units: line({type: 'Rat', count: 6, y0: -1.2, spacing: 0.5, spores: ['anger']})}
        ]
    },

    {
        label: 'Shade vs Shade (mirror)',
        factions: [
            {name: 'shadow', x: -2, y: 0, units: [u('Shade')]},
            {name: 'light', x: 2, y: 0, units: [u('Shade')]}
        ]
    },

    {
        label: 'Rank 3 vs 3 Rank 1',
        factions: [
            {name: 'shadow', x: -2, y: 0, units: [u('Shade', {rank: 3})]},
            {name: 'light', x: 2, y: 0, units: line({type: 'Shade', count: 3, y0: -0.5, spacing: 0.5})}
        ]
    }
]


export default SCENARIOS
