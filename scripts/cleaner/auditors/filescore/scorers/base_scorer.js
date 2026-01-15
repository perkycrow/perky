export default class BaseScorer {

    static $name = 'Base'
    static $weight = 1
    static $description = ''

    #rootDir = null
    #excludeDirs = []

    constructor (rootDir) {
        this.#rootDir = rootDir
    }


    get rootDir () {
        return this.#rootDir
    }


    get excludeDirs () {
        return this.#excludeDirs
    }


    set excludeDirs (dirs) {
        this.#excludeDirs = dirs
    }


    get name () {
        return this.constructor.$name
    }


    get weight () {
        return this.constructor.$weight
    }


    score () {
        return {points: this.weight * 0, breakdown: []}
    }

}
