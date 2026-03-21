import {doc, section, text, code} from '../doc/runtime.js'


export default doc('Orbit Camera', () => {

    text(`
        Mouse and touch camera controller for orbiting around a target point.
        Supports rotation, zooming, panning, and pinch gestures.
    `)


    section('Usage', () => {

        text(`
            Create an OrbitCamera with a Camera3D and canvas element.
            Call \`attach()\` to start listening for input events.
        `)

        code('Basic setup', () => {
            // const camera3d = new Camera3D()
            // const orbitCamera = new OrbitCamera(camera3d, canvas)
            // orbitCamera.attach()
            //
            // // When done:
            // orbitCamera.detach()
        })

        code('Custom options', () => {
            // const orbitCamera = new OrbitCamera(camera3d, canvas, {
            //     target: new Vec3(0, 0, 0),
            //     radius: 10,
            //     theta: Math.PI / 4,
            //     phi: Math.PI / 6,
            //     minRadius: 1,
            //     maxRadius: 50,
            //     rotateSensitivity: 0.005,
            //     zoomSensitivity: 0.002,
            //     panSensitivity: 0.005
            // })
        })

    })


    section('Controls', () => {

        text(`
            - **Left drag**: Orbit around target (rotate theta/phi)
            - **Middle drag**: Pan (move target point)
            - **Scroll wheel**: Zoom in/out (change radius)
            - **Two-finger pinch**: Zoom on touch devices
            - **Two-finger drag**: Pan on touch devices
        `)

    })


    section('Spherical Coordinates', () => {

        text(`
            The camera position is computed from spherical coordinates:

            - \`theta\`: Horizontal angle (rotation around Y axis)
            - \`phi\`: Vertical angle (elevation above horizontal plane)
            - \`radius\`: Distance from target

            Use the \`update()\` method after modifying these values directly.
        `)

        code('Manual positioning', () => {
            // orbitCamera.theta = Math.PI / 2
            // orbitCamera.phi = Math.PI / 4
            // orbitCamera.radius = 15
            // orbitCamera.update()
        })

    })


    section('Interceptor', () => {

        text(`
            The \`interceptor\` property can be set to a function that receives
            pointer events. If it returns \`true\`, the orbit camera ignores
            that event. Useful for gizmo interaction or custom drag handling.
        `)

        code('Example', () => {
            // orbitCamera.interceptor = (event) => {
            //     if (isOverGizmo(event)) {
            //         handleGizmoDrag(event)
            //         return true
            //     }
            //     return false
            // }
        })

    })

})
