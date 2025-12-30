/**
 * Traverse a scene graph and collect visible objects for rendering.
 *
 * @param {Object} object - Root object to traverse
 * @param {Map} rendererRegistry - Map of object constructor to renderer
 * @param {Object} options - Traversal options
 * @param {Object} options.camera - Camera for culling (optional)
 * @param {boolean} options.enableCulling - Enable frustum culling (default false)
 * @param {Object} options.stats - Stats object to update (optional)
 */
export function traverseAndCollect (object, rendererRegistry, options = {}) {
    const ctx = {
        rendererRegistry,
        camera: options.camera ?? null,
        enableCulling: options.enableCulling ?? false,
        stats: options.stats ?? null
    }

    traverseNode(object, ctx, 1)
}


function traverseNode (object, ctx, parentOpacity) { // eslint-disable-line complexity
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
