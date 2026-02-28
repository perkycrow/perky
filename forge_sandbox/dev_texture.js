export default function createDevTexture (size = 128) {
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')

    const half = size / 2

    ctx.fillStyle = '#e07020'
    ctx.fillRect(0, 0, half, half)
    ctx.fillRect(half, half, half, half)

    ctx.fillStyle = '#404040'
    ctx.fillRect(half, 0, half, half)
    ctx.fillRect(0, half, half, half)

    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 1
    ctx.strokeRect(0.5, 0.5, size - 1, size - 1)
    ctx.strokeRect(half + 0.5, 0.5, half - 1, half - 1)
    ctx.strokeRect(0.5, half + 0.5, half - 1, half - 1)

    return canvas
}
