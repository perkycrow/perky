import Notifier from '../core/notifier.js'
import {parsePsd} from './psd.js'
import {calculateResizeDimensions} from './canvas.js'
import {
    findAnimationGroups,
    parseAnimationName,
    countFrames,
    extractFramesFromGroup,
    resizeFrames,
    packFramesIntoAtlases,
    compositeAtlas,
    nextPowerOfTwo,
    buildJsonData,
    MAX_ATLAS_SIZE
} from './spritesheet.js'


export default class PsdConverter extends Notifier {

    parse (buffer) {
        return parsePsd(new Uint8Array(buffer))
    }


    getAnimationGroups (psd) {
        return findAnimationGroups(psd.tree)
    }


    getAnimationInfo (psd) {
        const groups = this.getAnimationGroups(psd)
        return groups.map(group => ({
            name: parseAnimationName(group.name),
            frameCount: countFrames(group)
        }))
    }


    async convert (psd, options = {}) {
        const {
            targetWidth = null,
            targetHeight = null,
            nearest = false,
            name = psd.filename || 'sprite'
        } = options

        this.emit('progress', {stage: 'extracting', percent: 0})

        const resize = calculateResizeDimensions(
            psd.width,
            psd.height,
            targetWidth,
            targetHeight
        )

        const animGroups = this.getAnimationGroups(psd)
        let frames = []
        const animations = {}

        for (const group of animGroups) {
            const animName = parseAnimationName(group.name)
            const groupFrames = extractFramesFromGroup(group, psd.width, psd.height)
            frames = frames.concat(groupFrames)
            animations[animName] = groupFrames.map(f => f.filename)
        }

        this.emit('progress', {stage: 'resizing', percent: 20})

        frames = await resizeFrames(frames, {
            psdWidth: psd.width,
            psdHeight: psd.height,
            targetWidth: resize.width,
            targetHeight: resize.height,
            nearest
        })

        this.emit('progress', {stage: 'packing', percent: 40})

        const atlases = packFramesIntoAtlases(frames, MAX_ATLAS_SIZE)

        this.emit('progress', {stage: 'compositing', percent: 60})

        for (const atlas of atlases) {
            const usedHeight = atlas.packer.currentY
            atlas.finalHeight = nextPowerOfTwo(usedHeight)
            atlas.canvas = await compositeAtlas(
                atlas.frames,
                MAX_ATLAS_SIZE,
                atlas.finalHeight
            )
        }

        this.emit('progress', {stage: 'finalizing', percent: 80})

        const spritesheetName = `${name}Spritesheet`
        const spritesheetJson = buildJsonData(atlases, animations, name)
        const animatorConfig = this.buildAnimatorConfig(spritesheetName, animations)

        this.emit('progress', {stage: 'complete', percent: 100})

        return {
            atlases,
            spritesheetJson,
            animatorConfig,
            name,
            spritesheetName
        }
    }


    buildAnimatorConfig (spritesheetName, animations) {
        const config = {
            spritesheet: spritesheetName,
            anchor: {x: 0.5, y: 0.5},
            animations: {}
        }

        for (const [animName, frameNames] of Object.entries(animations)) {
            config.animations[animName] = {
                fps: 10,
                loop: true,
                frames: frameNames.map(frameName => ({
                    source: `${spritesheetName}:${frameName}`
                }))
            }
        }

        return config
    }

}
