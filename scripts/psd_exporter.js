#!/usr/bin/env node

import {exportPsd} from './psd_exporter/index.js'


function parseArgs (args) {
    const widthIdx = Math.max(args.indexOf('--width'), args.indexOf('-w'))
    const heightIdx = Math.max(args.indexOf('--height'), args.indexOf('-h'))
    const nearestIdx = Math.max(args.indexOf('--nearest'), args.indexOf('-n'))

    const psdPath = args.find(arg => !arg.startsWith('-') && !isArgValue(args, arg))

    return {
        psdPath: psdPath || null,
        width: widthIdx >= 0 ? parseInt(args[widthIdx + 1], 10) : null,
        height: heightIdx >= 0 ? parseInt(args[heightIdx + 1], 10) : null,
        nearest: nearestIdx >= 0
    }
}


function isArgValue (args, value) {
    const idx = args.indexOf(value)
    if (idx <= 0) {
        return false
    }
    const prev = args[idx - 1]
    return prev === '--width' || prev === '-w' || prev === '--height' || prev === '-h'
}


const args = process.argv.slice(2)
const options = parseArgs(args)

if (!options.psdPath) {
    console.log(`Usage: node scripts/psd_exporter.js <path-to-psd> [options]

Options:
  --width, -w <n>   Resize to width (height scales proportionally)
  --height, -h <n>  Resize to height (width scales proportionally)
  --nearest, -n     Use nearest neighbor (pixel art mode)

Examples:
  node scripts/psd_exporter.js character.psd --width 256
  node scripts/psd_exporter.js character.psd -w 256 -h 256
  node scripts/psd_exporter.js pixel_art.psd -w 128 --nearest`)
    process.exit(1)
}

exportPsd(options.psdPath, {
    width: options.width,
    height: options.height,
    nearest: options.nearest
}).catch(error => {
    console.error('Error:', error.message)
    process.exit(1)
})
