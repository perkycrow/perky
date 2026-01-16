import {readFile, mkdir, readdir, unlink} from 'fs/promises'
import {basename, dirname, join} from 'path'
import Psd from '@webtoon/psd'
import sharp from 'sharp'
import {bold, cyan, dim, green, yellow} from '../format.js'


export function printBanner () {
    console.log('')
    console.log(cyan('  ╭─────────────────────────────╮'))
    console.log(cyan('  │') + bold('       PSD EXPORTER          ') + cyan('│'))
    console.log(cyan('  ╰─────────────────────────────╯'))
    console.log(dim('  Export animation frames from PSD'))
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


export async function exportLayer (layer, psd, outputPath) {
    const pixels = await layer.composite(false)
    const layerWidth = layer.width
    const layerHeight = layer.height

    await sharp(Buffer.from(pixels.buffer), {
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
        .png()
        .toFile(outputPath)
}


async function findExistingPngs (dir) {
    try {
        const files = await readdir(dir)
        return files.filter(f => f.endsWith('.png'))
    } catch {
        return []
    }
}


async function cleanOrphanedFiles (outputDir, exportedFiles) {
    const existingFiles = await findExistingPngs(outputDir)
    const exportedSet = new Set(exportedFiles)
    const orphaned = existingFiles.filter(f => !exportedSet.has(f))

    for (const file of orphaned) {
        await unlink(join(outputDir, file))
        console.log(`  ${yellow('✗')} ${file} (removed)`)
    }

    return orphaned.length
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

    const exportedFiles = []

    for (const group of animGroups) {
        const animName = parseAnimationName(group.name)
        console.log(`\nProcessing: ${group.name}`)

        for (const layer of group.children) {
            if (layer.type !== 'Layer') {
                continue
            }

            const frameNumber = parseFrameNumber(layer.name)
            if (!frameNumber) {
                console.log(`  Skipping "${layer.name}" (no frame number)`)
                continue
            }

            const outputName = `${psdName}_${animName}_${frameNumber}.png`
            const outputPath = join(outputDir, outputName)

            await exportLayer(layer, psd, outputPath)
            exportedFiles.push(outputName)

            console.log(`  ${green('✓')} ${outputName}`)
        }
    }

    const removedCount = await cleanOrphanedFiles(outputDir, exportedFiles)

    console.log('')
    if (removedCount > 0) {
        console.log(green('✓') + bold(` Done! (${removedCount} orphaned file${removedCount > 1 ? 's' : ''} removed)`))
    } else {
        console.log(green('✓') + bold(' Done!'))
    }
    console.log('')
}
