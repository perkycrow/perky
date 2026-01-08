#!/usr/bin/env node

import fs from 'fs'
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


const targetPath = args.find(arg => !arg.startsWith('--'))


function validateTargetPath (pathArg) {
    if (!pathArg) {
        return null
    }

    const absolutePath = path.resolve(rootDir, pathArg)


    if (!fs.existsSync(absolutePath)) {
        console.error(`Error: Path '${pathArg}' does not exist`)
        process.exit(1)
    }


    if (!absolutePath.startsWith(rootDir)) {
        console.error(`Error: Path '${pathArg}' is outside project directory`)
        process.exit(1)
    }


    const stats = fs.statSync(absolutePath)
    if (stats.isFile() && !absolutePath.endsWith('.js')) {
        console.error(`Error: Only .js files can be cleaned (got '${pathArg}')`)
        process.exit(1)
    }

    return absolutePath
}


function printHelp () {
    console.log('Usage: yarn cleaner [options] [path]\n')
    console.log('Options:')
    console.log('  --audit     Audit only (no changes)')
    console.log('  --fix       Fix issues')
    console.log('  --coverage  Check test coverage (stale tests, missing exports)')
    console.log('  --dry-run   Preview fixes without applying\n')
    console.log('Arguments:')
    console.log('  path        Optional path to specific file or directory to clean')
    console.log('              Examples: core/ or core/perky_module.js\n')
    console.log('Shortcuts:')
    console.log('  yarn clean           = yarn cleaner --audit --fix')
    console.log('  yarn clean core/     = yarn cleaner --audit --fix core/')
    console.log('  yarn clean file.js   = yarn cleaner --audit --fix file.js')
}


const validatedPath = validateTargetPath(targetPath)

if (coverageMode) {
    await runCoverage(rootDir, {targetPath: validatedPath})
} else if (auditMode && fixMode) {
    await runAll(rootDir, {targetPath: validatedPath})
} else if (auditMode) {
    await runAudit(rootDir, {targetPath: validatedPath})
} else if (fixMode) {
    runFix(rootDir, {dryRun, targetPath: validatedPath})
} else {
    printHelp()
}
