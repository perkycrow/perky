import PerkyModule from '../core/perky_module.js'
import SpriteAnimation from './sprite_animation.js'


export default class SpriteAnimator extends PerkyModule {

    static $category = 'spriteAnimator'

    constructor ({sprite, config, textureSystem} = {}) {
        super()
        this.sprite = sprite
        this.textureSystem = textureSystem
        this.current = null

        const animationsConfig = config || this.constructor.animations
        if (animationsConfig) {
            this.loadConfig(animationsConfig)
        }
    }


    loadConfig (config) {
        for (const [name, animConfig] of Object.entries(config)) {
            const frames = this.resolveFrames(animConfig)

            const animation = this.create(SpriteAnimation, {
                $id: name,
                sprite: this.sprite,
                frames,
                fps: animConfig.fps ?? 12,
                loop: animConfig.loop ?? true,
                playbackMode: animConfig.playbackMode ?? 'forward'
            })

            registerFrameEvents(animation, frames)
        }
    }


    resolveFrames (animConfig) {
        if (animConfig.source) {
            return this.resolveSourceFrames(animConfig.source)
        }

        if (animConfig.frames) {
            return animConfig.frames.map(frame => this.resolveFrame(frame))
        }

        return []
    }


    resolveSourceFrames (source) {
        const [spritesheetName, animationName] = source.split(':')
        const spritesheet = this.textureSystem?.getSpritesheet(spritesheetName)

        if (!spritesheet) {
            return []
        }

        const frameNames = spritesheet.getAnimation(animationName) || []
        return frameNames.map(frameName => ({
            region: spritesheet.getRegion(frameName),
            name: frameName
        }))
    }


    resolveFrame (frameConfig) {
        if (frameConfig.region) {
            return {
                region: this.textureSystem?.getRegion(frameConfig.region),
                duration: frameConfig.duration,
                events: frameConfig.events
            }
        }

        const [spritesheetName, frameName] = frameConfig.source.split(':')
        const spritesheet = this.textureSystem?.getSpritesheet(spritesheetName)

        if (!spritesheet) {
            return {region: null}
        }

        const region = spritesheet.getRegion(frameName)

        return {
            region,
            name: frameName,
            source: frameConfig.source,
            duration: frameConfig.duration,
            events: frameConfig.events
        }
    }


    play (name) {
        if (this.current) {
            this.current.stop()
        }

        this.current = this.getChild(name)
        this.current?.restart()

        return this.current
    }


    get (name) {
        return this.getChild(name)
    }


    update (deltaTime) {
        if (this.current) {
            this.current.update(deltaTime)
        }
    }

}


function registerFrameEvents (animation, frames) {
    frames.forEach((frame, index) => {
        if (frame.events) {
            for (const eventName of frame.events) {
                animation.addEvent(index, eventName)
            }
        }
    })
}
