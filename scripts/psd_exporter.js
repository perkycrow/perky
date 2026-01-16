#!/usr/bin/env node

import {exportPsd} from './psd_exporter/index.js'


const psdPath = process.argv[2]

if (!psdPath) {
    console.log('Usage: node scripts/psd_exporter.js <path-to-psd>')
    process.exit(1)
}

exportPsd(psdPath).catch(error => {
    console.error('Error:', error.message)
    process.exit(1)
})
