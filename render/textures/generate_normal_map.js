export default function generateNormalMap (source, options = {}) {
    const strength = options.strength ?? 2.0
    const width = source.width
    const height = source.height

    const inputCanvas = createCanvas(width, height)
    const inputCtx = inputCanvas.getContext('2d')
    inputCtx.drawImage(source, 0, 0)
    const pixels = inputCtx.getImageData(0, 0, width, height).data

    const grid = {data: computeGrayscale(pixels, width, height), width, height}

    const outputCanvas = createCanvas(width, height)
    const outputCtx = outputCanvas.getContext('2d')
    const outputData = outputCtx.createImageData(width, height)

    applySobelFilter(grid, outputData.data, strength)

    outputCtx.putImageData(outputData, 0, 0)
    return outputCanvas
}


function createCanvas (width, height) {
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    return canvas
}


function computeGrayscale (pixels, width, height) {
    const gray = new Float32Array(width * height)

    for (let i = 0; i < gray.length; i++) {
        const offset = i * 4
        gray[i] = (pixels[offset] * 0.299 + pixels[offset + 1] * 0.587 + pixels[offset + 2] * 0.114) / 255
    }

    return gray
}


function sampleGray (grid, x, y) {
    const cx = Math.max(0, Math.min(grid.width - 1, x))
    const cy = Math.max(0, Math.min(grid.height - 1, y))
    return grid.data[cy * grid.width + cx]
}


function applySobelFilter (grid, out, strength) {
    for (let y = 0; y < grid.height; y++) {
        for (let x = 0; x < grid.width; x++) {
            const tl = sampleGray(grid, x - 1, y - 1)
            const t = sampleGray(grid, x, y - 1)
            const tr = sampleGray(grid, x + 1, y - 1)
            const l = sampleGray(grid, x - 1, y)
            const r = sampleGray(grid, x + 1, y)
            const bl = sampleGray(grid, x - 1, y + 1)
            const b = sampleGray(grid, x, y + 1)
            const br = sampleGray(grid, x + 1, y + 1)

            const dx = (tr + 2 * r + br) - (tl + 2 * l + bl)
            const dy = (bl + 2 * b + br) - (tl + 2 * t + tr)

            const nx = -dx * strength
            const ny = -dy * strength
            const nz = 1.0
            const len = Math.sqrt(nx * nx + ny * ny + nz * nz)

            const offset = (y * grid.width + x) * 4
            out[offset] = ((nx / len) * 0.5 + 0.5) * 255
            out[offset + 1] = ((ny / len) * 0.5 + 0.5) * 255
            out[offset + 2] = ((nz / len) * 0.5 + 0.5) * 255
            out[offset + 3] = 255
        }
    }
}
