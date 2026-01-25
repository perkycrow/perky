#!/usr/bin/env node

import {pack, unpack} from '../io/pack.js'
import {readFileSync, writeFileSync, mkdirSync} from 'fs'
import path from 'path'


const MIME_TYPES = {
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
    '.gif': 'image/gif',
    '.mp3': 'audio/mpeg',
    '.ogg': 'audio/ogg',
    '.wav': 'audio/wav'
}


function getMimeType (filepath) {
    const ext = path.extname(filepath).toLowerCase()
    return MIME_TYPES[ext] || 'application/octet-stream'
}


async function packFiles (inputFiles, outputPath) {
    const files = inputFiles.map(filepath => {
        const content = readFileSync(filepath)
        const name = path.basename(filepath)
        return {
            name,
            blob: new Blob([content], {type: getMimeType(filepath)})
        }
    })

    console.log('Packing:')
    for (const f of files) {
        console.log(`  ${f.name} (${f.blob.size} bytes)`)
    }

    const packed = await pack(files)
    const buffer = Buffer.from(await packed.arrayBuffer())
    writeFileSync(outputPath, buffer)

    console.log(`\n→ ${outputPath} (${buffer.length} bytes)`)
}


async function unpackFile (inputPath, outputDir) {
    mkdirSync(outputDir, {recursive: true})

    const content = readFileSync(inputPath)
    const unpacked = await unpack(new Blob([content]))

    console.log(`Unpacking ${inputPath}:`)
    for (const file of unpacked) {
        const outPath = path.join(outputDir, file.name)
        const buffer = Buffer.from(await file.blob.arrayBuffer())
        writeFileSync(outPath, buffer)
        console.log(`  → ${outPath} (${buffer.length} bytes)`)
    }
}


const args = process.argv.slice(2)

if (args.length < 2) {
    console.log(`Usage:
  Pack:   node scripts/perky_packer.js <file1> <file2> ... -o <output.perky>
  Unpack: node scripts/perky_packer.js -u <input.perky> -o <output_dir>`)
    process.exit(1)
}

const outputIndex = args.indexOf('-o')
const unpackIndex = args.indexOf('-u')

if (unpackIndex === -1 && outputIndex === -1) {
    console.error('Missing -o option')
    process.exit(1)
} else if (unpackIndex >= 0) {
    const inputPath = args[unpackIndex + 1]
    const outputDir = outputIndex >= 0 ? args[outputIndex + 1] : '.'
    unpackFile(inputPath, outputDir).catch(err => {
        console.error('Error:', err.message)
        process.exit(1)
    })
} else {
    const outputPath = args[outputIndex + 1]
    const inputFiles = args.slice(0, outputIndex)
    packFiles(inputFiles, outputPath).catch(err => {
        console.error('Error:', err.message)
        process.exit(1)
    })
}
