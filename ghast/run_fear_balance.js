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

    console.log(`  ${label}`)
    console.log(`    A: ${wA}  B: ${wB}  draws: ${draws}  avg: ${avg}s`)
}


function u (type, opts = {}) {
    return {type, ...opts}
}


console.log('=== FEAR BALANCE (damage 0.7, cooldown 1.4, flee 0.8) ===\n')

runScenario(
    'Fear Shade vs Vanilla Shade (fear = slight disadvantage?)',
    {units: [u('Shade', {spores: ['fear']})]},
    {units: [u('Shade')]}
)

runScenario(
    'Anger Shade vs Fear Shade (anger should clearly win)',
    {units: [u('Shade', {spores: ['anger']})]},
    {units: [u('Shade', {spores: ['fear']})]}
)

runScenario(
    '3 Fear Rats vs 3 Vanilla Rats (group fear)',
    {units: [u('Rat', {spores: ['fear']}), u('Rat', {spores: ['fear']}), u('Rat', {spores: ['fear']})]},
    {units: [u('Rat'), u('Rat'), u('Rat')]}
)

runScenario(
    '3 Anger Rats vs 3 Fear Rats (group anger vs fear)',
    {units: [u('Rat', {spores: ['anger']}), u('Rat', {spores: ['anger']}), u('Rat', {spores: ['anger']})]},
    {units: [u('Rat', {spores: ['fear']}), u('Rat', {spores: ['fear']}), u('Rat', {spores: ['fear']})]}
)

runScenario(
    'Triple Fear Shade vs Vanilla Shade (stacked fear — kiting max)',
    {units: [u('Shade', {spores: ['fear', 'fear', 'fear']})]},
    {units: [u('Shade')]}
)

runScenario(
    'Fear Skeleton vs Vanilla Skeleton',
    {units: [u('Skeleton', {spores: ['fear']})]},
    {units: [u('Skeleton')]}
)

runScenario(
    'Fear Rat vs Vanilla Rat',
    {units: [u('Rat', {spores: ['fear']})]},
    {units: [u('Rat')]}
)

console.log('')
