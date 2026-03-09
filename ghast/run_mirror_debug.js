import Simulation from './simulation.js'


function runMirror (label, type, posA, posB) {
    const sim = new Simulation({
        runs: 100,
        maxDuration: 60,
        factions: [
            {name: 'A', x: posA, y: 0, units: [{type}]},
            {name: 'B', x: posB, y: 0, units: [{type}]}
        ]
    })

    const summary = sim.run()
    const wA = summary.wins.A || 0
    const wB = summary.wins.B || 0
    const draws = 100 - wA - wB
    const avg = summary.avgDuration.toFixed(1)

    console.log(`  ${label}: A=${wA}  B=${wB}  draws=${draws}  avg=${avg}s`)
}


console.log('=== SKELETON MIRROR BIAS TEST ===\n')

runMirror('A at x=-1, B at x=1 (normal)', 'Skeleton', -1, 1)
runMirror('A at x=1, B at x=-1 (swapped)', 'Skeleton', 1, -1)
runMirror('A at x=0, B at x=0 (same spot)', 'Skeleton', 0, 0)
runMirror('A at x=-0.3, B at x=0.3 (close)', 'Skeleton', -0.3, 0.3)

console.log('\n=== RAT MIRROR BIAS TEST ===\n')

runMirror('A at x=-1, B at x=1 (normal)', 'Rat', -1, 1)
runMirror('A at x=1, B at x=-1 (swapped)', 'Rat', 1, -1)
runMirror('A at x=0, B at x=0 (same spot)', 'Rat', 0, 0)

console.log('\n=== SHADE MIRROR BIAS TEST ===\n')

runMirror('A at x=-1, B at x=1 (normal)', 'Shade', -1, 1)
runMirror('A at x=1, B at x=-1 (swapped)', 'Shade', 1, -1)

console.log('')
