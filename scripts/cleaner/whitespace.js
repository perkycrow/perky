import fs from 'fs'
import path from 'path'
import * as acorn from 'acorn'
import {isExcludedFile, findJsFiles} from './utils.js'
import {header, success, listItem, divider, dim, yellow} from './format.js'


export function fixTrailingWhitespace (content) {
    const lines = content.split('\n')
    let modified = false

    const fixedLines = lines.map((line) => {
        const trimmed = line.replace(/\s+$/, '')
        if (trimmed !== line) {
            modified = true
        }
        return trimmed
    })

    return {
        result: fixedLines.join('\n'),
        modified
    }
}


export function fixEofNewline (content) {
    const trimmed = content.replace(/\n+$/, '')
    const result = trimmed + '\n'
    return {
        result,
        modified: result !== content
    }
}


function getLineGap (startLine, endLine) {
    return startLine - endLine - 1
}


function getNodeType (node) {
    if (node.type === 'FunctionDeclaration') {
        return 'function'
    }
    if (node.type === 'ClassDeclaration') {
        return 'class'
    }
    if (node.type === 'VariableDeclaration') {
        const firstDecl = node.declarations[0]
        if (firstDecl?.init?.type === 'ArrowFunctionExpression' ||
            firstDecl?.init?.type === 'FunctionExpression') {
            return 'function'
        }
        return 'variable'
    }
    return 'other'
}


function extractClassInfo (node, classDecl) {
    const classInfo = {
        type: 'class',
        start: node.loc.start.line,
        end: node.loc.end.line,
        bodyStart: classDecl.body.loc.start.line,
        bodyEnd: classDecl.body.loc.end.line,
        members: []
    }

    for (const member of classDecl.body.body) {
        classInfo.members.push({
            type: member.type,
            start: member.loc.start.line,
            end: member.loc.end.line,
            isMethod: member.type === 'MethodDefinition',
            isProperty: member.type === 'PropertyDefinition'
        })
    }

    return classInfo
}


function collectAstPositions (ast) { // eslint-disable-line complexity
    const positions = {
        imports: [],
        topLevel: [],
        classes: []
    }

    for (const node of ast.body) {
        if (node.type === 'ImportDeclaration') {
            positions.imports.push({
                type: 'import',
                start: node.loc.start.line,
                end: node.loc.end.line
            })
            continue
        }

        if (node.type === 'ExportNamedDeclaration' || node.type === 'ExportDefaultDeclaration') {
            const decl = node.declaration
            if (decl) {
                if (decl.type === 'ClassDeclaration') { // eslint-disable-line max-depth -- clean
                    const classInfo = extractClassInfo(node, decl)
                    positions.classes.push(classInfo)
                    positions.topLevel.push(classInfo)
                } else {
                    positions.topLevel.push({
                        type: getNodeType(decl),
                        start: node.loc.start.line,
                        end: node.loc.end.line
                    })
                }
            }
            continue
        }

        if (node.type === 'ClassDeclaration') {
            const classInfo = extractClassInfo(node, node)
            positions.classes.push(classInfo)
            positions.topLevel.push(classInfo)
            continue
        }

        positions.topLevel.push({
            type: getNodeType(node),
            start: node.loc.start.line,
            end: node.loc.end.line
        })
    }

    return positions
}


export function analyzeLineBreaks (content) {
    let ast
    try {
        ast = acorn.parse(content, {
            ecmaVersion: 'latest',
            sourceType: 'module',
            locations: true
        })
    } catch {
        return []
    }

    const positions = collectAstPositions(ast)
    const adjustments = []

    if (positions.imports.length > 0 && positions.topLevel.length > 0) {
        const lastImport = positions.imports[positions.imports.length - 1]
        const firstCode = positions.topLevel[0]
        const gap = getLineGap(firstCode.start, lastImport.end)

        if (gap !== 2) {
            adjustments.push({
                afterLine: lastImport.end,
                beforeLine: firstCode.start,
                currentGap: gap,
                expectedGap: 2,
                context: 'after imports'
            })
        }
    }

    const significantTypes = new Set(['function', 'class'])

    for (let i = 0; i < positions.topLevel.length - 1; i++) {
        const current = positions.topLevel[i]
        const next = positions.topLevel[i + 1]

        if (!significantTypes.has(current.type) || !significantTypes.has(next.type)) {
            continue
        }

        const gap = getLineGap(next.start, current.end)

        if (gap !== 2) {
            adjustments.push({
                afterLine: current.end,
                beforeLine: next.start,
                currentGap: gap,
                expectedGap: 2,
                context: `between ${current.type} and ${next.type}`
            })
        }
    }

    for (const classInfo of positions.classes) {
        if (classInfo.members.length > 0) {
            const firstMember = classInfo.members[0]
            const gapAfterOpen = getLineGap(firstMember.start, classInfo.bodyStart)

            if (gapAfterOpen !== 1) {
                adjustments.push({
                    afterLine: classInfo.bodyStart,
                    beforeLine: firstMember.start,
                    currentGap: gapAfterOpen,
                    expectedGap: 1,
                    context: 'after class opening'
                })
            }

            const lastMember = classInfo.members[classInfo.members.length - 1]
            const gapBeforeClose = getLineGap(classInfo.bodyEnd, lastMember.end)

            if (gapBeforeClose !== 1) {
                adjustments.push({
                    afterLine: lastMember.end,
                    beforeLine: classInfo.bodyEnd,
                    currentGap: gapBeforeClose,
                    expectedGap: 1,
                    context: 'before class closing'
                })
            }

            for (let i = 0; i < classInfo.members.length - 1; i++) {
                const current = classInfo.members[i]
                const next = classInfo.members[i + 1]
                const gap = getLineGap(next.start, current.end)

                if (current.isMethod && next.isMethod) {
                    if (gap !== 2) {
                        adjustments.push({
                            afterLine: current.end,
                            beforeLine: next.start,
                            currentGap: gap,
                            expectedGap: 2,
                            context: 'between methods'
                        })
                    }
                } else if ((current.isProperty && next.isMethod) || (current.isMethod && next.isProperty)) {
                    if (gap !== 1) {
                        adjustments.push({
                            afterLine: current.end,
                            beforeLine: next.start,
                            currentGap: gap,
                            expectedGap: 1,
                            context: 'between property and method'
                        })
                    }
                }
            }
        }
    }

    return adjustments
}


