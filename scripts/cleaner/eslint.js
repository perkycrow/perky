import fs from 'fs'
import path from 'path'
import {execSync} from 'child_process'
import {findJsFiles, groupBy} from './utils.js'
import {header, subHeader, success, hint, listItem, divider} from './format.js'


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
    header('Unused ESLint Directives')

    const unused = findUnusedEslintDirectives(rootDir)

    if (unused.length === 0) {
        success('No unused eslint-disable directives')
        return {filesWithIssues: 0, directivesFound: 0}
    }

    const filesWithIssues = unused.map(f => f.relativePath)
    let totalDirectives = unused.reduce((sum, f) => sum + f.directives.length, 0)

    hint('Remove directives that no longer suppress any rules')
    divider()

    for (const file of filesWithIssues) {
        listItem(file)
    }

    return {filesWithIssues: unused.length, directivesFound: totalDirectives}
}


export function fixUnusedDirectives (rootDir, dryRun = false) {
    const title = dryRun ? 'Unused Directives (dry run)' : 'Fixing Unused Directives'
    header(title)

    const unused = findUnusedEslintDirectives(rootDir)

    if (unused.length === 0) {
        success('No unused eslint-disable directives')
        return {filesFixed: 0, directivesRemoved: 0}
    }

    let totalDirectives = 0

    for (const file of unused) {
        totalDirectives += file.directives.length
        if (!dryRun) {
            fixFileDirectives(file)
        }
    }

    success(`Removed ${totalDirectives} directive(s) in ${unused.length} file(s)`)

    return {filesFixed: unused.length, directivesRemoved: totalDirectives}
}


// === ESLINT ERRORS ===

export function auditEslint (rootDir) {
    header('ESLint Errors')

    const {output} = runEslintCommand('--format json .', rootDir)
    const data = parseEslintJson(output)

    if (!data) {
        hint('Failed to parse ESLint output')
        return {errorCount: 0, warningCount: 0, filesWithIssues: 0}
    }

    const filesWithErrors = data.filter(f => f.messages.length > 0)

    if (filesWithErrors.length === 0) {
        success('No ESLint errors or warnings')
        return {errorCount: 0, warningCount: 0, filesWithIssues: 0}
    }

    hint('Run npx eslint . for detailed error messages')
    divider()

    for (const file of filesWithErrors) {
        const relativePath = path.relative(rootDir, file.filePath)
        listItem(relativePath)
    }

    const totalErrors = filesWithErrors.reduce((sum, f) => sum + f.messages.filter(m => m.severity === 2).length, 0)
    const totalWarnings = filesWithErrors.reduce((sum, f) => sum + f.messages.filter(m => m.severity === 1).length, 0)

    return {errorCount: totalErrors, warningCount: totalWarnings, filesWithIssues: filesWithErrors.length}
}


export function fixEslint (rootDir) {
    header('Auto-fixing ESLint')

    runEslintCommand('--fix .', rootDir)
    success('Auto-fix completed')

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


const ruleHints = {
    complexity: 'Split into smaller functions or methods (use a function below the class if "this" is not needed). Acceptable in constructors or algorithmic functions where abstraction hurts readability/performance',
    'class-methods-use-this': 'Private method (#)? Use a function below the class. Public? Check if it needs to be exposed, if not use a function below the class',
    'no-unused-vars': 'Remove the unused variable'
}


export function auditDisables (rootDir) {
    header('ESLint Disables')

    const disables = findEslintDisables(rootDir)

    if (disables.length === 0) {
        success('No eslint-disable directives found')
        return {directivesFound: 0, rulesFound: 0}
    }

    const byRule = groupBy(disables, d => d.rule)
    const sortedRules = Object.entries(byRule).sort((a, b) => b[1].length - a[1].length)

    hint('Consider fixing the underlying issue instead of suppressing')
    divider()

    for (const [rule, occurrences] of sortedRules) {
        subHeader(`${rule} (${occurrences.length})`)
        if (ruleHints[rule]) {
            hint(ruleHints[rule])
        }
        for (const occ of occurrences) {
            listItem(`${occ.file}:${occ.line}`)
        }
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
    header('Switch Statements')

    const switches = findSwitchStatements(rootDir)

    if (switches.length === 0) {
        success('No switch statements found')
        return {switchesFound: 0, filesWithSwitches: 0}
    }

    const byFile = groupBy(switches, s => s.file)
    const files = Object.keys(byFile)

    hint('Consider refactoring to object lookups or polymorphism')
    divider()

    for (const file of files) {
        listItem(file)
    }

    return {switchesFound: switches.length, filesWithSwitches: files.length}
}
