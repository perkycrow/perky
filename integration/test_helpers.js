export async function getPixelColor (page, locator, x, y) {
    const buffer = await locator.screenshot()
    const base64 = buffer.toString('base64')

    return page.evaluate(async ({b64, px, py}) => {
        const img = new Image()
        img.src = `data:image/png;base64,${b64}`
        await new Promise(resolve => {
            img.onload = resolve
        })

        const canvas = document.createElement('canvas')
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0)

        const targetX = px ?? Math.floor(img.width / 2)
        const targetY = py ?? Math.floor(img.height / 2)
        const data = ctx.getImageData(targetX, targetY, 1, 1).data

        return {r: data[0], g: data[1], b: data[2], a: data[3]}
    }, {b64: base64, px: x, py: y})
}
