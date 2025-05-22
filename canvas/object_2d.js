import {Object3D} from 'three'


export default class Object2D extends Object3D {
    constructor (options = {}) {
        super()
        
        const {
            x = 0,
            y = 0,
            rotation = 0,
            scaleX = 1,
            scaleY = 1,
            opacity = 1,
            visible = true
        } = options
        
        this.position.set(x, y, 0)
        this.rotation.z = rotation
        this.scale.set(scaleX, scaleY, 1)
        
        this.userData.opacity = opacity
        this.visible = visible
        
        this.userData.renderType = this.constructor.name.toLowerCase()
    }


    setPosition (x, y) {
        this.position.set(x, y, 0)
        return this
    }


    setRotation (rotation) {
        this.rotation.z = rotation
        return this
    }


    setScale (scaleX, scaleY = scaleX) {
        this.scale.set(scaleX, scaleY, 1)
        return this
    }


    setOpacity (opacity) {
        this.userData.opacity = opacity
        return this
    }


    animateOpacity (from, to, duration, callback) {
        const startTime = Date.now()
        const animate = () => {
            const elapsed = Date.now() - startTime
            const progress = Math.min(elapsed / duration, 1)
            const easedProgress = 0.5 - Math.cos(progress * Math.PI) / 2
            
            this.userData.opacity = from + (to - from) * easedProgress
            
            if (progress < 1) {
                requestAnimationFrame(animate)
            } else if (callback) {
                callback()
            }
        }
        animate()

        return this
    }

}
