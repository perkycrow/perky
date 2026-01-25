#!/usr/bin/env node

import {readFileSync, mkdirSync, writeFileSync} from 'fs'
import {parsePsd, layerToRGBA} from '../io/psd.js'
import {createCanvas, canvasToBuffer, putPixels} from '../io/canvas.js'


function printTree (nodes, indent = 0) {
    const prefix = '  '.repeat(indent)
    for (const node of nodes) {
        if (node.type === 'group') {
            console.log(`${prefix}[GROUP] ${node.name}`)
            printTree(node.children, indent + 1)
        } else {
            const {width, height, left, top} = node.layer
            console.log(`${prefix}[LAYER] "${node.name}" ${width}x${height} @ (${left}, ${top})`)
        }
    }
}


const psdPath = process.argv[2]

if (!psdPath) {
    console.log('Usage: node scripts/psd_parser_test.js <path-to-psd>')
    process.exit(1)
}

const buffer = readFileSync(psdPath)
console.log(`\nReading: ${psdPath} (${buffer.length} bytes)`)

async function main () {
    const psd = parsePsd(buffer)

    console.log('\n=== Header ===')
    console.log(`  Size: ${psd.width}x${psd.height}`)
    console.log(`  Depth: ${psd.depth}-bit`)
    console.log(`  Color mode: ${psd.colorMode}`)
    console.log(`  Color profile: ${psd.colorProfile.name}`)
    if (psd.colorProfile.isP3) {
        console.log('  ⚠ WARNING: Display P3 detected, colors may differ from sRGB')
    }
    console.log(`  Layers: ${psd.layers.length}`)

    console.log('\n=== Layer Tree ===')
    printTree(psd.tree)

    console.log('\n=== Animations ===')
    for (const [name, frames] of Object.entries(psd.animations)) {
        console.log(`  ${name}: ${frames.length} frames`)
        for (const frame of frames) {
            console.log(`    - "${frame.name}" ${frame.width}x${frame.height}`)
        }
    }


    const outputDir = 'psd/output'
    mkdirSync(outputDir, {recursive: true})

    console.log(`\n=== Exporting frames to ${outputDir}/ ===`)

    for (const [animName, frames] of Object.entries(psd.animations)) {
        for (const frame of frames) {
            const rgba = layerToRGBA(frame, psd.width, psd.height)
            if (!rgba) {
                continue
            }

            const filename = `${animName}_${frame.name.replace(/[^a-zA-Z0-9]/g, '_')}.png`
            const outputPath = `${outputDir}/${filename}`

            const canvas = await createCanvas(rgba.width, rgba.height)
            const ctx = canvas.getContext('2d')
            putPixels(ctx, {pixels: rgba.pixels, width: rgba.width, height: rgba.height})

            const pngBuffer = await canvasToBuffer(canvas)
            writeFileSync(outputPath, pngBuffer)

            console.log(`  ✓ ${filename} (${rgba.width}x${rgba.height})`)
        }
    }

    console.log('\n✓ Parse successful!')
}


main().catch(error => {
    console.error('\n✗ Parse error:', error.message)
    console.error(error.stack)
    process.exit(1)
})
