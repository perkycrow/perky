import {readFile, mkdir, writeFile} from 'fs/promises'
import {basename, dirname, join} from 'path'
import {bold, cyan, dim, green, yellow} from '../format.js'
import {parsePsd as parseRawPsd} from '../../io/psd.js'
import {calculateResizeDimensions, canvasToBuffer} from '../../io/canvas.js'
import {
    findAnimationGroups,
    parseAnimationName,
    parseFrameNumber,
    extractFramesFromGroup,
    resizeFrames,
    packFramesIntoAtlases,
    compositeAtlas,
    nextPowerOfTwo,
    buildJsonData,
    MAX_ATLAS_SIZE
} from '../../io/spritesheet.js'


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


function logPsdInfo (psd, resize, needsResize, nearest) {
    console.log(`Color profile: ${psd.colorProfile.name}`)
    if (psd.colorProfile.isP3) {
        console.log(yellow('⚠ WARNING: Display P3 detected, colors may differ from sRGB'))
    }
    console.log(`Source size: ${psd.width}x${psd.height}`)
    if (needsResize) {
        const mode = nearest ? 'nearest' : 'smooth'
        console.log(`Output size: ${resize.width}x${resize.height} (${mode})`)
    }
}


function processAnimationGroup (group, psdWidth, psdHeight) {
    const animName = parseAnimationName(group.name)
    console.log(`\nProcessing: ${group.name}`)

    const groupFrames = extractFramesFromGroup(group, psdWidth, psdHeight)

    for (const child of group.children) {
        if (child.type === 'layer' && !parseFrameNumber(child.name)) {
            console.log(`  ${yellow('⚠')} Skipping "${child.name}" (no frame number)`)
        }
    }

    for (const frame of groupFrames) {
        console.log(`  ${dim('extracting')} ${frame.filename}`)
    }

    return {animName, groupFrames}
}


async function writeAtlases (atlases, psdName, outputDir) {
    let totalFrames = 0

    for (let i = 0; i < atlases.length; i++) {
        const atlas = atlases[i]
        atlas.finalHeight = nextPowerOfTwo(atlas.packer.currentY)

        const imageName = atlases.length === 1
            ? `${psdName}.png`
            : `${psdName}_${i}.png`

        const atlasCanvas = await compositeAtlas(atlas.frames, MAX_ATLAS_SIZE, atlas.finalHeight)
        const atlasBuffer = await canvasToBuffer(atlasCanvas)
        await writeFile(join(outputDir, imageName), atlasBuffer)

        console.log(`  ${green('✓')} ${imageName} (${MAX_ATLAS_SIZE}x${atlas.finalHeight}, ${atlas.frames.length} frames)`)
        totalFrames += atlas.frames.length
    }

    return totalFrames
}


export async function exportPsd (psdPath, options = {}) {
    printBanner()

    const psd = await parsePsd(psdPath)
    const psdName = basename(psdPath, '.psd')
    const outputDir = join(dirname(psdPath), psdName)

    await mkdir(outputDir, {recursive: true})

    const animGroups = findAnimationGroups(psd.tree)
    if (animGroups.length === 0) {
        console.log('No animation groups found (looking for "anim" prefix)')
        return
    }

    const resize = calculateResizeDimensions(psd.width, psd.height, options.width, options.height)
    const needsResize = resize.width !== psd.width || resize.height !== psd.height

    logPsdInfo(psd, resize, needsResize, options.nearest)
    console.log(`Found ${animGroups.length} animation group(s)`)

    let frames = []
    const animations = {}

    for (const group of animGroups) {
        const {animName, groupFrames} = processAnimationGroup(group, psd.width, psd.height)
        frames = frames.concat(groupFrames)
        animations[animName] = groupFrames.map(f => f.filename)
    }

    if (frames.length === 0) {
        console.log(yellow('\nNo frames found to export'))
        return
    }

    if (needsResize) {
        frames = await resizeFrames(frames, {psdWidth: psd.width, psdHeight: psd.height, targetWidth: resize.width, targetHeight: resize.height, nearest: options.nearest})
    }

    console.log(`\n${dim('Packing')} ${frames.length} frames...`)
    const atlases = packFramesIntoAtlases(frames, MAX_ATLAS_SIZE)
    console.log(`  Created ${atlases.length} atlas(es)`)

    console.log(`\n${dim('Compositing...')}`)
    const totalFrames = await writeAtlases(atlases, psdName, outputDir)

    const jsonData = buildJsonData(atlases, animations, psdName, 'perky-psd-exporter')
    await writeFile(join(outputDir, `${psdName}.json`), JSON.stringify(jsonData, null, 2))
    console.log(`  ${green('✓')} ${psdName}.json`)

    console.log('')
    console.log(green('✓') + bold(` Done! Exported ${totalFrames} frames in ${atlases.length} atlas(es)`))
    console.log(dim(`  ${outputDir}/`))
    console.log('')
}
