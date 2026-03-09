import Simulation from './simulation.js'


function runMirror (label, type) {
    const sim = new Simulation({
        runs: 200,
        maxDuration: 60,
        factions: [
            {name: 'A', x: 0, y: 0, units: [{type}]},
            {name: 'B', x: 0, y: 0, units: [{type}]}
        ]
    })

    const summary = sim.run()
    const wA = summary.wins.A || 0
    const wB = summary.wins.B || 0
    const draws = 200 - wA - wB
    const avg = summary.avgDuration.toFixed(1)

    console.log(`  ${label}: A=${wA}  B=${wB}  draws=${draws}  avg=${avg}s`)
}


console.log('=== PURE VANILLA MIRROR (no spores, same spot) ===\n')

runMirror('Shade vs Shade', 'Shade')
runMirror('Skeleton vs Skeleton', 'Skeleton')
runMirror('Rat vs Rat', 'Rat')

console.log('')
