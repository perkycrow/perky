#!/usr/bin/env node

import path from 'path'
import {fileURLToPath} from 'url'
import {runAudit, runFix, runAll} from './cleaner/index.js'


const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')

const args = process.argv.slice(2)

const hasFlag = (flag) => args.includes(flag)

const dryRun = hasFlag('--dry-run')
const auditMode = hasFlag('--audit')
const fixMode = hasFlag('--fix')


function printHelp () {
    console.log('Usage: yarn cleaner [options]\n')
    console.log('Options:')
    console.log('  --audit     Audit only (no changes)')
    console.log('  --fix       Fix issues')
    console.log('  --dry-run   Preview fixes without applying\n')
    console.log('Shortcuts:')
    console.log('  yarn clean  = yarn cleaner --audit --fix')
}


if (auditMode && fixMode) {
    await runAll(rootDir)
} else if (auditMode) {
    await runAudit(rootDir)
} else if (fixMode) {
    runFix(rootDir, {dryRun})
} else {
    printHelp()
}
