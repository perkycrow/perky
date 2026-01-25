let nodeCanvas = null


async function getNodeCanvas () {
    if (!nodeCanvas) {
        nodeCanvas = await import(/* @vite-ignore */ 'canvas')
    }
    return nodeCanvas
}


function isNode () {
    return typeof document === 'undefined'
}


export async function createCanvas (width, height) {
    if (isNode()) {
        const {createCanvas} = await getNodeCanvas()
        return createCanvas(width, height)
    }
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    return canvas
}


export async function canvasToBuffer (canvas) {
    if (isNode()) {
        return canvas.toBuffer('image/png')
    }
    return new Promise((resolve, reject) => {
        canvas.toBlob(blob => {
            if (!blob) {
                reject(new Error('Failed to create blob'))
                return
            }
            blob.arrayBuffer().then(buffer => {
                resolve(Buffer.from(buffer))
            })
        }, 'image/png')
    })
}


export async function canvasToBlob (canvas) {
    if (isNode()) {
        const buffer = canvas.toBuffer('image/png')
        return new Blob([buffer], {type: 'image/png'})
    }
    return new Promise((resolve, reject) => {
        canvas.toBlob(blob => {
            if (!blob) {
                reject(new Error('Failed to create blob'))
                return
            }
            resolve(blob)
        }, 'image/png')
    })
}


export function putPixels (ctx, pixels, width, height, x = 0, y = 0) {
    const imageData = ctx.createImageData(width, height)
    imageData.data.set(new Uint8ClampedArray(pixels.buffer, pixels.byteOffset, pixels.byteLength))
    ctx.putImageData(imageData, x, y)
}


export function calculateResizeDimensions (srcWidth, srcHeight, targetWidth, targetHeight) {
    if (targetWidth && targetHeight) {
        return {width: targetWidth, height: targetHeight}
    }

    if (targetWidth) {
        const scale = targetWidth / srcWidth
        return {width: targetWidth, height: Math.round(srcHeight * scale)}
    }

    if (targetHeight) {
        const scale = targetHeight / srcHeight
        return {width: Math.round(srcWidth * scale), height: targetHeight}
    }

    return {width: srcWidth, height: srcHeight}
}


export async function resizeCanvas (sourceCanvas, targetWidth, targetHeight, nearest = false) {
    const destCanvas = await createCanvas(targetWidth, targetHeight)
    const ctx = destCanvas.getContext('2d')

    if (nearest) {
        ctx.imageSmoothingEnabled = false
    } else {
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = 'high'
    }

    ctx.drawImage(sourceCanvas, 0, 0, targetWidth, targetHeight)
    return destCanvas
}
