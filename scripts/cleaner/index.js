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
import {bold, cyan, dim, green, yellow} from './format.js'


function printBanner () {
    console.log('')
    console.log(cyan('  ╭─────────────────────────────╮'))
    console.log(cyan('  │') + bold('        PERKY CLEANER        ') + cyan('│'))
    console.log(cyan('  ╰─────────────────────────────╯'))
    console.log(dim('  Code quality & consistency tool'))
    console.log('')
}


function isClean (result) {
    if (!result) {
        return true
    }
    if (Array.isArray(result)) {
        return result.length === 0
    }
    if (typeof result === 'object') {
        return Object.values(result).every((value) => {
            if (typeof value === 'number') {
                return value === 0
            }
            return true
        })
    }
    return true
}


function printDigest (results) {
    console.log('')
    console.log(cyan('  ╭─────────────────────────────╮'))
    console.log(cyan('  │') + bold('           DIGEST            ') + cyan('│'))
    console.log(cyan('  ╰─────────────────────────────╯'))
    console.log('')

    const sections = [
        {key: 'comments', label: 'Comments'},
        {key: 'imports', label: 'Imports'},
        {key: 'unusedDirectives', label: 'Unused Directives'},
        {key: 'eslint', label: 'ESLint'},
        {key: 'disables', label: 'Disables'},
        {key: 'switches', label: 'Switches'},
        {key: 'tests', label: 'Tests'}
    ]

    for (const {key, label} of sections) {
        const clean = isClean(results[key])
        const status = clean ? green('✓') : yellow('!')
        const statusText = clean ? dim('clean') : yellow('issues found')
        console.log(`  ${status} ${label.padEnd(20)} ${statusText}`)
    }

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

    printDigest(results)

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
    runFix(rootDir)
    runAudit(rootDir)
}
