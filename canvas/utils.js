
export function createEmojiImage (emoji, size = 64) {
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')
    ctx.font = `${size * 0.8}px Arial`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(emoji, size / 2, size / 2)
    
    const img = new Image()
    img.src = canvas.toDataURL()
    return img
}
