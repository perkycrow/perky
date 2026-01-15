export default class BaseScorer {

    static $name = 'Base'
    static $weight = 1
    static $description = ''

    #rootDir = null

    constructor (rootDir) {
        this.#rootDir = rootDir
    }


    get rootDir () {
        return this.#rootDir
    }


    get name () {
        return this.constructor.$name
    }


    get weight () {
        return this.constructor.$weight
    }


    score () {
        return 0
    }

}
