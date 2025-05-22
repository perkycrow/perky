
export default class Canvas2D {
    constructor (canvas) {
        this.canvas = canvas
        this.ctx = canvas.getContext('2d')
    }


    render (scene) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
        
        this.ctx.save()
        
        this.ctx.scale(1, -1)
        this.ctx.translate(0, -this.canvas.height)
        
        this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2)
        
        this.drawAxes()
        
        scene.updateMatrixWorld(true)
        
        this.updateOpacity(scene, 1.0)
        
        this.renderObject(scene)
        
        this.ctx.restore()
    }


    drawAxes () {
        this.ctx.save()
        this.ctx.strokeStyle = '#ccc'
        this.ctx.lineWidth = 1
        
        this.ctx.beginPath()
        this.ctx.moveTo(-this.canvas.width / 2, 0)
        this.ctx.lineTo(this.canvas.width / 2, 0)
        this.ctx.stroke()
        
        this.ctx.beginPath()
        this.ctx.moveTo(0, -this.canvas.height / 2)
        this.ctx.lineTo(0, this.canvas.height / 2)
        this.ctx.stroke()
        
        this.ctx.fillStyle = '#999'
        this.ctx.font = '14px Arial'
        this.ctx.scale(1, -1)
        this.ctx.fillText('X+', this.canvas.width / 2 - 30, 20)
        this.ctx.fillText('Y+', 10, -this.canvas.height / 2 + 30)
        
        this.ctx.restore()
    }


    updateOpacity (object, parentOpacity = 1.0) {
        const localOpacity = object.userData.opacity === undefined ? 1.0 : object.userData.opacity
        
        object.userData._computedOpacity = parentOpacity * localOpacity
        
        object.children.forEach(child => {
            this.updateOpacity(child, object.userData._computedOpacity)
        })
    }


    renderObject (object) {
        if (object.visible) {
            this.ctx.save()
            this.applyTransformations(object)
            this.renderObjectType(object)
            this.renderChildren(object)
            this.ctx.restore()
        }
    }


    applyTransformations (object) {
        if (object.userData._computedOpacity !== undefined) {
            this.ctx.globalAlpha = object.userData._computedOpacity
        }
        
        const m = object.matrixWorld.elements
        this.ctx.transform(m[0], m[1], m[4], m[5], m[12], m[13])
    }


    renderObjectType (object) {
        if (object.userData.renderType) {
            const renderers = {
                circle: this.renderCircle.bind(this),
                rectangle: this.renderRectangle.bind(this),
                image: this.renderImage.bind(this)
            }
            
            const renderer = renderers[object.userData.renderType]
            if (renderer) {
                renderer(object.userData)
            }
        }
    }


    renderChildren (object) {
        object.children.forEach(child => this.renderObject(child))
    }


    renderCircle (data) {
        this.ctx.beginPath()
        this.ctx.arc(0, 0, data.radius, 0, Math.PI * 2)
        this.ctx.fillStyle = data.color
        this.ctx.fill()
        if (data.strokeWidth > 0) {
            this.ctx.strokeStyle = data.strokeColor
            this.ctx.lineWidth = data.strokeWidth
            this.ctx.stroke()
        }
    }


    renderRectangle (data) {
        this.ctx.fillStyle = data.color
        this.ctx.fillRect(-data.width / 2, -data.height / 2, data.width, data.height)
        if (data.strokeWidth > 0) {
            this.ctx.strokeStyle = data.strokeColor
            this.ctx.lineWidth = data.strokeWidth
            this.ctx.strokeRect(-data.width / 2, -data.height / 2, data.width, data.height)
        }
    }


    renderImage (data) {
        if (data.image && data.image.complete) {
            this.ctx.drawImage(
                data.image, 
                -data.width / 2, 
                -data.height / 2, 
                data.width, 
                data.height
            )
        }
    }

}
