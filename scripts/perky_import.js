#!/usr/bin/env node

import {unpack} from '../io/pack.js'
import {readFileSync, writeFileSync, mkdirSync, existsSync} from 'fs'
import path from 'path'


const TARGETS = {
    den: {
        root: './den/assets',
        animators: './den/assets/animators',
        spritesheets: './den/assets/spritesheets'
    },
    ghast: {
        root: './ghast/assets',
        animators: './ghast/assets/animators',
        spritesheets: './ghast/assets/spritesheets'
    }
}


async function main () {
    const args = process.argv.slice(2)

    if (args.length < 2) {
        printUsage()
        process.exit(1)
    }

    const target = args[0]
    const filePath = args[1]

    if (!TARGETS[target]) {
        console.error(`Unknown target: ${target}`)
        console.error(`Available targets: ${Object.keys(TARGETS).join(', ')}`)
        process.exit(1)
    }

    if (!existsSync(filePath)) {
        console.error(`File not found: ${filePath}`)
        process.exit(1)
    }

    await updateFromPerky(target, filePath)
}


async function updateFromPerky (target, filePath) {
    const targetPaths = TARGETS[target]

    console.log(`Importing ${path.basename(filePath)} to ${target}...`)
    console.log('')

    const content = readFileSync(filePath)
    const files = await unpack(new Blob([content]))

    const metaFile = files.find(f => f.name === 'meta.json')
    if (!metaFile) {
        console.error('Error: Invalid .perky file (missing meta.json)')
        process.exit(1)
    }

    const metaText = await metaFile.blob.text()
    const meta = JSON.parse(metaText)

    console.log(`Type: ${meta.type}`)
    console.log(`Name: ${meta.name}`)
    console.log('')

    const resourceFiles = files.filter(f => f.name !== 'meta.json')

    if (meta.type === 'animator') {
        await extractAnimator(meta.name, resourceFiles, targetPaths)
    } else if (meta.type === 'spritesheet') {
        await extractSpritesheet(meta.name, resourceFiles, targetPaths)
    } else {
        console.error(`Unknown resource type: ${meta.type}`)
        process.exit(1)
    }

    console.log('')
    console.log('Done! Remember to update manifest.json if needed.')
}


async function extractAnimator (name, files, paths) {
    mkdirSync(paths.animators, {recursive: true})
    mkdirSync(paths.spritesheets, {recursive: true})

    const pngFiles = files.filter(f => f.name.endsWith('.png'))
    const singleAtlas = pngFiles.length === 1

    for (const file of files) {
        const buffer = Buffer.from(await file.blob.arrayBuffer())

        if (file.name.endsWith('Animator.json')) {
            const outPath = path.join(paths.animators, `${name}_animator.json`)
            writeFileSync(outPath, buffer)
            console.log(`  → ${outPath}`)
        } else if (file.name.endsWith('Spritesheet.json')) {
            const outPath = path.join(paths.spritesheets, `${name}.json`)
            writeFileSync(outPath, buffer)
            console.log(`  → ${outPath}`)
        } else if (file.name.endsWith('.png')) {
            const match = file.name.match(/_(\d+)\.png$/)
            const suffix = (singleAtlas || !match) ? '' : `_${match[1]}`
            const outPath = path.join(paths.spritesheets, `${name}${suffix}.png`)
            writeFileSync(outPath, buffer)
            console.log(`  → ${outPath}`)
        }
    }
}


async function extractSpritesheet (name, files, paths) {
    mkdirSync(paths.spritesheets, {recursive: true})

    const pngFiles = files.filter(f => f.name.endsWith('.png'))
    const singleAtlas = pngFiles.length === 1

    for (const file of files) {
        const buffer = Buffer.from(await file.blob.arrayBuffer())

        if (file.name.endsWith('.json')) {
            const outPath = path.join(paths.spritesheets, `${name}.json`)
            writeFileSync(outPath, buffer)
            console.log(`  → ${outPath}`)
        } else if (file.name.endsWith('.png')) {
            const match = file.name.match(/_(\d+)\.png$/)
            const suffix = (singleAtlas || !match) ? '' : `_${match[1]}`
            const outPath = path.join(paths.spritesheets, `${name}${suffix}.png`)
            writeFileSync(outPath, buffer)
            console.log(`  → ${outPath}`)
        }
    }
}


function printUsage () {
    console.log(`Usage: yarn perky-import <target> <file.perky>

Arguments:
  target        Target game (den, ghast)
  file.perky    Path to the .perky file to import

Example:
  yarn perky-import den blue.perky

This will extract the animator/spritesheet files to:
  den/assets/animators/blue_animator.json
  den/assets/spritesheets/blue.json
  den/assets/spritesheets/blue.png`)
}


main().catch(err => {
    console.error('Error:', err.message)
    process.exit(1)
})
