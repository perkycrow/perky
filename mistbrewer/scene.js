export default class Scene {
    constructor (game) {
        this.game = game
        this.objects = []
        this.initialized = false
    }

    async init () {
        console.log(`Initializing scene: ${this.constructor.name}`)
        this.initialized = true
    }

    update (deltaTime) {
        if (!this.initialized) {
            return
        }
        
        for (const object of this.objects) {
            if (object.update) {
                object.update(deltaTime)
            }
        }
    }

    addObject (object) {
        this.objects.push(object)
        if (this.game.scene && object.object3d) {
            this.game.scene.add(object.object3d)
        }
    }

    removeObject (object) {
        const index = this.objects.indexOf(object)
        if (index > -1) {
            this.objects.splice(index, 1)
            if (this.game.scene && object.object3d) {
                this.game.scene.remove(object.object3d)
            }
        }
    }

    async cleanup () {
        console.log(`Cleaning up scene: ${this.constructor.name}`)
        
        // Remove all objects from the scene
        for (const object of this.objects) {
            if (this.game.scene && object.object3d) {
                this.game.scene.remove(object.object3d)
            }
        }
        
        this.objects = []
        this.initialized = false
    }
} 