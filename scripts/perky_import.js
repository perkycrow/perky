#!/usr/bin/env node

import {unpack} from '../io/pack.js'
import {readFileSync, writeFileSync, mkdirSync, existsSync} from 'fs'
import path from 'path'
import {pathToFileURL} from 'url'


async function main () {
    const args = process.argv.slice(2)

    if (args.length < 2) {
        printUsage()
        process.exit(1)
    }

    const target = args[0]
    const filePath = args[1]

    if (!existsSync(filePath)) {
        console.error(`File not found: ${filePath}`)
        process.exit(1)
    }

    const config = await loadConfig(target)
    if (!config) {
        process.exit(1)
    }

    await importPerky(target, filePath, config)
}


async function loadConfig (target) {
    const configPath = `./${target}/perky.config.js`

    if (!existsSync(configPath)) {
        console.error(`Config not found: ${configPath}`)
        console.error('Create a perky.config.js in your project folder.')
        return null
    }

    const configUrl = pathToFileURL(path.resolve(configPath))
    const module = await import(configUrl.href)
    return module.default
}


async function importPerky (target, filePath, config) {
    const assetPaths = {
        animators: path.join(target, config.assets.animators),
        spritesheets: path.join(target, config.assets.spritesheets)
    }

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
        await extractAnimator(meta.name, resourceFiles, assetPaths)
    } else if (meta.type === 'spritesheet') {
        await extractSpritesheet(meta.name, resourceFiles, assetPaths)
    } else {
        console.error(`Unknown resource type: ${meta.type}`)
        process.exit(1)
    }

    console.log('')
    console.log('Done! Remember to update manifest.json if needed.')
}


function writeAsset (buffer, outPath) {
    writeFileSync(outPath, buffer)
    console.log(`  → ${outPath}`)
}


function getPngSuffix (fileName, singleAtlas) {
    if (singleAtlas) {
        return ''
    }
    const match = fileName.match(/_(\d+)\.png$/)
    return match ? `_${match[1]}` : ''
}


async function extractAnimator (name, files, paths) {
    mkdirSync(paths.animators, {recursive: true})
    mkdirSync(paths.spritesheets, {recursive: true})

    const pngFiles = files.filter(f => f.name.endsWith('.png'))
    const singleAtlas = pngFiles.length === 1

    for (const file of files) {
        const buffer = Buffer.from(await file.blob.arrayBuffer())

        if (file.name.endsWith('Animator.json')) {
            writeAsset(buffer, path.join(paths.animators, `${name}_animator.json`))
        } else if (file.name.endsWith('Spritesheet.json')) {
            writeAsset(buffer, path.join(paths.spritesheets, `${name}.json`))
        } else if (file.name.endsWith('.png')) {
            const suffix = getPngSuffix(file.name, singleAtlas)
            writeAsset(buffer, path.join(paths.spritesheets, `${name}${suffix}.png`))
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
            writeAsset(buffer, path.join(paths.spritesheets, `${name}.json`))
        } else if (file.name.endsWith('.png')) {
            const suffix = getPngSuffix(file.name, singleAtlas)
            writeAsset(buffer, path.join(paths.spritesheets, `${name}${suffix}.png`))
        }
    }
}


function printUsage () {
    console.log(`Usage: yarn perky-import <target> <file.perky>

Arguments:
  target        Project folder containing perky.config.js (e.g., den, ghast)
  file.perky    Path to the .perky file to import

Example:
  yarn perky-import den blue.perky

The script reads <target>/perky.config.js to determine asset paths.`)
}


main().catch(err => {
    console.error('Error:', err.message)
    process.exit(1)
})
