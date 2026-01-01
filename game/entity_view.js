export default class EntityView {

    constructor (entity, context) {
        this.entity = entity
        this.context = context
        this.root = null
    }


    sync () {
        if (this.root) {
            this.root.x = this.entity.x
            this.root.y = this.entity.y
        }
    }


    dispose () {
        if (this.root && this.context.group) {
            this.context.group.remove(this.root)
        }
        this.root = null
        this.entity = null
        this.context = null
    }

}
