import {readFile, mkdir, writeFile} from 'fs/promises'
import {basename, dirname, join} from 'path'
import Psd from '@webtoon/psd'
import sharp from 'sharp'
import {bold, cyan, dim, green, yellow} from '../format.js'
import ShelfPacker from '../../render/textures/shelf_packer.js'


const MAX_ATLAS_SIZE = 4096
const PADDING = 1


export function printBanner () {
    console.log('')
    console.log(cyan('  ╭─────────────────────────────╮'))
    console.log(cyan('  │') + bold('       PSD EXPORTER          ') + cyan('│'))
    console.log(cyan('  ╰─────────────────────────────╯'))
    console.log(dim('  Export spritesheet from PSD'))
    console.log('')
}


export async function parsePsd (psdPath) {
    const buffer = await readFile(psdPath)
    return Psd.parse(buffer.buffer)
}


export function findAnimationGroups (psd) {
    return psd.children.filter(child => {
        return child.type === 'Group' && child.name.startsWith('anim - ')
    })
}


export function parseAnimationName (groupName) {
    return groupName.replace('anim - ', '')
}


export function parseFrameNumber (layerName) {
    const match = layerName.match(/^(\d+)\s*-/)
    return match ? match[1] : null
}


async function extractFrameData (layer, psd) {
    const pixels = await layer.composite(false)
    const layerWidth = layer.width
    const layerHeight = layer.height

    const buffer = await sharp(Buffer.from(pixels.buffer), {
        raw: {
            width: layerWidth,
            height: layerHeight,
            channels: 4
        }
    })
        .extend({
            top: layer.top,
            left: layer.left,
            bottom: psd.height - layer.top - layerHeight,
            right: psd.width - layer.left - layerWidth,
            background: {r: 0, g: 0, b: 0, alpha: 0}
        })
        .toColorspace('srgb')
        .raw()
        .toBuffer()

    return {
        buffer,
        width: psd.width,
        height: psd.height
    }
}


function packFramesIntoAtlases (frames, atlasSize) {
    const atlases = []
    let currentAtlas = {
        packer: new ShelfPacker(atlasSize, atlasSize, PADDING),
        frames: []
    }
    atlases.push(currentAtlas)

    for (const frame of frames) {
        let slot = currentAtlas.packer.pack(frame.width, frame.height)

        if (!slot) {
            currentAtlas = {
                packer: new ShelfPacker(atlasSize, atlasSize, PADDING),
                frames: []
            }
            atlases.push(currentAtlas)
            slot = currentAtlas.packer.pack(frame.width, frame.height)

            if (!slot) {
                console.log(yellow(`  ⚠ Frame too large: ${frame.filename}`))
                continue
            }
        }

        currentAtlas.frames.push({
            ...frame,
            x: slot.x,
            y: slot.y,
            atlasIndex: atlases.length - 1
        })
    }

    return atlases
}


async function compositeAtlas (packedFrames, atlasWidth, atlasHeight) {
    const compositeOperations = packedFrames.map(frame => ({
        input: frame.buffer,
        raw: {
            width: frame.width,
            height: frame.height,
            channels: 4
        },
        left: frame.x,
        top: frame.y
    }))

    const atlas = await sharp({
        create: {
            width: atlasWidth,
            height: atlasHeight,
            channels: 4,
            background: {r: 0, g: 0, b: 0, alpha: 0}
        }
    })
        .composite(compositeOperations)
        .png()
        .toBuffer()

    return atlas
}


function buildJsonData (atlases, animations, psdName) {
    const allFrames = []
    const images = []

    for (let i = 0; i < atlases.length; i++) {
        const atlas = atlases[i]
        const imageName = atlases.length === 1
            ? `${psdName}.png`
            : `${psdName}_${i}.png`

        images.push({
            filename: imageName,
            size: {
                w: MAX_ATLAS_SIZE,
                h: atlas.finalHeight
            }
        })

        for (const frame of atlas.frames) {
            allFrames.push({
                filename: frame.filename,
                frame: {
                    x: frame.x,
                    y: frame.y,
                    w: frame.width,
                    h: frame.height
                },
                sourceSize: {
                    w: frame.width,
                    h: frame.height
                },
                atlas: i
            })
        }
    }

    return {
        frames: allFrames,
        animations,
        meta: {
            app: 'perky-psd-exporter',
            version: '1.0',
            images
        }
    }
}


