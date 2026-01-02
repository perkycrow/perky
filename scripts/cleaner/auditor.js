import fs from 'fs'
import path from 'path'
import {findJsFiles} from './utils.js'
import {header, success, successCompact, hint, listItem, divider} from './format.js'
import {EXCLUSIONS} from './config.js'


export default class Auditor {

    static $name = 'Base'
    static $category = 'default'
    static $canFix = false

    #rootDir = null
    #options = {}

    constructor (rootDir, options = {}) {
        this.#rootDir = rootDir
        this.#options = {
            dryRun: false,
            compact: false,
            ...options
        }
    }


    get rootDir () {
        return this.#rootDir
    }


    get options () {
        return this.#options
    }


    get dryRun () {
        return this.#options.dryRun
    }


    get compact () {
        return this.#options.compact
    }


    audit () {
        const files = this.#scanFiles()
        const issues = []
        let issueCount = 0

        for (const filePath of files) {
            const relativePath = path.relative(this.#rootDir, filePath)

            if (this.#shouldExclude(relativePath)) {
                continue
            }

            const content = fs.readFileSync(filePath, 'utf-8')
            const fileIssues = this.analyze(content, relativePath, filePath)

            if (fileIssues && fileIssues.length > 0) {
                issues.push({file: relativePath, issues: fileIssues})
                issueCount += fileIssues.length
            }
        }

        this.#printResults(issues)

        return {
            filesScanned: files.length,
            filesWithIssues: issues.length,
            issueCount,
            issues
        }
    }


    fix () {
        if (!this.constructor.$canFix) {
            throw new Error(`${this.constructor.$name} does not support fix operations`)
        }

        const files = this.#scanFiles()
        let filesFixed = 0
        let issuesFixed = 0

        for (const filePath of files) {
            const relativePath = path.relative(this.#rootDir, filePath)

            if (this.#shouldExclude(relativePath)) {
                continue
            }

            const content = fs.readFileSync(filePath, 'utf-8')
            const {result, fixed, fixCount} = this.repair(content, relativePath, filePath)

            if (fixed) {
                filesFixed++
                issuesFixed += fixCount || 1

                if (!this.dryRun) {
                    fs.writeFileSync(filePath, result, 'utf-8')
                }
            }
        }

        this.#printFixSummary(filesFixed, issuesFixed)

        return {filesFixed, issuesFixed}
    }


    analyze () { // eslint-disable-line local/class-methods-use-this -- clean
        throw new Error('analyze() must be implemented by subclass')
    }


    repair (content) { // eslint-disable-line local/class-methods-use-this -- clean
        return {result: content, fixed: false}
    }


    getHint () { // eslint-disable-line local/class-methods-use-this -- clean
        return null
    }


    getExclusionCategory () {
        return this.constructor.$category
    }


    readFile (filePath) { // eslint-disable-line local/class-methods-use-this -- clean
        return fs.readFileSync(filePath, 'utf-8')
    }


    relativePath (absolutePath) {
        return path.relative(this.#rootDir, absolutePath)
    }


    printClean (message) {
        if (this.compact) {
            successCompact(message)
        } else {
            header(this.constructor.$name)
            success(message)
        }
    }


    #scanFiles () {
        return findJsFiles(this.#rootDir)
    }


    #shouldExclude (relativePath) {
        const category = this.getExclusionCategory()
        const exclusions = EXCLUSIONS[category] || EXCLUSIONS.default || []

        return exclusions.some(pattern => {
            if (typeof pattern === 'string') {
                return relativePath === pattern || relativePath.endsWith('/' + pattern)
            }
            return pattern.test(relativePath)
        })
    }


    #printResults (issues) {
        const message = `No ${this.constructor.$name.toLowerCase()} issues found`

        if (issues.length === 0) {
            if (this.compact) {
                successCompact(message)
            } else {
                header(this.constructor.$name)
                success(message)
            }
            return
        }

        header(this.constructor.$name)

        const hintText = this.getHint()
        if (hintText) {
            hint(hintText)
        }
        divider()

        for (const {file, issues: fileIssues} of issues) {
            listItem(file, fileIssues.length)
        }
    }


    #printFixSummary (filesFixed, issuesFixed) {
        const message = `No ${this.constructor.$name.toLowerCase()} issues to fix`

        if (filesFixed === 0) {
            if (this.compact) {
                successCompact(message)
            } else {
                header(`Fixing ${this.constructor.$name}`)
                success(message)
            }
        } else {
            header(`Fixing ${this.constructor.$name}`)
            success(`Fixed ${issuesFixed} issue(s) in ${filesFixed} file(s)`)
        }
    }

}
