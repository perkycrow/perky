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

}
