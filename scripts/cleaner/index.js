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


export function runAudit (rootDir, options = {}) {
    const results = {}

    results.comments = auditComments(rootDir)
    results.imports = auditImports(rootDir)
    results.unusedDirectives = auditUnusedDirectives(rootDir)
    results.eslint = auditEslint(rootDir)

    if (options.disables) {
        results.disables = auditDisables(rootDir)
    }

    if (options.switches) {
        results.switches = auditSwitches(rootDir)
    }

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


export function runAll (rootDir, options = {}) {
    const dryRun = options.dryRun ?? false

    console.log('=== CODEBASE CLEANER ===\n')

    return runFix(rootDir, {dryRun})
}