export function fixLineBreaks (content, adjustments) {
    if (adjustments.length === 0) {
        return {result: content, modified: false}
    }

    const lines = content.split('\n')
    const sortedAdjustments = [...adjustments].sort((a, b) => b.afterLine - a.afterLine)

    for (const adj of sortedAdjustments) {
        const afterIndex = adj.afterLine - 1
        const beforeIndex = adj.beforeLine - 1

        const emptyLinesStart = afterIndex + 1
        const emptyLinesEnd = beforeIndex

        const currentEmptyLines = emptyLinesEnd - emptyLinesStart

        if (currentEmptyLines >= 0) {
            const newEmptyLines = '\n'.repeat(adj.expectedGap).split('\n').slice(0, -1).map(() => '')
            lines.splice(emptyLinesStart, currentEmptyLines, ...newEmptyLines)
        }
    }

    return {
        result: lines.join('\n'),
        modified: true
    }
}


export function processContent (content) {
    const issues = []
    let result = content
    let modified = false

    const trailing = fixTrailingWhitespace(result)
    if (trailing.modified) {
        result = trailing.result
        modified = true
        issues.push('trailing whitespace')
    }

    const eof = fixEofNewline(result)
    if (eof.modified) {
        result = eof.result
        modified = true
        issues.push('EOF newline')
    }

    const adjustments = analyzeLineBreaks(result)
    if (adjustments.length > 0) {
        const lineBreaksResult = fixLineBreaks(result, adjustments)
        result = lineBreaksResult.result
        modified = true
        for (const adj of adjustments) {
            issues.push(`line breaks ${adj.context}: ${adj.currentGap} → ${adj.expectedGap}`)
        }
    }

    return {result, modified, issues}
}


function processFile (filePath, rootDir, dryRun) {
    const relativePath = path.relative(rootDir, filePath)

    if (isExcludedFile(relativePath)) {
        return null
    }

    const content = fs.readFileSync(filePath, 'utf-8')
    const {result, modified, issues} = processContent(content)

    if (!modified) {
        return null
    }

    if (!dryRun) {
        fs.writeFileSync(filePath, result, 'utf-8')
    }

    return {relativePath, issues}
}


export function auditWhitespace (rootDir) { // eslint-disable-line complexity
    header('Whitespace')

    const files = findJsFiles(rootDir)
    const filesWithIssues = []

    for (const filePath of files) {
        const relativePath = path.relative(rootDir, filePath)

        if (isExcludedFile(relativePath)) {
            continue
        }

        const content = fs.readFileSync(filePath, 'utf-8')
        const {modified, issues} = processContent(content)

        if (modified) {
            filesWithIssues.push({relativePath, issues})
        }
    }

    if (filesWithIssues.length === 0) {
        success('No whitespace issues')
        return {filesScanned: files.length, filesWithIssues: 0}
    }

    console.log(yellow(`Found issues in ${filesWithIssues.length} file(s):`))
    divider()

    for (const {relativePath, issues} of filesWithIssues) {
        listItem(relativePath)
        for (const issue of issues) {
            console.log(dim(`      ${issue}`))
        }
    }

    return {filesScanned: files.length, filesWithIssues: filesWithIssues.length}
}


export function fixWhitespace (rootDir, dryRun = false) {
    const title = dryRun ? 'Whitespace (dry run)' : 'Fixing Whitespace'
    header(title)

    const files = findJsFiles(rootDir)
    let totalFilesFixed = 0

    for (const filePath of files) {
        const result = processFile(filePath, rootDir, dryRun)

        if (result) {
            totalFilesFixed++
            listItem(result.relativePath)
            for (const issue of result.issues) {
                console.log(dim(`      ${issue}`))
            }
        }
    }

    if (totalFilesFixed === 0) {
        success('No whitespace issues to fix')
    } else {
        success(`Fixed whitespace in ${totalFilesFixed} file(s)`)
    }

    return {filesScanned: files.length, filesFixed: totalFilesFixed}
}
