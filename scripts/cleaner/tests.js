import fs from 'fs'
import path from 'path'
import {findJsFiles, isExcludedFile} from './utils.js'


function shouldExcludeFromTestAudit (relativePath) { // eslint-disable-line complexity
    if (!relativePath.includes('/')) {
        return true
    }

    if (relativePath.endsWith('/index.js') || relativePath === 'index.js') {
        return true
    }

    if (relativePath.startsWith('scripts/') && relativePath.split('/').length === 2) {
        return true
    }

    if (relativePath.startsWith('examples/')) {
        return true
    }

    if (relativePath.endsWith('_controller.js') &&
        !relativePath.startsWith('game/') &&
        !relativePath.startsWith('application/')) {
        return true
    }

    if (relativePath.endsWith('_renderer.js') && !relativePath.startsWith('render/')) {
        return true
    }

    return false
}


function findFilesWithoutTests (rootDir) {
    const files = findJsFiles(rootDir)
    const missing = []

    for (const filePath of files) {
        const relativePath = path.relative(rootDir, filePath)

        if (isExcludedFile(relativePath)) {
            continue
        }

        if (relativePath.endsWith('.test.js')) {
            continue
        }

        if (shouldExcludeFromTestAudit(relativePath)) {
            continue
        }

        const testPath = filePath.replace(/\.js$/, '.test.js')

        if (!fs.existsSync(testPath)) {
            missing.push({
                file: relativePath,
                expectedTest: path.relative(rootDir, testPath)
            })
        }
    }

    return missing
}


export function auditTests (rootDir) {
    console.log('\n=== MISSING TESTS ===\n')

    const missing = findFilesWithoutTests(rootDir)

    if (missing.length === 0) {
        console.log('All files have corresponding test files.\n')
        return {filesWithoutTests: 0}
    }

    console.log('Create the following test files. Each test file should import')
    console.log('the corresponding module and test its exported functions.\n')

    for (const {expectedTest} of missing) {
        console.log(`- ${expectedTest}`)
    }

    console.log('')

    return {filesWithoutTests: missing.length}
}