export async function exportPsd (psdPath) {
    printBanner()

    const psd = await parsePsd(psdPath)
    const psdName = basename(psdPath, '.psd')
    const psdDir = dirname(psdPath)
    const outputDir = join(psdDir, psdName)

    await mkdir(outputDir, {recursive: true})

    const animGroups = findAnimationGroups(psd)

    if (animGroups.length === 0) {
        console.log('No animation groups found (looking for "anim - " prefix)')
        return
    }

    console.log(`Found ${animGroups.length} animation group(s)`)

    const frames = []
    const animations = {}

    for (const group of animGroups) {
        const animName = parseAnimationName(group.name)
        console.log(`\nProcessing: ${group.name}`)

        animations[animName] = []

        const layersWithFrameNumbers = []

        for (const layer of group.children) {
            if (layer.type !== 'Layer') {
                continue
            }

            const frameNumber = parseFrameNumber(layer.name)
            if (!frameNumber) {
                console.log(`  ${yellow('⚠')} Skipping "${layer.name}" (no frame number)`)
                continue
            }

            layersWithFrameNumbers.push({
                layer,
                frameNumber: parseInt(frameNumber, 10)
            })
        }

        layersWithFrameNumbers.sort((a, b) => a.frameNumber - b.frameNumber)

        for (const {layer, frameNumber} of layersWithFrameNumbers) {
            const filename = `${animName}/${frameNumber}`

            console.log(`  ${dim('extracting')} ${filename}`)

            const frameData = await extractFrameData(layer, psd)

            frames.push({
                filename,
                buffer: frameData.buffer,
                width: frameData.width,
                height: frameData.height,
                animName,
                frameNumber
            })

            animations[animName].push(filename)
        }
    }

    if (frames.length === 0) {
        console.log(yellow('\nNo frames found to export'))
        return
    }

    console.log(`\n${dim('Packing')} ${frames.length} frames...`)

    const atlases = packFramesIntoAtlases(frames, MAX_ATLAS_SIZE)
    console.log(`  Created ${atlases.length} atlas(es)`)

    console.log(`\n${dim('Compositing...')}`)

    let totalFrames = 0

    for (let i = 0; i < atlases.length; i++) {
        const atlas = atlases[i]
        const usedHeight = atlas.packer.currentY
        atlas.finalHeight = nextPowerOfTwo(usedHeight)

        const imageName = atlases.length === 1
            ? `${psdName}.png`
            : `${psdName}_${i}.png`

        const atlasBuffer = await compositeAtlas(atlas.frames, MAX_ATLAS_SIZE, atlas.finalHeight)
        await writeFile(join(outputDir, imageName), atlasBuffer)

        console.log(`  ${green('✓')} ${imageName} (${MAX_ATLAS_SIZE}x${atlas.finalHeight}, ${atlas.frames.length} frames)`)
        totalFrames += atlas.frames.length
    }

    const jsonName = `${psdName}.json`
    const jsonData = buildJsonData(atlases, animations, psdName)
    await writeFile(join(outputDir, jsonName), JSON.stringify(jsonData, null, 2))
    console.log(`  ${green('✓')} ${jsonName}`)

    console.log('')
    console.log(green('✓') + bold(` Done! Exported ${totalFrames} frames in ${atlases.length} atlas(es)`))
    console.log(dim(`  ${outputDir}/`))
    console.log('')
}


function nextPowerOfTwo (n) {
    const powers = [16, 32, 64, 128, 256, 512, 1024, 2048, 4096]
    for (const p of powers) {
        if (p >= n) {
            return p
        }
    }
    return 4096
}
