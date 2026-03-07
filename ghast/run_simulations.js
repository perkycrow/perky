import Simulation from './simulation.js'


const RUNS = 100
const MAX_DURATION = 60


function runScenario (label, factionA, factionB) {
    const sim = new Simulation({
        runs: RUNS,
        maxDuration: MAX_DURATION,
        factions: [
            {name: 'A', x: -2, y: 0, ...factionA},
            {name: 'B', x: 2, y: 0, ...factionB}
        ]
    })

    const summary = sim.run()
    const wA = summary.wins.A || 0
    const wB = summary.wins.B || 0
    const draws = RUNS - wA - wB
    const avg = summary.avgDuration.toFixed(1)

    console.log(`\n${label}`)
    console.log(`  A: ${wA}  B: ${wB}  draws: ${draws}  avg: ${avg}s`)
}


function u (type, opts = {}) {
    return {type, ...opts}
}


console.log('=== RANK TESTS ===')

runScenario(
    'Rank 1 Shade vs Rank 1 Shade (mirror — should be ~50/50)',
    {units: [u('Shade')]},
    {units: [u('Shade')]}
)

runScenario(
    'Rank 3 Shade vs Rank 1 Shade (rank advantage — A should dominate)',
    {units: [u('Shade', {rank: 3})]},
    {units: [u('Shade')]}
)

runScenario(
    'Rank 5 Rat vs Rank 1 Shade (high rank rat vs base shade — rat should win)',
    {units: [u('Rat', {rank: 5})]},
    {units: [u('Shade')]}
)


console.log('\n\n=== SPORE TESTS (same type, isolating spore impact) ===')

runScenario(
    'Anger Shade vs Vanilla Shade (anger = more damage — A should win)',
    {units: [u('Shade', {spores: ['anger']})]},
    {units: [u('Shade')]}
)

runScenario(
    'Triple Anger Shade vs Vanilla Shade (stacked anger — A dominates)',
    {units: [u('Shade', {spores: ['anger', 'anger', 'anger']})]},
    {units: [u('Shade')]}
)

runScenario(
    'Fear Shade vs Vanilla Shade (fear = flee + less damage — B should win)',
    {units: [u('Shade', {spores: ['fear']})]},
    {units: [u('Shade')]}
)

runScenario(
    'Anger Shade vs Fear Shade (anger vs fear — anger should win)',
    {units: [u('Shade', {spores: ['anger']})]},
    {units: [u('Shade', {spores: ['fear']})]},
)


console.log('\n\n=== NUMBERS ADVANTAGE ===')

runScenario(
    '3 Rats vs 1 Shade (numbers vs quality — rats should overwhelm)',
    {units: [u('Rat'), u('Rat'), u('Rat')]},
    {units: [u('Shade')]}
)

runScenario(
    '2 Skeletons vs 1 Skeleton (2v1 — A should win)',
    {units: [u('Skeleton'), u('Skeleton')]},
    {units: [u('Skeleton')]}
)


console.log('\n\n=== RANK vs NUMBERS ===')

runScenario(
    '1 Rank 3 Shade vs 2 Rank 1 Shades (elite vs mob — who wins?)',
    {units: [u('Shade', {rank: 3})]},
    {units: [u('Shade'), u('Shade')]}
)

runScenario(
    '1 Rank 5 Shade vs 3 Rank 1 Shades (super elite vs mob)',
    {units: [u('Shade', {rank: 5})]},
    {units: [u('Shade'), u('Shade'), u('Shade')]}
)


console.log('\n\n=== COMPOSITION (rock-paper-scissors) ===')

runScenario(
    'Skeleton vs Rat (Skeleton counters Rat — Skeleton should win)',
    {units: [u('Skeleton')]},
    {units: [u('Rat')]}
)

runScenario(
    'Rat vs Inquisitor (Rat counters Inquisitor — Rat should win)',
    {units: [u('Rat')]},
    {units: [u('Inquisitor')]}
)

runScenario(
    'Inquisitor vs Skeleton (Inquisitor counters Skeleton — Inquisitor should win)',
    {units: [u('Inquisitor')]},
    {units: [u('Skeleton')]}
)


console.log('\n\n=== SPORES IN GROUP COMBAT ===')

runScenario(
    '3 Anger Rats vs 3 Vanilla Rats (anger boost in group — A should win)',
    {units: [u('Rat', {spores: ['anger']}), u('Rat', {spores: ['anger']}), u('Rat', {spores: ['anger']})]},
    {units: [u('Rat'), u('Rat'), u('Rat')]}
)

runScenario(
    '3 Fear Rats vs 3 Vanilla Rats (fear in group — B should win)',
    {units: [u('Rat', {spores: ['fear']}), u('Rat', {spores: ['fear']}), u('Rat', {spores: ['fear']})]},
    {units: [u('Rat'), u('Rat'), u('Rat')]}
)

runScenario(
    '3 Anger Rats vs 3 Fear Rats (anger vs fear in group — anger wins)',
    {units: [u('Rat', {spores: ['anger']}), u('Rat', {spores: ['anger']}), u('Rat', {spores: ['anger']})]},
    {units: [u('Rat', {spores: ['fear']}), u('Rat', {spores: ['fear']}), u('Rat', {spores: ['fear']})]},
)


console.log('\n\n=== SPORE + RANK COMBO ===')

runScenario(
    'Rank 1 Anger Shade vs Rank 3 Vanilla Shade (spore vs rank — rank should still win)',
    {units: [u('Shade', {spores: ['anger']})]},
    {units: [u('Shade', {rank: 3})]}
)

runScenario(
    'Rank 3 Anger Shade vs Rank 3 Vanilla Shade (same rank + anger — A wins)',
    {units: [u('Shade', {rank: 3, spores: ['anger']})]},
    {units: [u('Shade', {rank: 3})]}
)


console.log('\n\n=== MIXED COMPOSITION ===')

runScenario(
    'Shade + Skeleton vs Shade + Skeleton (mirror team — ~50/50)',
    {units: [u('Shade'), u('Skeleton')]},
    {units: [u('Shade'), u('Skeleton')]}
)

runScenario(
    'Shade + Inquisitor vs Skeleton + Rat (mixed teams)',
    {units: [u('Shade'), u('Inquisitor')]},
    {units: [u('Skeleton'), u('Rat')]}
)

runScenario(
    '2 Shade + 1 Inquisitor vs 3 Skeleton (quality vs consistency)',
    {units: [u('Shade'), u('Shade'), u('Inquisitor')]},
    {units: [u('Skeleton'), u('Skeleton'), u('Skeleton')]}
)


console.log('\n\n=== ARROGANCE (damage + low flee) ===')

runScenario(
    'Arrogance Shade vs Vanilla Shade (arrogance = damage boost — A should win)',
    {units: [u('Shade', {spores: ['arrogance']})]},
    {units: [u('Shade')]}
)


console.log('\n\n=== SADNESS (slow, defensive) ===')

runScenario(
    'Sadness Shade vs Vanilla Shade (slower + less damage — B wins)',
    {units: [u('Shade', {spores: ['sadness']})]},
    {units: [u('Shade')]}
)


console.log('\n')
