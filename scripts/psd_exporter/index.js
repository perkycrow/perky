import {readFile, mkdir, writeFile} from 'fs/promises'
import {basename, dirname, join} from 'path'
import {bold, cyan, dim, green, yellow} from '../format.js'
import ShelfPacker from '../../render/textures/shelf_packer.js'
import {parsePsd as parseRawPsd, layerToRGBA} from '../../io/psd.js'
import {createCanvas, canvasToBuffer, putPixels} from '../../io/canvas.js'


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
    return parseRawPsd(buffer)
}


export function findAnimationGroups (tree) {
    const groups = []

    function traverse (nodes) {
        for (const node of nodes) {
            if (node.type === 'group') {
                if (node.name.startsWith('anim - ')) {
                    groups.push(node)
                } else {
                    traverse(node.children)
                }
            }
        }
    }

    traverse(tree)
    return groups
}


export function parseAnimationName (groupName) {
    return groupName.replace('anim - ', '')
}


export function parseFrameNumber (layerName) {
    const match = layerName.match(/^(\d+)\s*-/)
    return match ? match[1] : null
}


function extractFrameData (layer, psdWidth, psdHeight) {
    const rgba = layerToRGBA(layer, psdWidth, psdHeight)
    if (!rgba) return null

    return {
        pixels: rgba.pixels,
        width: rgba.width,
        height: rgba.height
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
    const canvas = await createCanvas(atlasWidth, atlasHeight)
    const ctx = canvas.getContext('2d')

    for (const frame of packedFrames) {
        putPixels(ctx, frame.pixels, frame.width, frame.height, frame.x, frame.y)
    }

    return canvasToBuffer(canvas)
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
            version: '2.0',
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

    const animGroups = findAnimationGroups(psd.tree)

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

        for (const child of group.children) {
            if (child.type !== 'layer') {
                continue
            }

            const frameNumber = parseFrameNumber(child.name)
            if (!frameNumber) {
                console.log(`  ${yellow('⚠')} Skipping "${child.name}" (no frame number)`)
                continue
            }

            layersWithFrameNumbers.push({
                layer: child.layer,
                name: child.name,
                frameNumber: parseInt(frameNumber, 10)
            })
        }

        layersWithFrameNumbers.sort((a, b) => a.frameNumber - b.frameNumber)

        for (const {layer, frameNumber} of layersWithFrameNumbers) {
            const filename = `${animName}/${frameNumber}`

            console.log(`  ${dim('extracting')} ${filename}`)

            const frameData = extractFrameData(layer, psd.width, psd.height)
            if (!frameData) {
                console.log(`  ${yellow('⚠')} Empty frame: ${filename}`)
                continue
            }

            frames.push({
                filename,
                pixels: frameData.pixels,
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
