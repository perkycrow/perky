import {auditComments, fixComments} from './comments.js'
import {auditImports, fixImports} from './imports.js'
import {
    auditUnusedDirectives,
    fixUnusedDirectives,
    auditEslint,
    fixEslint,
    auditDisables,
    auditSwitches
} from './eslint.js'
import {auditTests} from './tests.js'
import {bold, cyan, dim} from './format.js'


function printBanner () {
    console.log('')
    console.log(cyan('  ╭─────────────────────────────╮'))
    console.log(cyan('  │') + bold('        PERKY CLEANER        ') + cyan('│'))
    console.log(cyan('  ╰─────────────────────────────╯'))
    console.log(dim('  Code quality & consistency tool'))
    console.log('')
}


export function runAudit (rootDir) {
    printBanner()

    const results = {}

    results.comments = auditComments(rootDir)
    results.imports = auditImports(rootDir)
    results.unusedDirectives = auditUnusedDirectives(rootDir)
    results.eslint = auditEslint(rootDir)
    results.disables = auditDisables(rootDir)
    results.switches = auditSwitches(rootDir)
    results.tests = auditTests(rootDir)

    return results
}


export function runFix (rootDir, options = {}) {
    const dryRun = options.dryRun ?? false
    const results = {}

    results.comments = fixComments(rootDir, dryRun)
    results.imports = fixImports(rootDir, dryRun)
    results.unusedDirectives = fixUnusedDirectives(rootDir, dryRun)

    results.eslint = dryRun ? auditEslint(rootDir) : fixEslint(rootDir)

    return results
}


export function runAll (rootDir) {
    runAudit(rootDir)
    runFix(rootDir)
}
