export function clamp (value, min, max) {
    return Math.max(min, Math.min(max, value))
}


export function snap (value, step) {
    return Math.round(value / step) * step
}
