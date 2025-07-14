
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


export function worldToScreen ({container, worldX, worldY, worldZ = 0, camera}) {
    if (!camera) {
        return {x: 0, y: 0}
    }

    const containerSize = {
        width: container.clientWidth,
        height: container.clientHeight
    }

    const containerRect = container.getBoundingClientRect()
    
    if (!containerRect) {
        return {x: 0, y: 0}
    }
    
    if (camera.isOrthographicCamera) {
        const containerAspect = containerSize.width / containerSize.height
        const viewHeight = camera.top - camera.bottom
        const viewWidth = viewHeight * containerAspect
        
        const normalizedX = worldX / (viewWidth / 2)
        const normalizedY = worldY / (viewHeight / 2)
        
        const screenX = ((normalizedX + 1) / 2) * containerSize.width + containerRect.left
        const screenY = ((-normalizedY + 1) / 2) * containerSize.height + containerRect.top
        
        return {x: screenX, y: screenY}
    } else if (camera.isPerspectiveCamera) {
        const distance = Math.abs(camera.position.z - worldZ)
        const fov = camera.fov * Math.PI / 180
        
        const viewHeight = 2 * Math.tan(fov / 2) * distance
        const viewWidth = viewHeight * camera.aspect
        
        const normalizedX = worldX / (viewWidth / 2)
        const normalizedY = worldY / (viewHeight / 2)
        
        const screenX = ((normalizedX + 1) / 2) * containerSize.width + containerRect.left
        const screenY = ((-normalizedY + 1) / 2) * containerSize.height + containerRect.top
        
        return {x: screenX, y: screenY}
    }
    
    return {x: 0, y: 0}
}


export function getViewDimensions ({container, camera}) {
    if (!camera) {
        return {width: 0, height: 0}
    }
    
    if (camera.isOrthographicCamera) {
        const containerSize = {
            width: container.clientWidth,
            height: container.clientHeight
        }
        const containerAspect = containerSize.width / containerSize.height
        const viewHeight = camera.top - camera.bottom
        const viewWidth = viewHeight * containerAspect
        
        return {width: viewWidth, height: viewHeight}
    } else if (camera.isPerspectiveCamera) {
        const distance = Math.abs(camera.position.z)
        const fov = camera.fov * Math.PI / 180
        
        const viewHeight = 2 * Math.tan(fov / 2) * distance
        const viewWidth = viewHeight * camera.aspect
        
        return {width: viewWidth, height: viewHeight}
    }
    
    return {width: 0, height: 0}
}


export function getScreenBounds ({container, camera}) {
    const dimensions = getViewDimensions({container, camera})
    
    if (dimensions.width === 0 || dimensions.height === 0) {
        return {left: 0, right: 0, top: 0, bottom: 0}
    }
    
    return {
        left: -dimensions.width / 2,
        right: dimensions.width / 2,
        top: dimensions.height / 2,
        bottom: -dimensions.height / 2
    }
}
