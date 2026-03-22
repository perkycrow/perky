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

    await updatePerky(target, filePath, config)
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


async function updatePerky (target, filePath, config) {
    const assets = config.assets || {}
    const assetPaths = {
        animators: assets.animators ? path.join(target, assets.animators) : null,
        spritesheets: assets.spritesheets ? path.join(target, assets.spritesheets) : null,
        scenes: assets.scenes ? path.join(target, assets.scenes) : null
    }

    console.log(`Updating ${path.basename(filePath)} → ${target}...`)
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
    const resourceFiles = files.filter(f => f.name !== 'meta.json')

    if (meta.resources) {
        for (const resource of meta.resources) {
            console.log(`${resource.type}: ${resource.name}`)

            const prefix = `${resource.name}/`
            const matched = resourceFiles
                .filter(f => f.name.startsWith(prefix))
                .map(f => ({name: f.name.slice(prefix.length), blob: f.blob}))

            await extractResource(resource.type, resource.name, matched, assetPaths)
            updateManifest(target, resource, config)
            console.log('')
        }
    } else {
        console.log(`Type: ${meta.type}`)
        console.log(`Name: ${meta.name}`)
        console.log('')

        await extractResource(meta.type, meta.name, resourceFiles, assetPaths)
        updateManifest(target, meta, config)
    }

    console.log('')
    console.log('Done!')
}


async function extractResource (type, name, files, paths) {
    if (type === 'animator') {
        await extractAnimator(name, files, paths)
    } else if (type === 'spritesheet') {
        await extractSpritesheet(name, files, paths)
    } else if (type === 'scene') {
        await extractScene(name, files, paths)
    } else {
        console.error(`Unknown resource type: ${type}`)
        process.exit(1)
    }
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


async function extractScene (name, files, paths) {
    mkdirSync(paths.scenes, {recursive: true})

    for (const file of files) {
        const buffer = Buffer.from(await file.blob.arrayBuffer())

        if (file.name.endsWith('.json')) {
            writeAsset(buffer, path.join(paths.scenes, `${name}.json`))
        }
    }
}


function updateManifest (target, meta, config) {
    const manifestPath = path.join(target, 'manifest.json')

    if (!existsSync(manifestPath)) {
        console.log('  (manifest.json not found, skipping)')
        return
    }

    const manifestText = readFileSync(manifestPath, 'utf-8')
    const manifest = JSON.parse(manifestText)

    if (!manifest.assets) {
        manifest.assets = {}
    }

    const assets = config.assets || {}
    const name = meta.name
    const updatedAt = meta.updatedAt || Date.now()

    if (meta.type === 'animator') {
        const animatorKey = `${name}Animator`
        const spritesheetKey = `${name}Spritesheet`

        manifest.assets[spritesheetKey] = {
            ...manifest.assets[spritesheetKey],
            type: 'spritesheet',
            url: `${assets.spritesheets}/${name}.json`,
            updatedAt
        }

        manifest.assets[animatorKey] = {
            ...manifest.assets[animatorKey],
            type: 'animator',
            url: `${assets.animators}/${name}_animator.json`,
            updatedAt
        }

        console.log(`  Manifest: ${animatorKey}, ${spritesheetKey}`)
    } else if (meta.type === 'spritesheet') {
        const spritesheetKey = `${name}Spritesheet`

        manifest.assets[spritesheetKey] = {
            ...manifest.assets[spritesheetKey],
            type: 'spritesheet',
            url: `${assets.spritesheets}/${name}.json`,
            updatedAt
        }

        console.log(`  Manifest: ${spritesheetKey}`)
    } else if (meta.type === 'scene') {
        manifest.assets[name] = {
            ...manifest.assets[name],
            type: 'scene',
            url: `${assets.scenes}/${name}.json`,
            updatedAt
        }

        console.log(`  Manifest: ${name}`)
    }

    manifest.version = bumpPatch(manifest.version || '0.0.0')
    console.log(`  Version: ${manifest.version}`)

    writeFileSync(manifestPath, JSON.stringify(manifest, null, 4) + '\n')
}


function bumpPatch (version) {
    const parts = version.split('.').map(Number)
    parts[2] = (parts[2] || 0) + 1
    return parts.join('.')
}


function printUsage () {
    console.log(`Usage: yarn perky-update <target> <file.perky>

Arguments:
  target        Project folder containing perky.config.js (e.g., den, mist)
  file.perky    Path to the .perky file to update from

Example:
  yarn perky-update den blue.perky
  yarn perky-update mist export.perky

The script reads <target>/perky.config.js to determine asset paths.`)
}


main().catch(err => {
    console.error('Error:', err.message)
    process.exit(1)
})
