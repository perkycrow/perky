import Entity from '../../game/entity.js'


export default class Notebook extends Entity {

    constructor (options = {}) {
        super(options)
        this.opened = false
        this.currentSkill = null
        this.score = options.score ?? 0
        this.chapterTitle = options.chapterTitle ?? ''
    }

}
