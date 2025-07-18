export default class SceneManager {
    constructor (game) {
        this.game = game
        this.scenes = new Map()
        this.currentScene = null
        this.isTransitioning = false
    }

    addScene (name, sceneClass) {
        this.scenes.set(name, sceneClass)
    }

    async switchTo (sceneName, ...args) {
        if (this.isTransitioning) {
            console.warn(`Already transitioning to scene: ${sceneName}`)
            return
        }

        if (!this.scenes.has(sceneName)) {
            console.error(`Scene not found: ${sceneName}`)
            return
        }

        this.isTransitioning = true

        // Cleanup current scene
        if (this.currentScene) {
            await this.currentScene.cleanup()
        }

        // Create and initialize new scene
        const SceneClass = this.scenes.get(sceneName)
        this.currentScene = new SceneClass(this.game)
        
        console.log(`🎬 Switching to scene: ${sceneName}`)
        await this.currentScene.init(...args)

        this.isTransitioning = false
    }

    update (deltaTime) {
        if (this.currentScene && !this.isTransitioning) {
            this.currentScene.update(deltaTime)
        }
    }

    getCurrentScene () {
        return this.currentScene
    }
} 