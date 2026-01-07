export function parseColor (colorString) {
    if (colorString.startsWith('#')) {
        const hex = colorString.substring(1)
        const r = parseInt(hex.substring(0, 2), 16) / 255
        const g = parseInt(hex.substring(2, 4), 16) / 255
        const b = parseInt(hex.substring(4, 6), 16) / 255
        return {r, g, b, a: 1}
    }

    if (colorString.startsWith('hsl')) {
        const match = colorString.match(/hsl\(\s*(\d+)\s*,\s*(\d+)%?\s*,\s*(\d+)%?\s*\)/)
        if (match) {
            const h = parseInt(match[1], 10) / 360
            const s = parseInt(match[2], 10) / 100
            const l = parseInt(match[3], 10) / 100
            const {r, g, b} = hslToRgb(h, s, l)
            return {r, g, b, a: 1}
        }
    }

    return {r: 0, g: 0, b: 0, a: 1}
}


function hslToRgb (h, s, l) {
    if (s === 0) {
        return {r: l, g: l, b: l}
    }

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q

    return {
        r: hueToRgb(p, q, h + 1 / 3),
        g: hueToRgb(p, q, h),
        b: hueToRgb(p, q, h - 1 / 3)
    }
}


function hueToRgb (p, q, t) {
    if (t < 0) {
        t += 1
    }
    if (t > 1) {
        t -= 1
    }
    if (t < 1 / 6) {
        return p + (q - p) * 6 * t
    }
    if (t < 1 / 2) {
        return q
    }
    if (t < 2 / 3) {
        return p + (q - p) * (2 / 3 - t) * 6
    }
    return p
}
