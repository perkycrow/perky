import Simulation, {runMatchup, runMatrix} from './simulation.js'


const TYPES = ['Shade', 'Skeleton', 'Inquisitor', 'Rat']

const args = process.argv.slice(2)
const mode = args[0] || 'matrix'


if (mode === 'matrix') {
    printMatrix()
} else if (mode === 'matchup') {
    printMatchup(args[1], args[2], args.slice(3))
} else if (mode === 'custom') {
    printCustom(args[1])
} else {
    printUsage()
}


function printMatrix () {
    const runs = getFlag('--runs', 50)
    const distance = getFlag('--distance', 2)

    log(`\n=== RPS Matrix (${runs} runs each, distance ${distance}) ===\n`)

    const matrix = runMatrix(TYPES, {runs, distance, maxDuration: 30})

    const colWidth = 14
    let header = pad('', colWidth)

    for (const b of TYPES) {
        header += pad(b, colWidth)
    }

    log(header)
    log('─'.repeat(colWidth * (TYPES.length + 1)))

    for (const a of TYPES) {
        let row = pad(a, colWidth)

        for (const b of TYPES) {
            if (a === b) {
                row += pad('—', colWidth)
            } else {
                const m = matrix[a][b]
                const pct = Math.round(m.winRateA * 100) + '%'
                const avg = m.avgDuration.toFixed(1) + 's'
                row += pad(`${pct} (${avg})`, colWidth)
            }
        }

        log(row)
    }

    log('')
    printTriangleVerdict(matrix)
}


function printMatchup (typeA, typeB, sporeArgs) {
    if (!typeA || !typeB) {
        log('Usage: node ghast/run_simulation.js matchup Shade Rat [anger naive]')
        return
    }

    const runs = getFlag('--runs', 100)
    const sporesA = sporeArgs.filter(s => !s.startsWith('--'))

    log(`\n=== ${typeA} vs ${typeB} (${runs} runs) ===`)

    if (sporesA.length > 0) {
        log(`${typeA} spores: ${sporesA.join(', ')}`)
    }

    const result = runMatchup(typeA, typeB, {runs, sporesA, maxDuration: 30})

    log(`${typeA} wins: ${result.winsA} (${Math.round(result.winRateA * 100)}%)`)
    log(`${typeB} wins: ${result.winsB} (${Math.round(result.winRateB * 100)}%)`)

    if (result.draws > 0) {
        log(`Draws: ${result.draws}`)
    }

    log(`Avg duration: ${result.avgDuration.toFixed(2)}s`)
}


function printCustom (configPath) {
    if (!configPath) {
        log('Usage: node ghast/run_simulation.js custom config.json')
        return
    }

    import('fs').then(fs => {
        const raw = fs.readFileSync(configPath, 'utf-8')
        const config = JSON.parse(raw)
        const sim = new Simulation(config)
        const summary = sim.run()

        log(`\n=== Custom Simulation (${summary.total} runs) ===`)

        for (const [faction, count] of Object.entries(summary.wins)) {
            log(`${faction}: ${count} wins (${Math.round(count / summary.total * 100)}%)`)
        }

        log(`Avg duration: ${summary.avgDuration.toFixed(2)}s`)

        if (summary.results[0]) {
            log('\nSample run survivors:')

            for (const [faction, data] of Object.entries(summary.results[0].survivors)) {
                log(`  ${faction}: ${data.count} alive, ${data.totalHp} HP remaining`)
            }
        }
    })
}


function printTriangleVerdict (matrix) {
    const checks = [
        {a: 'Skeleton', b: 'Rat', label: 'Skeleton > Rat'},
        {a: 'Rat', b: 'Inquisitor', label: 'Rat > Inquisitor'},
        {a: 'Inquisitor', b: 'Skeleton', label: 'Inquisitor > Skeleton'},
        {a: 'Shade', b: 'Skeleton', label: 'Shade > Skeleton'},
        {a: 'Shade', b: 'Rat', label: 'Shade > Rat'},
        {a: 'Shade', b: 'Inquisitor', label: 'Shade > Inquisitor'}
    ]

    log('=== Triangle Verdict ===\n')

    for (const {a, b, label} of checks) {
        const m = matrix[a][b]
        const pct = Math.round(m.winRateA * 100)
        const status = getVerdictStatus(pct)
        log(`  ${pad(label, 24)} ${pad(pct + '%', 6)} ${status}`)
    }

    log('')
}


function printUsage () {
    log('Usage:')
    log('  node ghast/run_simulation.js matrix              [--runs N] [--distance N]')
    log('  node ghast/run_simulation.js matchup TypeA TypeB  [spore1 spore2] [--runs N]')
    log('  node ghast/run_simulation.js custom config.json')
    log('')
    log('Types: Shade, Skeleton, Inquisitor, Rat')
    log('Spores: fear, sadness, anger, arrogance, naive, surprise, lust')
}


function getFlag (name, fallback) {
    const index = args.indexOf(name)

    if (index !== -1 && args[index + 1]) {
        return parseInt(args[index + 1], 10)
    }

    return fallback
}


function getVerdictStatus (pct) {
    if (pct >= 90) {
        return 'OK'
    }

    if (pct >= 70) {
        return 'WEAK'
    }

    return 'BROKEN'
}


function pad (str, width) {
    return String(str).padEnd(width)
}


function log (msg) {
    process.stdout.write(msg + '\n')
}
