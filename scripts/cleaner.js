#!/usr/bin/env node

import path from 'path'
import {fileURLToPath} from 'url'
import {runAudit, runFix, runAll, runCoverage} from './cleaner/index.js'


const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')

const args = process.argv.slice(2)

const hasFlag = (flag) => args.includes(flag)

const dryRun = hasFlag('--dry-run')
const auditMode = hasFlag('--audit')
const fixMode = hasFlag('--fix')
const coverageMode = hasFlag('--coverage')


function printHelp () {
    console.log('Usage: yarn cleaner [options]\n')
    console.log('Options:')
    console.log('  --audit     Audit only (no changes)')
    console.log('  --fix       Fix issues')
    console.log('  --coverage  Check test coverage (stale tests, missing exports)')
    console.log('  --dry-run   Preview fixes without applying\n')
    console.log('Shortcuts:')
    console.log('  yarn clean  = yarn cleaner --audit --fix')
}


if (coverageMode) {
    await runCoverage(rootDir)
} else if (auditMode && fixMode) {
    await runAll(rootDir)
} else if (auditMode) {
    await runAudit(rootDir)
} else if (fixMode) {
    runFix(rootDir, {dryRun})
} else {
    printHelp()
}
