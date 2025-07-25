import Spritesheet from './spritesheet'
import {loadImage, loadJson, replaceUrlFilename, removeFileExtension, normalizeParams} from '../application/loaders'


export async function loadSpritesheetData (params) {
    const {url} = normalizeParams(params)
    const spritesheetData = {frames: [], meta: []}

    const baseJson = await loadJson(params)
    addToSpritesheetData(spritesheetData, baseJson)

    const multipacks = Array.from(baseJson.meta?.related_multi_packs || [])

    if (Array.isArray(multipacks)) {

        while (multipacks.length) {
            const multipack = multipacks.shift()
            const newJson = await loadJson({url: replaceUrlFilename(url, multipack)})

            addToSpritesheetData(spritesheetData, newJson)
        }
    }

    return spritesheetData
}


export function addToSpritesheetData (spritesheetData, newData) {
    newData.frames.forEach(frame => {
        if (newData.meta?.image) {
            frame.baseImage = newData.meta.image
        }

        if (frame.filename) {
            frame.imageName = removeFileExtension(frame.filename)
        }
    })

    spritesheetData.frames.push(...newData.frames)
    spritesheetData.meta.push(newData.meta)
}


export async function loadSpritesheet (params) {
    const spritesheetData = await loadSpritesheetData(params)
    const spritesheet = new Spritesheet(spritesheetData)

    const imagePaths = new Set()
    spritesheetData.meta.forEach(meta => {
        if (meta?.image) {
            imagePaths.add(meta.image)
        }
    })

    if (imagePaths.size > 0) {
        const {url} = normalizeParams(params)
        const imagePromises = Array.from(imagePaths).map(async imagePath => {
            const imageUrl = replaceUrlFilename(url, imagePath)
            const image = await loadImage({url: imageUrl})
            return {key: imagePath, image}
        })
        
        const loadedImages = await Promise.all(imagePromises)

        loadedImages.forEach(({key, image}) => {
            spritesheet.addImage(key, image)
        })
    }
    
    return spritesheet
}


export const threeLoaders = {
    spritesheetData: loadSpritesheetData,
    spritesheet: loadSpritesheet
} 