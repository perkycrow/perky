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


console.log('=== SPORE 1v1 vs VANILLA (each spore on Shade) ===\n')

runScenario('Anger Shade vs Vanilla', {units: [u('Shade', {spores: ['anger']})]}, {units: [u('Shade')]})
runScenario('Fear Shade vs Vanilla', {units: [u('Shade', {spores: ['fear']})]}, {units: [u('Shade')]})
runScenario('Sadness Shade vs Vanilla', {units: [u('Shade', {spores: ['sadness']})]}, {units: [u('Shade')]})
runScenario('Arrogance Shade vs Vanilla', {units: [u('Shade', {spores: ['arrogance']})]}, {units: [u('Shade')]})
runScenario('Naive Shade vs Vanilla', {units: [u('Shade', {spores: ['naive']})]}, {units: [u('Shade')]})
runScenario('Surprise Shade vs Vanilla', {units: [u('Shade', {spores: ['surprise']})]}, {units: [u('Shade')]})
runScenario('Lust Shade vs Vanilla', {units: [u('Shade', {spores: ['lust']})]}, {units: [u('Shade')]})


console.log('\n\n=== OFFENSIVE vs DEFENSIVE ===\n')

runScenario('Anger vs Fear', {units: [u('Shade', {spores: ['anger']})]}, {units: [u('Shade', {spores: ['fear']})]})
runScenario('Arrogance vs Sadness', {units: [u('Shade', {spores: ['arrogance']})]}, {units: [u('Shade', {spores: ['sadness']})]})
runScenario('Anger vs Sadness', {units: [u('Shade', {spores: ['anger']})]}, {units: [u('Shade', {spores: ['sadness']})]})


console.log('\n\n=== GROUP SPORE BATTLES (3v3 Rats) ===\n')

runScenario('3 Anger vs 3 Vanilla',
    {units: [u('Rat', {spores: ['anger']}), u('Rat', {spores: ['anger']}), u('Rat', {spores: ['anger']})]},
    {units: [u('Rat'), u('Rat'), u('Rat')]})

runScenario('3 Fear vs 3 Vanilla',
    {units: [u('Rat', {spores: ['fear']}), u('Rat', {spores: ['fear']}), u('Rat', {spores: ['fear']})]},
    {units: [u('Rat'), u('Rat'), u('Rat')]})

runScenario('3 Naive vs 3 Vanilla',
    {units: [u('Rat', {spores: ['naive']}), u('Rat', {spores: ['naive']}), u('Rat', {spores: ['naive']})]},
    {units: [u('Rat'), u('Rat'), u('Rat')]})

runScenario('3 Sadness vs 3 Vanilla',
    {units: [u('Rat', {spores: ['sadness']}), u('Rat', {spores: ['sadness']}), u('Rat', {spores: ['sadness']})]},
    {units: [u('Rat'), u('Rat'), u('Rat')]})


console.log('\n\n=== COMBOS (2 spores on Shade) ===\n')

runScenario('Anger+Fear vs Vanilla (Acculé)',
    {units: [u('Shade', {spores: ['anger', 'fear']})]}, {units: [u('Shade')]})

runScenario('Anger+Naive vs Vanilla (Berserker)',
    {units: [u('Shade', {spores: ['anger', 'naive']})]}, {units: [u('Shade')]})

runScenario('Anger+Arrogance vs Vanilla (Fureur ciblée)',
    {units: [u('Shade', {spores: ['anger', 'arrogance']})]}, {units: [u('Shade')]})

runScenario('Fear+Sadness vs Vanilla (Désespoir)',
    {units: [u('Shade', {spores: ['fear', 'sadness']})]}, {units: [u('Shade')]})

runScenario('Surprise+Anger vs Vanilla (Explosif)',
    {units: [u('Shade', {spores: ['surprise', 'anger']})]}, {units: [u('Shade')]})


console.log('\n\n=== SPORE vs COUNTER-SPORE ===\n')

runScenario('Anger+Naive vs Fear+Sadness (aggro vs defense)',
    {units: [u('Shade', {spores: ['anger', 'naive']})]},
    {units: [u('Shade', {spores: ['fear', 'sadness']})]})

runScenario('3 Anger vs 3 Fear (group)',
    {units: [u('Rat', {spores: ['anger']}), u('Rat', {spores: ['anger']}), u('Rat', {spores: ['anger']})]},
    {units: [u('Rat', {spores: ['fear']}), u('Rat', {spores: ['fear']}), u('Rat', {spores: ['fear']})]})


console.log('\n\n=== RPS BASELINE (sanity check) ===\n')

runScenario('Shade vs Shade (mirror)', {units: [u('Shade')]}, {units: [u('Shade')]})
runScenario('Skeleton vs Rat', {units: [u('Skeleton')]}, {units: [u('Rat')]})
runScenario('Rank 3 vs Rank 1', {units: [u('Shade', {rank: 3})]}, {units: [u('Shade')]})


console.log('\n')
