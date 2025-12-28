export function parseColor (colorString) {
    if (colorString.startsWith('#')) {
        const hex = colorString.substring(1)
        const r = parseInt(hex.substring(0, 2), 16) / 255
        const g = parseInt(hex.substring(2, 4), 16) / 255
        const b = parseInt(hex.substring(4, 6), 16) / 255
        return {r, g, b, a: 1}
    }
    return {r: 0, g: 0, b: 0, a: 1}
}
