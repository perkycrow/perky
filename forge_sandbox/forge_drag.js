import {screenToRay, pickHandle, rayAxisProject, handlePositions, HANDLE_AXES} from '../forge/forge_pick.js'
import {pickGizmoArrow, GIZMO_AXES} from '../forge/forge_gizmo.js'
import {pickRotationRing, rayPlaneAngle, ROTATION_AXES} from '../forge/forge_rotation_gizmo.js'


const MIN_SCALE = 0.1


export default class ForgeDrag {

    #state = null
    #camera3d
    #canvas
    #brushSet
    #snap
    #snapAngle

    constructor ({camera3d, canvas, brushSet, snap, snapAngle}) {
        this.#camera3d = camera3d
        this.#canvas = canvas
        this.#brushSet = brushSet
        this.#snap = snap
        this.#snapAngle = snapAngle
    }


    get active () {
        return this.#state !== null
    }


    tryStart (e, selectedBrush) {
        const brush = this.#brushSet.get(selectedBrush)
        if (!brush) {
            return false
        }

        const params = {camera3d: this.#camera3d, clientX: e.clientX, clientY: e.clientY, canvas: this.#canvas}

        const arrowIndex = pickGizmoArrow({...params, center: brush.position})
        if (arrowIndex >= 0) {
            this.#startGizmo(e, brush, selectedBrush, arrowIndex)
            return true
        }

        const ringIndex = pickRotationRing({...params, center: brush.position})
        if (ringIndex >= 0) {
            this.#startRotation(e, brush, selectedBrush, ringIndex)
            return true
        }

        const handleIndex = pickHandle({...params, brush})
        if (handleIndex >= 0) {
            this.#startResize(e, brush, selectedBrush, handleIndex)
            return true
        }

        return false
    }


    move (e) {
        if (!this.#state) {
            return false
        }

        if (this.#state.mode === 'gizmo') {
            return this.#moveGizmo(e)
        }

        if (this.#state.mode === 'rotation') {
            return this.#moveRotation(e)
        }

        if (this.#state.mode === 'resize') {
            return this.#moveResize(e)
        }

        return false
    }


    end () {
        if (!this.#state) {
            return false
        }
        this.#state = null
        return true
    }


    #startGizmo (e, brush, brushIndex, arrowIndex) {
        const {axis} = GIZMO_AXES[arrowIndex]
        const {origin, direction} = screenToRay(this.#camera3d, e.clientX, e.clientY, this.#canvas)
        const startOffset = rayAxisProject({origin, direction, axisOrigin: brush.position, axisDir: axis, cameraPos: this.#camera3d.position})

        if (startOffset !== null) {
            this.#canvas.setPointerCapture(e.pointerId)
            this.#state = {
                mode: 'gizmo',
                brushIndex,
                axis,
                startOffset,
                originalPosition: brush.position.clone()
            }
        }
    }


    #startRotation (e, brush, brushIndex, axisIndex) {
        const {origin, direction} = screenToRay(this.#camera3d, e.clientX, e.clientY, this.#canvas)
        const startAngle = rayPlaneAngle({origin, direction, center: brush.position, axisIndex})

        if (startAngle !== null) {
            this.#canvas.setPointerCapture(e.pointerId)
            this.#state = {
                mode: 'rotation',
                brushIndex,
                axisIndex,
                startAngle,
                originalRotation: brush.rotation.clone()
            }
        }
    }


    #startResize (e, brush, brushIndex, handleIndex) {
        const axis = HANDLE_AXES[handleIndex]
        const positions = handlePositions(brush)
        const handlePos = positions[handleIndex]

        const {origin, direction} = screenToRay(this.#camera3d, e.clientX, e.clientY, this.#canvas)
        const startOffset = rayAxisProject({origin, direction, axisOrigin: handlePos, axisDir: axis, cameraPos: this.#camera3d.position})

        if (startOffset !== null) {
            this.#canvas.setPointerCapture(e.pointerId)
            this.#state = {
                mode: 'resize',
                brushIndex,
                handleIndex,
                axis,
                handleOrigin: handlePos,
                startOffset,
                originalPosition: brush.position.clone(),
                originalScale: brush.scale.clone()
            }
        }
    }


    #moveGizmo (e) {
        const {axis, startOffset, originalPosition, brushIndex} = this.#state
        const brush = this.#brushSet.get(brushIndex)

        const {origin, direction} = screenToRay(this.#camera3d, e.clientX, e.clientY, this.#canvas)
        const currentOffset = rayAxisProject({origin, direction, axisOrigin: originalPosition, axisDir: axis, cameraPos: this.#camera3d.position})

        if (currentOffset === null) {
            return true
        }

        const delta = currentOffset - startOffset

        brush.position.x = this.#snap(originalPosition.x + axis.x * delta)
        brush.position.y = this.#snap(originalPosition.y + axis.y * delta)
        brush.position.z = this.#snap(originalPosition.z + axis.z * delta)

        return true
    }


    #moveRotation (e) {
        const {axisIndex, startAngle, originalRotation, brushIndex} = this.#state
        const brush = this.#brushSet.get(brushIndex)

        const {origin, direction} = screenToRay(this.#camera3d, e.clientX, e.clientY, this.#canvas)
        const currentAngle = rayPlaneAngle({origin, direction, center: brush.position, axisIndex})

        if (currentAngle === null) {
            return true
        }

        const delta = currentAngle - startAngle
        const component = rotationComponent(axisIndex)
        brush.rotation[component] = this.#snapAngle(originalRotation[component] + delta)

        return true
    }


    #moveResize (e) {
        const {axis, handleOrigin, startOffset, originalPosition, originalScale, brushIndex} = this.#state
        const brush = this.#brushSet.get(brushIndex)

        const {origin, direction} = screenToRay(this.#camera3d, e.clientX, e.clientY, this.#canvas)
        const currentOffset = rayAxisProject({origin, direction, axisOrigin: handleOrigin, axisDir: axis, cameraPos: this.#camera3d.position})

        if (currentOffset === null) {
            return true
        }

        const delta = currentOffset - startOffset
        const sign = axis.x + axis.y + axis.z

        const axisIndex = getAxisIndex(axis)
        const originalAxisScale = originalScale.getComponent(axisIndex)

        const newScale = Math.max(MIN_SCALE, this.#snap(originalAxisScale + delta * sign))
        const scaleDiff = newScale - originalAxisScale

        brush.scale.setComponent(axisIndex, newScale)
        brush.position.setComponent(
            axisIndex,
            originalPosition.getComponent(axisIndex) + scaleDiff * sign / 2
        )

        return true
    }

}


function getAxisIndex (axis) {
    if (Math.abs(axis.x) === 1) {
        return 0
    }
    if (Math.abs(axis.y) === 1) {
        return 1
    }
    return 2
}


function rotationComponent (axisIndex) {
    if (ROTATION_AXES[axisIndex].axis.x) {
        return 'x'
    }
    if (ROTATION_AXES[axisIndex].axis.y) {
        return 'y'
    }
    return 'z'
}
