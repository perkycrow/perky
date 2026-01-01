export default class Spritesheet {

    constructor (image, data) {
        this.image = image
        this.data = data || {frames: [], meta: {}}
        this.framesMap = new Map()

        this.#initializeFrames(this.data.frames)
    }


    #initializeFrames (frames) {
        if (!Array.isArray(frames)) {
            return
        }

        frames.forEach(frameData => {
            if (frameData.filename) {
                frameData.image = this.image
                this.framesMap.set(frameData.filename, frameData)
            }
        })
    }


    getFrame (name) {
        return this.framesMap.get(name)
    }


    getFrames (names) {
        if (!names) {
            return Array.from(this.framesMap.values())
        }
        if (!Array.isArray(names)) {
            return []
        }
        return names.map(name => this.getFrame(name)).filter(frame => frame !== undefined)
    }


    listFrames () {
        return Array.from(this.framesMap.keys())
    }

}
