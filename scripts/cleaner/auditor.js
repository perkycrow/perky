import fs from 'fs'
import path from 'path'
import {findJsFiles} from './utils.js'
import {header, success, hint, listItem, divider} from './format.js'
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


    audit () {
        this.#printHeader()

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

        const title = this.dryRun
            ? `${this.constructor.$name} (dry run)`
            : `Fixing ${this.constructor.$name}`

        header(title)

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


    #printHeader () {
        header(this.constructor.$name)
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
        if (issues.length === 0) {
            success(`No ${this.constructor.$name.toLowerCase()} issues found`)
            return
        }

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
        if (filesFixed === 0) {
            success(`No ${this.constructor.$name.toLowerCase()} issues to fix`)
        } else {
            success(`Fixed ${issuesFixed} issue(s) in ${filesFixed} file(s)`)
        }
    }

}
