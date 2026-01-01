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
const disables = hasFlag('--disables')
const switches = hasFlag('--switches')


if (auditMode && fixMode) {
    console.log('Error: Cannot use both --audit and --fix together.')
    process.exit(1)
}

if (auditMode) {
    runAudit(rootDir, {disables, switches})
} else if (fixMode) {
    runFix(rootDir, {dryRun})
} else {
    runAll(rootDir, {dryRun})
}
