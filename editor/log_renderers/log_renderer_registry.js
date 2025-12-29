const renderers = []


export function registerLogRenderer (renderer) {
    renderers.push(renderer)
}


export function getLogRenderer (item) {
    for (const renderer of renderers) {
        if (renderer.match(item)) {
            return renderer
        }
    }
    return null
}


export function renderLogItem (item) {
    const renderer = getLogRenderer(item)
    if (renderer) {
        return renderer.render(item)
    }
    return null
}


export function clearLogRenderers () {
    renderers.length = 0
}
