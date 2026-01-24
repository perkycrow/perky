const CSS_COLORS = {
    black: '#000000',
    white: '#ffffff',
    red: '#ff0000',
    green: '#00ff00',
    blue: '#0000ff',
    yellow: '#ffff00',
    cyan: '#00ffff',
    magenta: '#ff00ff',
    gray: '#808080',
    grey: '#808080',
    orange: '#ffa500',
    pink: '#ffc0cb',
    purple: '#800080',
    transparent: '#00000000'
}


export default class Color {

    constructor (value) {
        this.r = 0
        this.g = 0
        this.b = 0
        this.a = 1

        if (value !== undefined) {
            this.set(value)
        }
    }


    set (value) {
        if (value instanceof Color) {
            this.r = value.r
            this.g = value.g
            this.b = value.b
            this.a = value.a
        } else if (typeof value === 'string') {
            this.#parseString(value)
        } else if (typeof value === 'number') {
            this.#parseNumber(value)
        } else if (Array.isArray(value)) {
            this.#parseArray(value)
        } else if (typeof value === 'object') {
            this.#parseObject(value)
        }

        return this
    }


    #parseString (str) {
        str = str.trim().toLowerCase()

        if (CSS_COLORS[str]) {
            str = CSS_COLORS[str]
        }

        if (str.startsWith('#')) {
            this.#parseHex(str)
        } else if (str.startsWith('rgb')) {
            this.#parseRgbString(str)
        } else if (str.startsWith('hsl')) {
            this.#parseHslString(str)
        }
    }


    #parseHex (hex) {
        hex = hex.substring(1)

        if (hex.length === 3) {
            hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2]
        } else if (hex.length === 4) {
            hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3]
        }

        this.r = parseInt(hex.substring(0, 2), 16) / 255
        this.g = parseInt(hex.substring(2, 4), 16) / 255
        this.b = parseInt(hex.substring(4, 6), 16) / 255

        if (hex.length === 8) {
            this.a = parseInt(hex.substring(6, 8), 16) / 255
        } else {
            this.a = 1
        }
    }


    #parseRgbString (str) {
        const match = str.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+)\s*)?\)/)
        if (match) {
            this.r = parseInt(match[1], 10) / 255
            this.g = parseInt(match[2], 10) / 255
            this.b = parseInt(match[3], 10) / 255
            this.a = match[4] !== undefined ? parseFloat(match[4]) : 1
        }
    }


    #parseHslString (str) {
        const match = str.match(/hsla?\(\s*(\d+)\s*,\s*(\d+)%?\s*,\s*(\d+)%?\s*(?:,\s*([\d.]+)\s*)?\)/)
        if (match) {
            const h = parseInt(match[1], 10) / 360
            const s = parseInt(match[2], 10) / 100
            const l = parseInt(match[3], 10) / 100
            this.a = match[4] !== undefined ? parseFloat(match[4]) : 1

            this.#hslToRgb(h, s, l)
        }
    }


    #parseNumber (num) {
        if (num > 0xffffff) {
            this.r = ((num >> 24) & 0xff) / 255
            this.g = ((num >> 16) & 0xff) / 255
            this.b = ((num >> 8) & 0xff) / 255
            this.a = (num & 0xff) / 255
        } else {
            this.r = ((num >> 16) & 0xff) / 255
            this.g = ((num >> 8) & 0xff) / 255
            this.b = (num & 0xff) / 255
            this.a = 1
        }
    }


    #parseArray (arr) {
        this.r = arr[0] ?? 0
        this.g = arr[1] ?? 0
        this.b = arr[2] ?? 0
        this.a = arr[3] ?? 1
    }


    #parseObject (obj) {
        if ('h' in obj) {
            const h = (obj.h ?? 0) / 360
            const s = (obj.s ?? 100) / 100
            const l = (obj.l ?? 50) / 100
            this.a = obj.a ?? 1
            this.#hslToRgb(h, s, l)
        } else {
            this.r = obj.r ?? 0
            this.g = obj.g ?? 0
            this.b = obj.b ?? 0
            this.a = obj.a ?? 1
        }
    }


    #hslToRgb (h, s, l) {
        if (s === 0) {
            this.r = this.g = this.b = l
            return
        }

        const q = l < 0.5 ? l * (1 + s) : l + s - l * s
        const p = 2 * l - q

        this.r = this.#hueToRgb(p, q, h + 1 / 3)
        this.g = this.#hueToRgb(p, q, h)
        this.b = this.#hueToRgb(p, q, h - 1 / 3)
    }


    #hueToRgb (p, q, t) {
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


    toHsl () {
        const r = this.r
        const g = this.g
        const b = this.b

        const max = Math.max(r, g, b)
        const min = Math.min(r, g, b)
        const l = (max + min) / 2

        let h = 0
        let s = 0

        if (max !== min) {
            const d = max - min
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

            if (max === r) {
                h = ((g - b) / d + (g < b ? 6 : 0)) / 6
            } else if (max === g) {
                h = ((b - r) / d + 2) / 6
            } else {
                h = ((r - g) / d + 4) / 6
            }
        }

        return {
            h: Math.round(h * 360),
            s: Math.round(s * 100),
            l: Math.round(l * 100),
            a: this.a
        }
    }


    toRgb () {
        return {
            r: Math.round(this.r * 255),
            g: Math.round(this.g * 255),
            b: Math.round(this.b * 255),
            a: this.a
        }
    }


    toHex (includeAlpha = false) {
        const r = Math.round(this.r * 255).toString(16).padStart(2, '0')
        const g = Math.round(this.g * 255).toString(16).padStart(2, '0')
        const b = Math.round(this.b * 255).toString(16).padStart(2, '0')

        if (includeAlpha) {
            const a = Math.round(this.a * 255).toString(16).padStart(2, '0')
            return `#${r}${g}${b}${a}`
        }

        return `#${r}${g}${b}`
    }


    toRgbString () {
        const rgb = this.toRgb()
        if (this.a < 1) {
            return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${this.a})`
        }
        return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`
    }


    toHslString () {
        const hsl = this.toHsl()
        if (this.a < 1) {
            return `hsla(${hsl.h}, ${hsl.s}%, ${hsl.l}%, ${this.a})`
        }
        return `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`
    }


    toString () {
        return this.toHex()
    }


    clone () {
        const color = new Color()
        color.r = this.r
        color.g = this.g
        color.b = this.b
        color.a = this.a
        return color
    }


    copy (color) {
        this.r = color.r
        this.g = color.g
        this.b = color.b
        this.a = color.a
        return this
    }


    setAlpha (a) {
        this.a = a
        return this
    }


    lighten (amount) {
        const hsl = this.toHsl()
        hsl.l = Math.min(100, hsl.l + amount)
        this.set({h: hsl.h, s: hsl.s, l: hsl.l, a: this.a})
        return this
    }


    darken (amount) {
        const hsl = this.toHsl()
        hsl.l = Math.max(0, hsl.l - amount)
        this.set({h: hsl.h, s: hsl.s, l: hsl.l, a: this.a})
        return this
    }


    saturate (amount) {
        const hsl = this.toHsl()
        hsl.s = Math.min(100, hsl.s + amount)
        this.set({h: hsl.h, s: hsl.s, l: hsl.l, a: this.a})
        return this
    }


    desaturate (amount) {
        const hsl = this.toHsl()
        hsl.s = Math.max(0, hsl.s - amount)
        this.set({h: hsl.h, s: hsl.s, l: hsl.l, a: this.a})
        return this
    }


    rotate (degrees) {
        const hsl = this.toHsl()
        hsl.h = (hsl.h + degrees) % 360
        if (hsl.h < 0) {
            hsl.h += 360
        }
        this.set({h: hsl.h, s: hsl.s, l: hsl.l, a: this.a})
        return this
    }


    mix (color, ratio = 0.5) {
        const other = color instanceof Color ? color : new Color(color)
        this.r += (other.r - this.r) * ratio
        this.g += (other.g - this.g) * ratio
        this.b += (other.b - this.b) * ratio
        this.a += (other.a - this.a) * ratio
        return this
    }


    invert () {
        this.r = 1 - this.r
        this.g = 1 - this.g
        this.b = 1 - this.b
        return this
    }


    grayscale () {
        const gray = this.r * 0.299 + this.g * 0.587 + this.b * 0.114
        this.r = gray
        this.g = gray
        this.b = gray
        return this
    }


    equals (color) {
        const other = color instanceof Color ? color : new Color(color)
        return this.r === other.r &&
               this.g === other.g &&
               this.b === other.b &&
               this.a === other.a
    }


    get luminance () {
        const r = this.r <= 0.03928 ? this.r / 12.92 : ((this.r + 0.055) / 1.055) ** 2.4
        const g = this.g <= 0.03928 ? this.g / 12.92 : ((this.g + 0.055) / 1.055) ** 2.4
        const b = this.b <= 0.03928 ? this.b / 12.92 : ((this.b + 0.055) / 1.055) ** 2.4
        return 0.2126 * r + 0.7152 * g + 0.0722 * b
    }


    get isDark () {
        return this.luminance < 0.5
    }


    get isLight () {
        return this.luminance >= 0.5
    }

}
