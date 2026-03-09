import Simulation from './simulation.js'


const RUNS = 100


function runScenario (label, factionA, factionB, distance = 0.5) {
    const sim = new Simulation({
        runs: RUNS,
        maxDuration: 60,
        factions: [
            {name: 'A', x: -distance / 2, y: 0, ...factionA},
            {name: 'B', x: distance / 2, y: 0, ...factionB}
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


console.log('=== CLOSE RANGE (dist 0.5) — forces immediate combat ===\n')

runScenario(
    'Fear Shade vs Vanilla Shade',
    {units: [u('Shade', {spores: ['fear']})]},
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

runScenario(
    'Triple Fear Skeleton vs Vanilla Skeleton',
    {units: [u('Skeleton', {spores: ['fear', 'fear', 'fear']})]},
    {units: [u('Skeleton')]}
)

runScenario(
    'Anger Skeleton vs Fear Skeleton',
    {units: [u('Skeleton', {spores: ['anger']})]},
    {units: [u('Skeleton', {spores: ['fear']})]},
)

console.log('\n=== NORMAL RANGE (dist 4) — includes approach phase ===\n')

runScenario(
    'Fear Skeleton vs Vanilla Skeleton',
    {units: [u('Skeleton', {spores: ['fear']})]},
    {units: [u('Skeleton')]},
    4
)

runScenario(
    'Fear Rat vs Vanilla Rat',
    {units: [u('Rat', {spores: ['fear']})]},
    {units: [u('Rat')]},
    4
)

console.log('')
