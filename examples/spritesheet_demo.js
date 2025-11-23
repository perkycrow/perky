import Canvas2D from '../canvas/canvas_2d.js'
import Spritesheet2D from '../canvas/spritesheet_2d.js'
import Group2D from '../canvas/group_2d.js'
import {createExampleContainer} from './example_utils.js'

const {canvas} = createExampleContainer()

const app = new Canvas2D(canvas, {
    width: 800,
    height: 600,
    pixelRatio: window.devicePixelRatio
})

// Load assets
const image = new Image()
image.src = 'assets/spritesheets/notebook-0.png'

const loadJSON = async (url) => {
    const response = await fetch(url)
    return response.json()
}

Promise.all([
    new Promise(resolve => {
        image.onload = resolve
    }),
    loadJSON('assets/spritesheets/notebook-0.json')
]).then(([, data]) => {

    const scene = new Group2D()

    const spritesheet = new Spritesheet2D({
        image,
        data,
        x: 0,
        y: 0,
        width: 5
    })

    scene.addChild(spritesheet)

    // Animation loop
    const frames = data.frames.map(f => f.filename)
    let frameIndex = 0
    let lastTime = 0
    const fps = 12
    const interval = 1000 / fps

    function animate (timestamp) {
        if (timestamp - lastTime > interval) {
            lastTime = timestamp
            frameIndex = (frameIndex + 1) % frames.length
            spritesheet.setFrame(frames[frameIndex])
        }

        app.render(scene)
        requestAnimationFrame(animate)
    }

    requestAnimationFrame(animate)
})
