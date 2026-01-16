import TextureRegion from './textures/texture_region.js'


export default class Spritesheet {

    constructor (source) {
        this.images = source.images || [source.image]
        this.data = source.data || {frames: [], animations: {}, meta: {}}
        this.framesMap = new Map()
        this.animations = this.data.animations || {}

        this.#initializeFrames(this.data.frames)
    }


    #initializeFrames (frames) {
        if (!Array.isArray(frames)) {
            return
        }

        for (const frameData of frames) {
            if (!frameData.filename) {
                continue
            }

            const atlasIndex = frameData.atlas ?? 0
            const image = this.images[atlasIndex]

            const region = new TextureRegion({
                image,
                x: frameData.frame.x,
                y: frameData.frame.y,
                width: frameData.frame.w,
                height: frameData.frame.h
            })

            this.framesMap.set(frameData.filename, {
                ...frameData,
                region,
                image
            })
        }
    }


    getFrame (name) {
        return this.framesMap.get(name) || null
    }


    getRegion (name) {
        const frame = this.framesMap.get(name)
        return frame?.region || null
    }


    getFrames (names) {
        if (!names) {
            return Array.from(this.framesMap.values())
        }
        if (!Array.isArray(names)) {
            return []
        }
        return names.map(name => this.getFrame(name)).filter(Boolean)
    }


    getRegions (names) {
        return this.getFrames(names).map(frame => frame.region)
    }


    getAnimation (name) {
        return this.animations[name] || null
    }


    getAnimationRegions (name) {
        const frameNames = this.getAnimation(name)
        if (!frameNames) {
            return []
        }
        return this.getRegions(frameNames)
    }


    listFrames () {
        return Array.from(this.framesMap.keys())
    }


    listAnimations () {
        return Object.keys(this.animations)
    }

}
