
export function screenToWorld ({container, screenX, screenY, camera, depth = 0}) {
    if (!camera) {
        return {x: 0, y: 0, z: depth}
    }

    const containerSize = {
        width:  container.clientWidth,
        height: container.clientHeight
    }

    const containerRect = container.getBoundingClientRect()

    if (!containerRect) {
        return {x: 0, y: 0, z: depth}
    }

    const normalizedX = ((screenX - containerRect.left) / containerSize.width) * 2 - 1
    const normalizedY = -((screenY - containerRect.top) / containerSize.height) * 2 + 1
    
    if (camera.isOrthographicCamera) {
        const containerAspect = containerSize.width / containerSize.height
        const viewHeight = camera.top - camera.bottom
        const viewWidth = viewHeight * containerAspect
        
        const worldX = normalizedX * (viewWidth / 2)
        const worldY = normalizedY * (viewHeight / 2)
        
        return {x: worldX, y: worldY, z: depth}
    } else if (camera.isPerspectiveCamera) {
        const fov = camera.fov * Math.PI / 180
        const distance = Math.abs(camera.position.z - depth)
        
        const viewHeight = 2 * Math.tan(fov / 2) * distance
        const viewWidth = viewHeight * camera.aspect
        
        const worldX = normalizedX * (viewWidth / 2)
        const worldY = normalizedY * (viewHeight / 2)
        
        return {x: worldX, y: worldY, z: depth}
    }
    
    return {x: 0, y: 0, z: depth}
}
