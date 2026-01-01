
export function traverseAndCollect (object, rendererRegistry, options = {}) {
    const ctx = {
        rendererRegistry,
        camera: options.camera ?? null,
        enableCulling: options.enableCulling ?? false,
        stats: options.stats ?? null
    }

    traverseNode(object, ctx, 1)
}


function traverseNode (object, ctx, parentOpacity) { // eslint-disable-line complexity -- clean
    if (!object.visible) {
        return
    }

    if (ctx.stats) {
        ctx.stats.totalObjects++
    }

    if (ctx.enableCulling && ctx.camera) {
        const worldBounds = object.getWorldBounds()
        if (!ctx.camera.isVisible(worldBounds)) {
            if (ctx.stats) {
                ctx.stats.culledObjects++
            }
            return
        }
    }

    if (ctx.stats) {
        ctx.stats.renderedObjects++
    }

    const effectiveOpacity = parentOpacity * object.opacity

    const renderer = ctx.rendererRegistry.get(object.constructor)
    if (renderer) {
        renderer.collect(object, effectiveOpacity, object.renderHints)
    }

    const sortedChildren = object.getSortedChildren
        ? object.getSortedChildren()
        : object.children

    for (let i = 0, len = sortedChildren.length; i < len; i++) {
        traverseNode(sortedChildren[i], ctx, effectiveOpacity)
    }
}
