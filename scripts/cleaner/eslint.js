import fs from 'fs'
import path from 'path'
import {execSync} from 'child_process'
import {findJsFiles, groupBy} from './utils.js'


export function isUnusedDirectiveMessage (message) {
    return message && message.includes('Unused eslint-disable directive')
}


function runEslintCommand (args, rootDir) {
    try {
        const output = execSync(`npx eslint ${args}`, {
            cwd: rootDir,
            encoding: 'utf-8',
            stdio: ['pipe', 'pipe', 'pipe']
        })
        return {output, error: null}
    } catch (error) {
        return {output: error.stdout || null, error}
    }
}


function parseEslintJson (output) {
    if (!output) {
        return null
    }
    try {
        return JSON.parse(output)
    } catch {
        return null
    }
}


// === UNUSED DIRECTIVES ===

function extractUnusedFromFile (file, rootDir) {
    const unusedMessages = file.messages.filter(m => isUnusedDirectiveMessage(m.message))

    if (unusedMessages.length === 0) {
        return null
    }

    return {
        filePath: file.filePath,
        relativePath: path.relative(rootDir, file.filePath),
        directives: unusedMessages.map(m => ({line: m.line, message: m.message}))
    }
}


function findUnusedEslintDirectives (rootDir) {
    const {output} = runEslintCommand('--report-unused-disable-directives --format json .', rootDir)
    const data = parseEslintJson(output)

    if (!data) {
        return []
    }

    return data.map(file => extractUnusedFromFile(file, rootDir)).filter(Boolean)
}


export function removeUnusedDirective (content, line) {
    const lines = content.split('\n')
    const lineIndex = line - 1

    if (lineIndex < 0 || lineIndex >= lines.length) {
        return content
    }

    const currentLine = lines[lineIndex]

    const inlineMatch = currentLine.match(/^(.+?)\s*\/\/\s*eslint-disable-line\s+[\w-]+\s*$/)
    if (inlineMatch) {
        lines[lineIndex] = inlineMatch[1].trimEnd()
        return lines.join('\n')
    }

    const standaloneMatch = currentLine.match(/^\s*\/\/\s*eslint-disable-next-line\s+[\w-]+\s*$/)
    if (standaloneMatch) {
        lines.splice(lineIndex, 1)
        return lines.join('\n')
    }

    const blockMatch = currentLine.match(/^\s*\/\*\s*eslint-disable\s+[\w-]+\s*\*\/\s*$/)
    if (blockMatch) {
        lines.splice(lineIndex, 1)
        return lines.join('\n')
    }

    return content
}


function fixFileDirectives (file) {
    let content = fs.readFileSync(file.filePath, 'utf-8')
    const sortedDirectives = [...file.directives].sort((a, b) => b.line - a.line)

    for (const directive of sortedDirectives) {
        content = removeUnusedDirective(content, directive.line)
    }

    fs.writeFileSync(file.filePath, content, 'utf-8')
}


export function auditUnusedDirectives (rootDir) {
    console.log('\n=== UNUSED ESLINT DIRECTIVES ===\n')

    const unused = findUnusedEslintDirectives(rootDir)

    if (unused.length === 0) {
        console.log('No unused eslint-disable directives.\n')
        return {filesWithIssues: 0, directivesFound: 0}
    }

    const filesWithIssues = unused.map(f => f.relativePath)
    let totalDirectives = unused.reduce((sum, f) => sum + f.directives.length, 0)

    console.log('Remove unused eslint-disable directives from the following files.')
    console.log('These directives suppress rules that are no longer being triggered.\n')

    for (const file of filesWithIssues) {
        console.log(`- ${file}`)
    }

    console.log('')

    return {filesWithIssues: unused.length, directivesFound: totalDirectives}
}


export function fixUnusedDirectives (rootDir, dryRun = false) {
    console.log(dryRun ? '\n=== DRY RUN: UNUSED DIRECTIVES ===' : '\n=== FIXING UNUSED DIRECTIVES ===')
    console.log('')

    const unused = findUnusedEslintDirectives(rootDir)

    if (unused.length === 0) {
        console.log('No unused eslint-disable directives found.')
        return {filesFixed: 0, directivesRemoved: 0}
    }

    let totalDirectives = 0

    for (const file of unused) {
        console.log(`${file.relativePath}:`)
        file.directives.forEach(d => console.log(`  Line ${d.line}: ${d.message}`))
        totalDirectives += file.directives.length

        if (!dryRun) {
            fixFileDirectives(file)
            console.log('  -> Fixed')
        }
    }

    console.log(`\nTotal: ${totalDirectives} unused directive(s) in ${unused.length} file(s)`)

    if (dryRun) {
        console.log('Run without --dry-run to remove them.')
    }

    return {filesFixed: unused.length, directivesRemoved: totalDirectives}
}


// === ESLINT ERRORS ===

