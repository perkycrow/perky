import CommentsAuditor from './auditors/comments.js'
import WhitespaceAuditor from './auditors/whitespace.js'
import ImportsAuditor from './auditors/imports.js'
import ConsoleAuditor from './auditors/console.js'
import PrivacyAuditor from './auditors/privacy.js'

import EslintErrorsAuditor from './auditors/eslint/errors.js'
import DirectivesAuditor from './auditors/eslint/directives.js'
import DisablesAuditor from './auditors/eslint/disables.js'
import SwitchesAuditor from './auditors/eslint/switches.js'

import MissingTestsAuditor from './auditors/tests/missing.js'
import DeepNestingAuditor from './auditors/tests/deep_nesting.js'
import ItUsageAuditor from './auditors/tests/it_usage.js'
import SingleDescribesAuditor from './auditors/tests/single_describes.js'

import {bold, cyan, dim, green, yellow} from './format.js'


const AUDIT_AUDITORS = [
    WhitespaceAuditor,
    CommentsAuditor,
    ImportsAuditor,
    ConsoleAuditor,
    DirectivesAuditor,
    EslintErrorsAuditor,
    DisablesAuditor,
    SwitchesAuditor,
    PrivacyAuditor,
    MissingTestsAuditor,
    DeepNestingAuditor,
    ItUsageAuditor,
    SingleDescribesAuditor
]


const FIX_AUDITORS = [
    WhitespaceAuditor,
    CommentsAuditor,
    ImportsAuditor,
    DirectivesAuditor,
    EslintErrorsAuditor
]


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
        const ignoredKeys = new Set(['filesScanned', 'issues'])

        return Object.entries(result).every(([key, value]) => {
            if (ignoredKeys.has(key)) {
                return true
            }
            if (typeof value === 'number') {
                return value === 0
            }
            if (Array.isArray(value)) {
                return value.length === 0
            }
            return true
        })
    }
    return true
}


function printDigest (results) {
    const allClean = Object.values(results).every(isClean)

    if (allClean) {
        console.log('')
        console.log(green('✓') + bold(' All clean!'))
        console.log('')
        return
    }

    console.log('')
    console.log(cyan('  ╭─────────────────────────────╮'))
    console.log(cyan('  │') + bold('           DIGEST            ') + cyan('│'))
    console.log(cyan('  ╰─────────────────────────────╯'))
    console.log('')

    for (const [name, result] of Object.entries(results)) {
        const clean = isClean(result)
        const status = clean ? green('✓') : yellow('!')
        const statusText = clean ? dim('clean') : yellow('issues found')
        console.log(`  ${status} ${name.padEnd(24)} ${statusText}`)
    }

    console.log('')
}


function getAuditorKey (AuditorClass) {
    return AuditorClass.$name.toLowerCase().replace(/\s+/g, '_').replace(/[()]/g, '')
}


export async function runAudit (rootDir, options = {}) {
    if (options.showBanner !== false) {
        printBanner()
    }

    const auditorOptions = {compact: true, ...options}
    const results = {}

    for (const AuditorClass of AUDIT_AUDITORS) {
        const auditor = new AuditorClass(rootDir, auditorOptions)
        const key = getAuditorKey(AuditorClass)

        if (auditor.audit.constructor.name === 'AsyncFunction') {
            results[key] = await auditor.audit()
        } else {
            results[key] = auditor.audit()
        }
    }

    printDigest(results)

    return results
}


export function runFix (rootDir, options = {}) {
    const auditorOptions = {compact: true, ...options}
    const results = {}

    for (const AuditorClass of FIX_AUDITORS) {
        if (!AuditorClass.$canFix) {
            continue
        }

        const auditor = new AuditorClass(rootDir, auditorOptions)
        const key = getAuditorKey(AuditorClass)
        results[key] = auditor.fix()
    }

    return results
}


export async function runAll (rootDir) {
    printBanner()
    runFix(rootDir)
    await runAudit(rootDir, {showBanner: false})
}
