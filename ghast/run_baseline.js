import {runMatchup} from './simulation.js'


const OPTS = {runs: 100, maxDuration: 60, distance: 2}


function show (label, result) {
    console.log(`  ${label}`)
    console.log(`    A: ${result.winsA}  B: ${result.winsB}  draws: ${result.draws}  avg: ${result.avgDuration.toFixed(1)}s`)
}


console.log('=== BASELINE RPS (no spores) ===\n')

show('Skeleton vs Rat (Skel counters Rat)',
    runMatchup('Skeleton', 'Rat', OPTS))

show('Rat vs Inquisitor (Rat counters Inq)',
    runMatchup('Rat', 'Inquisitor', OPTS))

show('Inquisitor vs Skeleton (Inq counters Skel)',
    runMatchup('Inquisitor', 'Skeleton', OPTS))

console.log('')

console.log('=== SHADE vs ALL (Shade should win) ===\n')

show('Shade vs Skeleton',
    runMatchup('Shade', 'Skeleton', OPTS))

show('Shade vs Rat',
    runMatchup('Shade', 'Rat', OPTS))

show('Shade vs Inquisitor',
    runMatchup('Shade', 'Inquisitor', OPTS))

console.log('')

console.log('=== MIRRORS (should be ~50/50) ===\n')

show('Shade vs Shade',
    runMatchup('Shade', 'Shade', OPTS))

show('Skeleton vs Skeleton',
    runMatchup('Skeleton', 'Skeleton', OPTS))

show('Rat vs Rat',
    runMatchup('Rat', 'Rat', OPTS))

show('Inquisitor vs Inquisitor',
    runMatchup('Inquisitor', 'Inquisitor', OPTS))

console.log('')
