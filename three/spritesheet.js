import PerkyModule from '../core/perky_module'
import Registry from '../core/registry'
import SpriteTexture from './textures/sprite_texture'


export default class Spritesheet extends PerkyModule {
    
    constructor (spritesheetData = {frames: [], meta: []}) {
        super()
        
        this.framesList = []
        this.framesMap = new Map()
        this.images = new Map()
        this.textures = new Registry()
        this.frameTextures = new Registry()
        this.metadata = spritesheetData.meta || []
        
        this.#initializeFrames(spritesheetData.frames)
    }


    #initializeFrames (frames) {
        frames.forEach(frameData => {
            const frame = {
                ...frameData,
                image: null
            }
            
            this.framesList.push(frame)
            
            if (frame.imageName) {
                this.framesMap.set(frame.imageName, frame)
            }
            
            if (frame.filename) {
                this.framesMap.set(frame.filename, frame)
            }
        })
    }


    addImage (imageKey, image) {
        this.images.set(imageKey, image)

        this.framesList.forEach(frame => {
            if (frame.baseImage === imageKey) {
                frame.image = image
            }
        })

        if (image) {
            const texture = new SpriteTexture({image})
            this.textures.set(imageKey, texture)
            this.emit('texture:created', imageKey, texture)

            this.#createFrameTexturesForImage(imageKey)
        }
        
        return this
    }


    #createFrameTexturesForImage (imageKey) {
        this.framesList.forEach(frame => {
            if (frame.baseImage === imageKey && frame.image) {
                this.#createFrameTexture(frame)
            }
        })
    }


    #createFrameTexture (frame) {
        const baseTexture = this.textures.get(frame.baseImage)
        if (!baseTexture) {
            return null
        }

        const frameTexture = new SpriteTexture({
            image: frame.image,
            frame: frame
        })

        const frameName = frame.imageName || frame.filename
        if (frameName) {
            this.frameTextures.set(frameName, frameTexture)
            this.emit('frame:texture:created', frameName, frameTexture, frame)
        }
        
        return frameTexture
    }


    getFrame (nameOrIndex) {
        if (typeof nameOrIndex === 'string') {
            return this.framesMap.get(nameOrIndex) || null
        }
        
        if (typeof nameOrIndex === 'number') {
            return this.framesList[nameOrIndex] || null
        }
        
        return null
    }


    getFrameByName (name) {
        return this.framesMap.get(name) || null
    }


    getFrameByIndex (index) {
        return this.framesList[index]
    }


    getAllFrames () {
        return [...this.framesList]
    }


    getFrameNames () {
        return Array.from(this.framesMap.keys())
    }


    getFrameCount () {
        return this.framesList.length
    }


    hasFrame (name) {
        return this.framesMap.has(name)
    }


    getImage (imageKey) {
        return this.images.get(imageKey)
    }


    getAllImages () {
        return Array.from(this.images.values())
    }


    getImageKeys () {
        return Array.from(this.images.keys())
    }


    getTexture (imageKey) {
        return this.textures.get(imageKey)
    }


    getFrameTexture (frameName) {
        return this.frameTextures.get(frameName)
    }


    getAllFrameTextures () {
        return this.frameTextures.toObject()
    }


    extractFrame (nameOrIndex, canvas) {
        const frame = this.getFrame(nameOrIndex)
        if (!frame || !frame.image) {
            return null
        }
        
        const {x, y, w, h} = frame.frame
        const extractedCanvas = canvas || document.createElement('canvas')
        
        extractedCanvas.width = w
        extractedCanvas.height = h
        
        const ctx = extractedCanvas.getContext('2d')
        ctx.drawImage(frame.image, x, y, w, h, 0, 0, w, h)
        
        return extractedCanvas
    }

}
