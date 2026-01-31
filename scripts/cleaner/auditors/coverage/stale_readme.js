import {execSync} from 'child_process'
import fs from 'fs'
import path from 'path'
import Auditor from '../../auditor.js'
import {shouldSkipDirectory} from '../../utils.js'
import {hint, listItem, divider} from '../../../format.js'


export default class StaleReadmeAuditor extends Auditor {

    static $name = 'Stale Readme'
    static $category = 'coverage'
    static $canFix = false

    static $hint (auditor) {
        return `Readme.md not updated within ${auditor.thresholdDays}+ days of code change — review the folder and update if needed`
    }

    thresholdDays = 7

    audit () {
        const staleReadmes = this.#findStaleReadmes()

        if (staleReadmes.length === 0) {
            this.printClean('All Readme.md files are up to date')
            return {staleReadmes: 0, files: []}
        }

        this.printHeader()
        if (!this.silent) {
            hint(`Readme.md not updated within ${this.thresholdDays} days of code change`)
            divider()

            for (const {file, daysBehind} of staleReadmes) {
                listItem(`${file} (${daysBehind} days behind)`)
            }
        }

        return {staleReadmes: staleReadmes.length, files: staleReadmes.map(s => s.file)}
    }


    #findStaleReadmes () {
        const directories = this.#findDirectoriesWithReadme()
        const stale = []

        for (const dirPath of directories) {
            const readmePath = path.join(dirPath, 'Readme.md')
            const readmeDate = this.#getLastCommitDate(readmePath)

            if (!readmeDate) {
                continue
            }

            const newestCodeDate = this.#getNewestCodeDate(dirPath)

            if (!newestCodeDate) {
                continue
            }

            const diffDays = Math.floor((newestCodeDate - readmeDate) / (1000 * 60 * 60 * 24))

            if (diffDays > this.thresholdDays) {
                stale.push({
                    file: path.relative(this.rootDir, readmePath),
                    daysBehind: diffDays
                })
            }
        }

        return stale.sort((a, b) => b.daysBehind - a.daysBehind)
    }


    #findDirectoriesWithReadme () {
        const directories = []

        if (this.targetPath) {
            if (fs.existsSync(path.join(this.targetPath, 'Readme.md'))) {
                directories.push(this.targetPath)
            }
            this.#collectSubdirectories(this.targetPath, directories)
            return directories
        }

        if (fs.existsSync(path.join(this.rootDir, 'Readme.md'))) {
            directories.push(this.rootDir)
        }

        this.#collectSubdirectories(this.rootDir, directories)
        return directories
    }


    #collectSubdirectories (dir, directories) {
        const entries = fs.readdirSync(dir, {withFileTypes: true})

        for (const entry of entries) {
            if (!entry.isDirectory() || shouldSkipDirectory(entry.name)) {
                continue
            }

            const fullPath = path.join(dir, entry.name)

            if (fs.existsSync(path.join(fullPath, 'Readme.md'))) {
                directories.push(fullPath)
            }

            this.#collectSubdirectories(fullPath, directories)
        }
    }


    #getNewestCodeDate (dirPath) {
        const entries = fs.readdirSync(dirPath, {withFileTypes: true})
        let newest = null

        for (const entry of entries) {
            if (!entry.isFile() || !entry.name.endsWith('.js')) {
                continue
            }

            if (entry.name.endsWith('.test.js') || entry.name.endsWith('.doc.js') || entry.name.endsWith('.guide.js')) {
                continue
            }

            const date = this.#getLastCommitDate(path.join(dirPath, entry.name))

            if (date && (!newest || date > newest)) {
                newest = date
            }
        }

        return newest
    }


    #getLastCommitDate (filePath) {
        try {
            const timestamp = execSync(
                `git log -1 --format=%ct -- "${filePath}"`,
                {cwd: this.rootDir, encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe']}
            ).trim()

            if (!timestamp) {
                return null
            }

            return new Date(parseInt(timestamp, 10) * 1000)
        } catch {
            return null
        }
    }

}
