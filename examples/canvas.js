import Canvas2D from '../canvas/canvas_2d.js'
import Circle from '../canvas/circle.js'
import Rectangle from '../canvas/rectangle.js'
import Group2D from '../canvas/group_2d.js'
import Image2D from '../canvas/image_2d.js'

const canvas = document.getElementById('canvas')
const renderer = new Canvas2D(canvas)

const scene = new Group2D()

const sun = new Circle({
    x: -200,
    y: 150,
    radius: 40,
    color: '#FFD700',
    strokeColor: '#FFA500',
    strokeWidth: 3
})
scene.addChild(sun)

const centerGroup = new Group2D({
    x: 0,
    y: 0
})

const blueRect = new Rectangle({
    x: 0,
    y: 0,
    width: 120,
    height: 80,
    color: '#4169E1',
    strokeColor: '#000080',
    strokeWidth: 2
})

const redCircle = new Circle({
    x: 0,
    y: 0,
    radius: 30,
    color: '#DC143C',
    strokeColor: '#8B0000',
    strokeWidth: 2,
    opacity: 0.8
})

centerGroup.addChild(blueRect, redCircle)
scene.addChild(centerGroup)

const orbitGroup = new Group2D()

const planet1 = new Circle({
    x: 100,
    y: 0,
    radius: 20,
    color: '#32CD32',
    strokeWidth: 0
})

const moon = new Circle({
    x: 30,
    y: 0,
    radius: 8,
    color: '#C0C0C0',
    strokeWidth: 0
})
planet1.add(moon)

const planet2 = new Circle({
    x: 0,
    y: 100,
    radius: 25,
    color: '#FF69B4',
    strokeColor: '#FF1493',
    strokeWidth: 2
})

const planet3 = new Circle({
    x: -100,
    y: 0,
    radius: 15,
    color: '#9370DB',
    strokeWidth: 0,
    opacity: 0.7
})

orbitGroup.addChild(planet1, planet2, planet3)
scene.addChild(orbitGroup)

const rotatingSquares = new Group2D({
    x: 200,
    y: -100
})

for (let i = 0; i < 4; i++) {
    const square = new Rectangle({
        x: Math.cos(i * Math.PI / 2) * 50,
        y: Math.sin(i * Math.PI / 2) * 50,
        width: 30,
        height: 30,
        color: `hsl(${i * 90}, 70%, 50%)`,
        strokeWidth: 0,
        rotation: i * Math.PI / 4
    })
    rotatingSquares.addChild(square)
}
scene.addChild(rotatingSquares)

const logoImage = new Image()
logoImage.src = 'data:image/svg+xml,' + encodeURIComponent(`
    <svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="100" fill="#FF6B6B" rx="10"/>
        <text x="50" y="60" font-family="Arial" font-size="40" fill="white" text-anchor="middle">2D</text>
    </svg>
`)

const imageObject = new Image2D({
    x: 0,
    y: 100,
    width: 80,
    height: 80,
    image: logoImage
})
scene.addChild(imageObject)

let animationId = null
let time = 0
let isAnimating = false

function animate () {
    time += 0.016
    
    centerGroup.setRotation(time * 0.5)
    centerGroup.setScale(1 + Math.sin(time) * 0.2)
    
    orbitGroup.setRotation(-time * 0.3)
    
    rotatingSquares.setRotation(time * 2)
    rotatingSquares.children.forEach((square, i) => {
        square.setScale(1 + Math.sin(time * 2 + i) * 0.3)
    })
    
    sun.setRadius(40 + Math.sin(time * 3) * 5)
    
    redCircle.setOpacity(0.3 + Math.abs(Math.sin(time * 2)) * 0.7)

    imageObject.setRotation(time)
    
    renderer.render(scene)


    if (isAnimating) {
        animationId = requestAnimationFrame(animate)
    }
}

function startAnimation () {
    if (isAnimating) {
        isAnimating = false
        if (animationId) {
            cancelAnimationFrame(animationId)
        }
        document.getElementById('animateBtn').textContent = 'Start Animation'
    } else {
        isAnimating = true
        animate()
        document.getElementById('animateBtn').textContent = 'Stop Animation'
    }
}

function reset () {
    isAnimating = false
    if (animationId) {
        cancelAnimationFrame(animationId)
    }
    document.getElementById('animateBtn').textContent = 'Start Animation'
    
    time = 0
    centerGroup.setRotation(0).setScale(1)
    orbitGroup.setRotation(0)
    rotatingSquares.setRotation(0)
    rotatingSquares.children.forEach(square => square.setScale(1))
    sun.setRadius(40)
    redCircle.setOpacity(0.8)
    
    renderer.render(scene)
}

function createRandomShape () {
    const shapeType = Math.random() < 0.5 ? 'circle' : 'rectangle'
    const x = (Math.random() - 0.5) * 600
    const y = (Math.random() - 0.5) * 400
    const color = `hsl(${Math.random() * 360}, 70%, 50%)`
    
    if (shapeType === 'circle') {
        return new Circle({
            x,
            y,
            radius: 10 + Math.random() * 40,
            color,
            strokeWidth: Math.random() < 0.5 ? 2 : 0,
            strokeColor: '#333',
            opacity: 0.5 + Math.random() * 0.5
        })
    } else {
        return new Rectangle({
            x,
            y,
            width: 20 + Math.random() * 80,
            height: 20 + Math.random() * 80,
            color,
            strokeWidth: Math.random() < 0.5 ? 2 : 0,
            strokeColor: '#333',
            opacity: 0.5 + Math.random() * 0.5,
            rotation: Math.random() * Math.PI * 2
        })
    }
}

function addRandomShapes () {
    const randomGroup = new Group2D()
    
    for (let i = 0; i < 10; i++) {
        const shape = createRandomShape()
        randomGroup.addChild(shape)
    }
    
    scene.addChild(randomGroup)
    
    setTimeout(() => {
        scene.remove(randomGroup)
    }, 3000)
    
    renderer.render(scene)
}

document.getElementById('animateBtn').addEventListener('click', startAnimation)
document.getElementById('resetBtn').addEventListener('click', reset)
document.getElementById('randomBtn').addEventListener('click', addRandomShapes)

renderer.render(scene) 