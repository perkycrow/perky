const toolRegistry = new Map()


export function registerTool (Tool) {
    if (!Tool.toolId) {
        throw new Error('Tool must have a static toolId property')
    }
    toolRegistry.set(Tool.toolId, Tool)
}


export function unregisterTool (toolId) {
    toolRegistry.delete(toolId)
}


export function getTool (toolId) {
    return toolRegistry.get(toolId)
}


export function getAllTools () {
    return Array.from(toolRegistry.values())
}


export function getToolsByLocation (location) {
    return getAllTools()
        .filter(Tool => Tool.location === location)
        .sort((a, b) => (a.order || 100) - (b.order || 100))
}


export function getSidebarTools () {
    return getToolsByLocation('sidebar')
}


export function getBottomTools () {
    return getToolsByLocation('bottom')
}
