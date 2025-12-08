import WebGLCanvas2D from '../canvas/webgl_canvas_2d'
import Camera2D from '../canvas/camera_2d'
import Group2D from '../canvas/group_2d'
import Image2D from '../canvas/image_2d'
import { Pane } from 'tweakpane'

let canvas = null
let renderer = null
let camera = null
let scene = null
let sprite = null
let pane = null

const PARAMS = {
    x: 0,
    y: 0,
    scaleX: 1,
    scaleY: 1,
    rotation: 0,
    opacity: 1
}


async function init() {
    const container = document.querySelector('.example-content')

    setupCanvas(container)
    await createScene()
    setupTweakpane(container)

    render()
}


function setupCanvas(container) {
    canvas = document.createElement('canvas')
    canvas.style.border = '2px solid #333'
    canvas.style.backgroundColor = 'white'
    canvas.style.display = 'block'
    canvas.style.margin = '0 auto'
    canvas.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)'

    container.appendChild(canvas)

    camera = new Camera2D({
        unitsInView: 6
    })

    renderer = new WebGLCanvas2D({
        canvas,
        width: 800,
        height: 600,
        pixelRatio: window.devicePixelRatio || 1,
        camera,
        showGrid: true,
        gridStep: 1,
        gridOpacity: 0.2,
        gridColor: '#666666',
        backgroundColor: '#f5f5f5'
    })
}


async function createScene() {
    scene = new Group2D()

    const shroomImage = new Image()

    await new Promise((resolve, reject) => {
        shroomImage.onload = resolve
        shroomImage.onerror = reject
        shroomImage.src = 'assets/images/shroom.png'
    })

    sprite = new Image2D({
        x: PARAMS.x,
        y: PARAMS.y,
        width: 2,
        height: 2,
        image: shroomImage,
        scaleX: PARAMS.scaleX,
        scaleY: PARAMS.scaleY,
        rotation: PARAMS.rotation,
        opacity: PARAMS.opacity
    })

    scene.addChild(sprite)
}


function setupTweakpane(container) {
    const paneContainer = document.createElement('div')
    paneContainer.style.position = 'absolute'
    paneContainer.style.top = '20px'
    paneContainer.style.right = '20px'
    paneContainer.style.zIndex = '1000'
    container.style.position = 'relative'
    container.appendChild(paneContainer)

    pane = new Pane({
        title: 'Sprite Controls',
        container: paneContainer
    })

    const posFolder = pane.addFolder({
        title: 'Position',
        expanded: true
    })

    posFolder.addBinding(PARAMS, 'x', {
        min: -3,
        max: 3,
        step: 0.1
    }).on('change', updateSprite)

    posFolder.addBinding(PARAMS, 'y', {
        min: -2,
        max: 2,
        step: 0.1
    }).on('change', updateSprite)

    const scaleFolder = pane.addFolder({
        title: 'Scale',
        expanded: true
    })

    scaleFolder.addBinding(PARAMS, 'scaleX', {
        label: 'scale X',
        min: 0.1,
        max: 3,
        step: 0.1
    }).on('change', updateSprite)

    scaleFolder.addBinding(PARAMS, 'scaleY', {
        label: 'scale Y',
        min: 0.1,
        max: 3,
        step: 0.1
    }).on('change', updateSprite)

    const transformFolder = pane.addFolder({
        title: 'Transform',
        expanded: true
    })

    transformFolder.addBinding(PARAMS, 'rotation', {
        min: 0,
        max: Math.PI * 2,
        step: 0.01
    }).on('change', updateSprite)

    transformFolder.addBinding(PARAMS, 'opacity', {
        min: 0,
        max: 1,
        step: 0.01
    }).on('change', updateSprite)

    pane.addButton({
        title: 'Reset'
    }).on('click', () => {
        PARAMS.x = 0
        PARAMS.y = 0
        PARAMS.scaleX = 1
        PARAMS.scaleY = 1
        PARAMS.rotation = 0
        PARAMS.opacity = 1
        pane.refresh()
        updateSprite()
    })
}


function updateSprite() {
    sprite.x = PARAMS.x
    sprite.y = PARAMS.y
    sprite.scaleX = PARAMS.scaleX
    sprite.scaleY = PARAMS.scaleY
    sprite.rotation = PARAMS.rotation
    sprite.opacity = PARAMS.opacity

    render()
}


function render() {
    renderer.render(scene)
}


document.addEventListener('DOMContentLoaded', init)
