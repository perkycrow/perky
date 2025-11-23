import Canvas2D from '../canvas/canvas_2d.js'
import Spritesheet from '../canvas/spritesheet.js'
import Sprite2D from '../canvas/sprite_2d.js'
import SpriteAnimation2D from '../canvas/sprite_animation_2d.js'
import Group2D from '../canvas/group_2d.js'
import { createExampleContainer } from './example_utils.js'

const { canvas } = createExampleContainer()

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

    const sheet = new Spritesheet(image, data)

    // Create sprite with initial frame
    const sprite = new Sprite2D({
        frame: sheet.getFrame('notebook-0.png'), // Using actual filename from JSON
        width: 7
    })

    scene.addChild(sprite)

    // Create animation
    const animation = new SpriteAnimation2D({
        sprite,
        frames: sheet.getFrames(),
        fps: 12,
        loop: true
    })

    sprite.addAnimation('idle', animation)
    sprite.play('idle')

    function animate(timestamp) {
        app.render(scene)
        requestAnimationFrame(animate)
    }

    requestAnimationFrame(animate)
})