export function auditEslint (rootDir) {
    console.log('\n=== ESLINT ERRORS ===\n')

    const {output} = runEslintCommand('--format json .', rootDir)
    const data = parseEslintJson(output)

    if (!data) {
        console.log('Failed to parse ESLint output.\n')
        return {errorCount: 0, warningCount: 0, filesWithIssues: 0}
    }

    const filesWithErrors = data.filter(f => f.messages.length > 0)

    if (filesWithErrors.length === 0) {
        console.log('No ESLint errors or warnings.\n')
        return {errorCount: 0, warningCount: 0, filesWithIssues: 0}
    }

    console.log('Fix ESLint errors in the following files. Run `yarn lint`')
    console.log('to see detailed error messages and line numbers.\n')

    for (const file of filesWithErrors) {
        const relativePath = path.relative(rootDir, file.filePath)
        console.log(`- ${relativePath}`)
    }

    console.log('')

    const totalErrors = filesWithErrors.reduce((sum, f) => sum + f.messages.filter(m => m.severity === 2).length, 0)
    const totalWarnings = filesWithErrors.reduce((sum, f) => sum + f.messages.filter(m => m.severity === 1).length, 0)

    return {errorCount: totalErrors, warningCount: totalWarnings, filesWithIssues: filesWithErrors.length}
}


export function fixEslint (rootDir) {
    console.log('\n=== AUTO-FIXING ESLINT ERRORS ===\n')

    const {error} = runEslintCommand('--fix .', rootDir)

    if (error) {
        console.log('Auto-fix completed (some issues may remain).')
    } else {
        console.log('Auto-fix completed.')
    }

    return auditEslint(rootDir)
}


// === ESLINT DISABLE AUDIT ===

function findEslintDisables (rootDir) {
    const files = findJsFiles(rootDir)
    const disables = []

    const patterns = [
        /eslint-disable-next-line\s+([\w-]+(?:,\s*[\w-]+)*)/,
        /eslint-disable-line\s+([\w-]+(?:,\s*[\w-]+)*)/,
        /eslint-disable\s+([\w-]+(?:,\s*[\w-]+)*)/
    ]

    for (const filePath of files) {
        const relativePath = path.relative(rootDir, filePath)
        const content = fs.readFileSync(filePath, 'utf-8')
        const lines = content.split('\n')

        lines.forEach((line, index) => {
            for (const pattern of patterns) {
                const match = line.match(pattern)
                if (match) {
                    const rules = match[1].split(',').map(r => r.trim())
                    rules.forEach(rule => {
                        disables.push({
                            file: relativePath,
                            line: index + 1,
                            rule,
                            context: line.trim()
                        })
                    })
                }
            }
        })
    }

    return disables
}


export function auditDisables (rootDir) {
    console.log('=== ESLINT DISABLES ===\n')

    const disables = findEslintDisables(rootDir)

    if (disables.length === 0) {
        console.log('No eslint-disable directives found.\n')
        return {directivesFound: 0, rulesFound: 0}
    }

    const byRule = groupBy(disables, d => d.rule)
    const sortedRules = Object.entries(byRule).sort((a, b) => b[1].length - a[1].length)

    console.log('Review eslint-disable directives. Consider fixing the underlying')
    console.log('issue instead of suppressing the rule when possible.\n')

    for (const [rule, occurrences] of sortedRules) {
        console.log(`${rule} (${occurrences.length}):`)
        for (const occ of occurrences) {
            console.log(`- ${occ.file}:${occ.line}`)
        }
        console.log('')
    }

    return {directivesFound: disables.length, rulesFound: sortedRules.length}
}


// === SWITCH AUDIT ===

function findSwitchStatements (rootDir) {
    const files = findJsFiles(rootDir)
    const switches = []

    for (const filePath of files) {
        const relativePath = path.relative(rootDir, filePath)
        const content = fs.readFileSync(filePath, 'utf-8')
        const lines = content.split('\n')

        lines.forEach((line, index) => {
            const match = line.match(/\bswitch\s*\(/)
            if (match) {
                switches.push({
                    file: relativePath,
                    line: index + 1,
                    context: line.trim()
                })
            }
        })
    }

    return switches
}


export function auditSwitches (rootDir) {
    console.log('=== SWITCH STATEMENTS ===\n')

    const switches = findSwitchStatements(rootDir)

    if (switches.length === 0) {
        console.log('No switch statements found.\n')
        return {switchesFound: 0, filesWithSwitches: 0}
    }

    const byFile = groupBy(switches, s => s.file)
    const files = Object.keys(byFile)

    console.log('Consider refactoring switch statements to object lookups or')
    console.log('polymorphism for better maintainability.\n')

    for (const file of files) {
        console.log(`- ${file}`)
    }

    console.log('')

    return {switchesFound: switches.length, filesWithSwitches: files.length}
}
